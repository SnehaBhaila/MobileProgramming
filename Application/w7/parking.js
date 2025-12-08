// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getDatabase, ref, set, push, update, remove, onValue, get } 
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCwv5pCTSKfnQDm9NkiWums5XhCrQAgZVQ",
    authDomain: "parking-space-f9ff6.firebaseapp.com",
    projectId: "parking-space-f9ff6", 
    databaseURL: "https://parking-space-f9ff6-default-rtdb.firebaseio.com/",
    storageBucket: "parking-space-f9ff6.firebasestorage.app",
    messagingSenderId: "983331382624",
    appId: "1:983331382624:web:38e0b4f0fa70d88bb2ea05"
  };
// init firebase
const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
const spotsRef = ref(db, "parking_spots");

// form submit
document.getElementById("parkingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("recordId").value;
  const spotName = document.getElementById("spotName").value;
  const location = document.getElementById("location").value;
  const status = document.getElementById("status").value;

  const data = { spotName, location, status };

  if (id) {
    update(ref(db, "parking_spots/" + id), data); // update existing spot
  } else {
    const newRef = push(spotsRef);
    set(newRef, data); // create new spot
  }

  document.getElementById("parkingForm").reset();
  document.getElementById("recordId").value = "";
});

// display all spots (realtime)
const spotList = document.getElementById("spotList");

onValue(spotsRef, (snapshot) => {
  spotList.innerHTML = "";

  snapshot.forEach((child) => {
    const data = child.val();
    const id = child.key;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.spotName}</strong><br>*
      Location: ${data.location}<br>
      Status: <b>${data.status}</b>

      <div class="actions">
        <button class="update-btn" onclick="editSpot('${id}', '${data.spotName}', '${data.location}', '${data.status}')">Update</button>
        <button class="delete-btn" onclick="deleteSpot('${id}')">Delete</button>
      </div>
    `;

    spotList.appendChild(li);
  });
});

// UPDATE function
window.editSpot = function(id, spotName, location, status) {
  document.getElementById("recordId").value = id;
  document.getElementById("spotName").value = spotName;
  document.getElementById("location").value = location;
  document.getElementById("status").value = status;
};

// DELETE function
window.deleteSpot = function(id) {
  remove(ref(db, "parking_spots/" + id));
};
