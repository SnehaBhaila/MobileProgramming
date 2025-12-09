/* -----------------------
   IMPORTS
-------------------------*/
import { auth, db } from "./firebase.js";

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
  child,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* -----------------------
   GLOBAL VARIABLES
-------------------------*/
let currentUser = null;
let spotsCache = {};
let activeDetailId = null;

// Edit mode
let isEditing = false;

// Map variables
let map;
let mapMarkers = {};
let newSpotLat = null;
let newSpotLng = null;

/* -----------------------
   SCREEN HANDLING
-------------------------*/
const screens = {
  login: document.getElementById("screen-login"),
  signup: document.getElementById("screen-signup"),
  home: document.getElementById("screen-home"),
  details: document.getElementById("screen-details"),
  success: document.getElementById("screen-success"),
};

// Toast
const toastEl = document.getElementById("toast");
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.add("hidden"), 2000);
}

// Show screen
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");

  if (name === "home") {
    setTimeout(() => map?.invalidateSize(), 200);
  }
}

// Hash routing
function route() {
  const page = (location.hash || "#login").replace("#", "");
  if (!currentUser && page !== "login" && page !== "signup") {
    showScreen("login");
    return;
  }
  if (page in screens) showScreen(page);
  else showScreen("login");
}
window.addEventListener("hashchange", route);

/* -----------------------
   LEAFLET MAP
-------------------------*/
function initMap() {
  map = L.map("map").setView([27.7172, 85.3240], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  map.on("click", (e) => {
    if (!isEditing) {
      newSpotLat = e.latlng.lat;
      newSpotLng = e.latlng.lng;
      showToast(`Location set: ${newSpotLat.toFixed(5)}, ${newSpotLng.toFixed(5)}`);
    }
  });
}

function renderMapMarkers() {
  if (!map) return;

  Object.values(mapMarkers).forEach((m) => map.removeLayer(m));
  mapMarkers = {};

  Object.entries(spotsCache).forEach(([id, s]) => {
    if (s.lat && s.lng) {
      const marker = L.marker([s.lat, s.lng]).addTo(map);
      marker.bindPopup(
        `<strong>${escapeHtml(s.name)}</strong><br>${escapeHtml(
          s.location
        )}<br>Status: ${escapeHtml(s.status)}`
      );
      mapMarkers[id] = marker;
    }
  });
}

/* -----------------------
   FIREBASE REALTIME SPOTS
-------------------------*/
const spotsRef = ref(db, "parking_spots");

function startRealtime() {
  onValue(spotsRef, (snap) => {
    spotsCache = snap.val() || {};
    renderSpotsList();
    renderMapMarkers();
  });
}

/* -----------------------
   UI ELEMENTS
-------------------------*/
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const addForm = document.getElementById("addForm");
const bookBtn = document.getElementById("bookBtn");
const deleteBtn = document.getElementById("deleteBtn");
const editBtn = document.getElementById("editBtn");
const doneBtn = document.getElementById("doneBtn");
const backFromDetails = document.getElementById("backFromDetails");

const menuBtn = document.getElementById("menuBtn");
const sidePanel = document.getElementById("sidePanel");

/* -----------------------
   HAMBURGER MENU
-------------------------*/
menuBtn.addEventListener("click", () => {
  sidePanel.classList.toggle("open");
});

/* -----------------------
   AUTH — LOGIN / SIGNUP
-------------------------*/
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    showToast("Welcome!");
    location.hash = "#home";
  } catch (err) {
    alert(err.message);
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      signupEmail.value,
      signupPassword.value
    );
    await set(ref(db, `users/${userCred.user.uid}`), {
      name: signupName.value,
    });
    showToast("Account created");
    location.hash = "#home";
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("signOutBtn").addEventListener("click", async () => {
  await signOut(auth);
  location.hash = "#login";
});

/* -----------------------
   AUTH STATE
-------------------------*/
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    const snap = await get(child(ref(db), `users/${user.uid}`));
    userName.textContent = snap.exists() ? snap.val().name : "User";
    userEmail.textContent = user.email;
    location.hash = "#home";
  } else {
    location.hash = "#login";
  }
});

/* -----------------------
   ADD SPOT / EDIT SPOT
-------------------------*/
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = spotName.value;
  const locationTxt = spotLocation.value;
  const status = spotStatus.value;

  if (isEditing) {
    await update(ref(db, `parking_spots/${activeDetailId}`), {
      name,
      location: locationTxt,
      status,
    });
    isEditing = false;
    showToast("Spot updated");
    addForm.reset();
    return;
  }

  if (!newSpotLat) {
    return showToast("Tap on the map to pick location");
  }

  const newRef = push(spotsRef);
  await set(newRef, {
    name,
    location: locationTxt,
    status,
    lat: newSpotLat,
    lng: newSpotLng,
  });

  showToast("Spot added");
  addForm.reset();
});

/* -----------------------
   OPEN DETAILS
-------------------------*/
function openDetails(id) {
  activeDetailId = id;
  const s = spotsCache[id];

  detailName.textContent = s.name;
  detailLocation.textContent = s.location;
  detailStatus.textContent = "Status: " + s.status;

  location.hash = "#details";
}

/* -----------------------
   BUTTONS IN DETAILS
-------------------------*/
bookBtn.addEventListener("click", async () => {
  await update(ref(db, `parking_spots/${activeDetailId}`), {
    status: "booked",
    bookedBy: currentUser.uid,
  });
  location.hash = "#success";
});

deleteBtn.addEventListener("click", async () => {
  await remove(ref(db, `parking_spots/${activeDetailId}`));
  showToast("Deleted");
  location.hash = "#home";
});

editBtn.addEventListener("click", () => {
  const s = spotsCache[activeDetailId];
  spotName.value = s.name;
  spotLocation.value = s.location;
  spotStatus.value = s.status;
  isEditing = true;
  location.hash = "#home";
});

/* -----------------------
   BACK FROM DETAILS
-------------------------*/
backFromDetails.addEventListener("click", () => {
  location.hash = "#home";
});

/* -----------------------
   SUCCESS → HOME
-------------------------*/
doneBtn.addEventListener("click", () => {
  location.hash = "#home";
});

/* -----------------------
   RENDER LIST
-------------------------*/
function renderSpotsList() {
  const list = document.getElementById("spotsList");
  list.innerHTML = "";

  Object.entries(spotsCache).forEach(([id, s]) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <strong>${escapeHtml(s.name)}</strong>
      <span>${escapeHtml(s.location)}</span>
      <small>${escapeHtml(s.status)}</small>
    `;
    item.addEventListener("click", () => openDetails(id));
    list.appendChild(item);
  });

  spotsCount.textContent = Object.keys(spotsCache).length + " spots";
}

/* -----------------------
   ESCAPE HTML
-------------------------*/
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m] || m
    );
  });
}

/* -----------------------
   INITIALIZE APP
-------------------------*/
window.addEventListener("load", () => {
  initMap();
  startRealtime();
  route();
});
