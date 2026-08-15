// ========================================
// FIREBASE CONFIGURATION
// Beats Search
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuzjB1-sTEvU2TFQ6_nrFMdPzG2cpdK9k",
    authDomain: "beats-search.firebaseapp.com",
    projectId: "beats-search",
    storageBucket: "beats-search.firebasestorage.app",
    messagingSenderId: "178625696287",
    appId: "1:178625696287:web:39612d14164ce97238bb2a"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);

export { app, auth, db };