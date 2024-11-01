import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_APIKEY
const appId = process.env.EXPO_PUBLIC_FIREBASE_APPID

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "ecofy-c5818.firebaseapp.com",
  projectId: "ecofy-c5818",
  storageBucket: "ecofy-c5818.firebasestorage.app",
  messagingSenderId: "809034977854",
  appId: appId,
  measurementId: "G-QL65760CJJ",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);