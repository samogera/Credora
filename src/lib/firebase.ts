// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "credora-xdedz",
  appId: "1:903616132581:web:80921e5927eaf3da3eab0c",
  storageBucket: "credora-xdedz.appspot.com",
  apiKey: "AIzaSyCljaSJdTYGPJ6SbufEEzaQNGTmSDc5A0A",
  authDomain: "credora-xdedz.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "903616132581",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
