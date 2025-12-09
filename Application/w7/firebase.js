// js/firebase.js
// Initializes Firebase and exports auth & db for other modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/*
  REPLACE the values below with your Firebase project's config from:
  Project Settings -> Your apps -> Config
*/
 const firebaseConfig = {
    apiKey: "AIzaSyCwv5pCTSKfnQDm9NkiWums5XhCrQAgZVQ",
    authDomain: "parking-space-f9ff6.firebaseapp.com",
    projectId: "parking-space-f9ff6", 
    databaseURL: "https://parking-space-f9ff6-default-rtdb.firebaseio.com/",
    storageBucket: "parking-space-f9ff6.firebasestorage.app",
    messagingSenderId: "983331382624",
    appId: "1:983331382624:web:38e0b4f0fa70d88bb2ea05"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
