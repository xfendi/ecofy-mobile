import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: "ecofy-c5818.firebaseapp.com",
  projectId: "ecofy-c5818",
  storageBucket: "ecofy-c5818.firebasestorage.app",
  messagingSenderId: "809034977854",
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: "G-QL65760CJJ",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
