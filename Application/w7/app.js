// app.js (type="module")
import { auth, db } from "./firebase.js"; // your firebase.js must export `auth` and `db` or these will be undefined
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
  child
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ---------- Wait for DOM ---------- */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded — starting app");
  startApp();
});

function startApp() {
  /* ---------- DOM refs (safe) ---------- */
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const addForm = document.getElementById("addForm");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");

  const spotName = document.getElementById("spotName");
  const spotLocation = document.getElementById("spotLocation");
  const spotStatus = document.getElementById("spotStatus");
  const pickLocationBtn = document.getElementById("pickLocationBtn");

  const spotsList = document.getElementById("spotsList");
  const spotsCount = document.getElementById("spotsCount");

  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");

  const detailName = document.getElementById("detailName");
  const detailLocation = document.getElementById("detailLocation");
  const detailStatus = document.getElementById("detailStatus");

  const bookBtn = document.getElementById("bookBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  const toastEl = document.getElementById("toast");

  if (!document.getElementById("map")) {
    console.error("No #map element found in DOM");
    showToast("Map element missing — check HTML");
    return;
  }

  /* ---------- Toast helper ---------- */
  function showToast(msg, ms = 2500) {
    if (!toastEl) { console.log("TOAST:", msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden");
    setTimeout(() => toastEl.classList.add("hidden"), ms);
  }

  /* ---------- Leaflet map ---------- */
  let map = null;
  let mapMarkers = {};
  let newSpotLat = null;
  let newSpotLng = null;

  function initMap() {
    try {
      map = L.map("map").setView([27.7172, 85.3240], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      // ensure correct sizing after render
      setTimeout(() => map.invalidateSize(), 300);

      // global click handler (useful for location picking)
      map.on("click", e => {
        console.log("Map clicked at", e.latlng);
        // if location picker is active, it will use map.once in enablePicker()
      });

      console.log("Leaflet initialized");
    } catch (err) {
      console.error("Leaflet init error:", err);
      showToast("Map init failed — see console");
    }
  }

  initMap();

  /* ---------- Firebase defensive setup ---------- */
  // if firebase.js didn't export auth/db, we continue with map-only functionality
  const hasFirebase = typeof auth !== "undefined" && typeof db !== "undefined";
  if (!hasFirebase) {
    console.warn("firebase.js not found or does not export auth/db. App will run map-only.");
    showToast("Running in offline mode (no Firebase)");
  }

  /* ---------- Realtime DB refs ---------- */
  const spotsRefRoot = hasFirebase ? ref(db, "parking_spots") : null;
  let spotsCache = {};

  /* ---------- Render list & markers ---------- */
  function renderSpotsList() {
    if (!spotsList) return;
    spotsList.innerHTML = "";

    const entries = Object.entries(spotsCache || {});
    spotsCount.textContent = `${entries.length} spots`;

    entries.forEach(([id, spot]) => {
      const div = document.createElement("div");
      div.className = "spot";
      div.innerHTML = `<div><strong>${escapeHtml(spot.name)}</strong><div class="meta">${escapeHtml(spot.location)}</div></div>
                       <div class="meta">${escapeHtml(spot.status)}</div>`;
      div.onclick = () => openDetails(id);
      spotsList.appendChild(div);
    });

    // markers
    if (!map) return;
    Object.values(mapMarkers).forEach(m => map.removeLayer(m));
    mapMarkers = {};

    entries.forEach(([id, spot]) => {
      if (spot.lat != null && spot.lng != null) {
        const marker = L.marker([spot.lat, spot.lng]).addTo(map);
        marker.bindPopup(`<strong>${escapeHtml(spot.name)}</strong><br>${escapeHtml(spot.location)}<br>Status: ${escapeHtml(spot.status)}`);
        mapMarkers[id] = marker;
      }
    });

    setTimeout(() => map.invalidateSize(), 200);
  }

  /* ---------- Start realtime listener (if firebase) ---------- */
  if (hasFirebase) {
    onValue(spotsRefRoot, snap => {
      spotsCache = snap.val() || {};
      renderSpotsList();
    }, err => {
      console.error("DB listener error:", err);
      showToast("Realtime DB error (see console)");
    });
  }

  /* ---------- Add spot ---------- */
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = spotName.value.trim();
      const location = spotLocation.value.trim();
      const status = spotStatus.value;

      if (!name || !location) {
        showToast("Name and location required");
        return;
      }

      if (newSpotLat == null || newSpotLng == null) {
        showToast("Pick a location on the map first (click 'Pick on map')");
        return;
      }

      if (!hasFirebase) {
        // offline: just add to local cache for demo
        const id = "local-" + Date.now();
        spotsCache[id] = { name, location, status, lat: newSpotLat, lng: newSpotLng };
        renderSpotsList();
        showToast("Spot added (local)");
        addForm.reset();
        newSpotLat = newSpotLng = null;
        return;
      }

      try {
        const newRef = push(spotsRefRoot);
        await set(newRef, {
          name, location, status, lat: newSpotLat, lng: newSpotLng, createdAt: Date.now()
        });
        showToast("Spot added");
        addForm.reset();
        newSpotLat = newSpotLng = null;
      } catch (err) {
        console.error("Error adding spot:", err);
        showToast("Failed to add spot (see console)");
      }
    });
  }

  /* ---------- Pick location button ---------- */
  if (pickLocationBtn) {
    pickLocationBtn.addEventListener("click", () => enableMapPicker());
  }

  function enableMapPicker() {
    if (!map) { showToast("Map not ready"); return; }
    showToast("Click map to pick location");
    map.once("click", e => {
      newSpotLat = e.latlng.lat;
      newSpotLng = e.latlng.lng;
      showToast(`Location selected: ${newSpotLat.toFixed(5)}, ${newSpotLng.toFixed(5)}`);
      // optional: show a temporary marker
      const tmp = L.circleMarker([newSpotLat, newSpotLng], { radius: 8 }).addTo(map);
      setTimeout(() => map.removeLayer(tmp), 4000);
    });
  }

  /* ---------- Details, book, delete (offline-safe) ---------- */
  let activeDetailId = null;

  function openDetails(id) {
    activeDetailId = id;
    const s = spotsCache[id];
    if (!s) { showToast("Spot not found"); return; }
    detailName.textContent = s.name;
    detailLocation.textContent = s.location;
    detailStatus.textContent = s.status;
    location.hash = "#details";
  }

  if (bookBtn) {
    bookBtn.addEventListener("click", async () => {
      if (!activeDetailId) return showToast("No spot selected");
      if (!hasFirebase) {
        spotsCache[activeDetailId].status = "booked";
        renderSpotsList();
        showToast("Booked (local)");
        location.hash = "#success";
        return;
      }
      try {
        await update(ref(db, `parking_spots/${activeDetailId}`), { status: "booked", bookedAt: Date.now() });
        showToast("Booked");
        location.hash = "#success";
      } catch (err) {
        console.error("Book error:", err);
        showToast("Booking failed");
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!activeDetailId) return showToast("No spot selected");
      if (!confirm("Delete this spot?")) return;
      if (!hasFirebase) {
        delete spotsCache[activeDetailId];
        renderSpotsList();
        showToast("Deleted (local)");
        location.hash = "#home";
        return;
      }
      try {
        await remove(ref(db, `parking_spots/${activeDetailId}`));
        showToast("Deleted");
        location.hash = "#home";
      } catch (err) {
        console.error("Delete error:", err);
        showToast("Delete failed");
      }
    });
  }



// Back to home from success page
const doneBtn = document.getElementById("doneBtn");
if (doneBtn) {
  doneBtn.addEventListener("click", () => {
    location.hash = "#home";
  });
}


  /* ---------- Auth handlers (basic, only if firebase) ---------- */
  if (hasFirebase) {
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value.trim());
          showToast("Signed in");
        } catch (err) {
          console.error("Sign-in error:", err);
          alert(err.message || "Sign-in failed");
        }
      });
    }

    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const cred = await createUserWithEmailAndPassword(auth, signupEmail.value.trim(), signupPassword.value.trim());
          await set(child(ref(db), `users/${cred.user.uid}`), { name: signupName.value.trim() });
          showToast("Account created");
        } catch (err) {
          console.error("Signup error:", err);
          alert(err.message || "Signup failed");
        }
      });
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userEmail.textContent = user.email || "";
        try {
          const snap = await get(child(ref(db), `users/${user.uid}`));
          userName.textContent = snap.exists() ? snap.val().name : "User";
        } catch (err) {
          console.error("User fetch error:", err);
        }
        location.hash = "#home";
      } else {
        userName.textContent = "User";
        userEmail.textContent = "";
        location.hash = "#login";
      }
    });

    if (signOutBtn) {
      signOutBtn.addEventListener("click", async () => {
        await signOut(auth);
        showToast("Signed out");
      });
    }
  } // end hasFirebase

  /* ---------- Utilities ---------- */
  function escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  }

  // simple router
  function route() {
    const hash = (location.hash || "#login").replace("#", "");
    if (hash === "") { location.hash = "#login"; return; }
    document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(`screen-${hash}`);
    if (target) target.classList.add("active");
    // resize map when showing home
    if (hash === "home" && map) setTimeout(() => map.invalidateSize(), 200);
  }
  window.addEventListener("hashchange", route);
  route();
}
