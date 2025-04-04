// src/assets/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCckNmVNGVTnIip0MviKnrgH7PC7m19ZpA",
  authDomain: "market-2-ee076.firebaseapp.com",
  projectId: "market-2-ee076",
  storageBucket: "market-2-ee076.firebasestorage.app",
  messagingSenderId: "80577531336",
  appId: "1:80577531336:web:6131e0cc245e66d7f8c4fd",
  measurementId: "G-NDS7BK1BH9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };