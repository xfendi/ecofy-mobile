import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBryQaZBEbwEb6Ry4QOo4lZA1FxkpdNABc",
  authDomain: "ecofy-c5818.firebaseapp.com",
  projectId: "ecofy-c5818",
  storageBucket: "ecofy-c5818.firebasestorage.app",
  messagingSenderId: "809034977854",
  appId: "1:809034977854:web:7dec6c7a0418146e5db76f",
  measurementId: "G-QL65760CJJ",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
