// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj6tiULdAQ9IlDJG3AV3fucTOhJ8zGps4",
  authDomain: "help-desk-system-743b6.firebaseapp.com",
  projectId: "help-desk-system-743b6",
  storageBucket: "help-desk-system-743b6.firebasestorage.app",
  messagingSenderId: "957052979144",
  appId: "1:957052979144:web:edae37065a4ffee74422fd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);