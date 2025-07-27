// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "credora-xdedz",
  appId: "1:903616132581:web:80921e5927eaf3da3eab0c",
  storageBucket: "credora-xdedz.firebasestorage.app",
  apiKey: "AIzaSyCljaSJdTYGPJ6SbufEEzaQNGTmSDc5A0A",
  authDomain: "credora-xdedz.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "903616132581",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
