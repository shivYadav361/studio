
'use client';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "medipoint-akoz6",
  "appId": "1:47680034904:web:a0594bfde08b409bd5d22d",
  "storageBucket": "medipoint-akoz6.firebasestorage.app",
  "apiKey": "AIzaSyBA9mZh28RAjlsjEws0QNdsqDFCadFhFaM",
  "authDomain": "medipoint-akoz6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "47680034904"
};
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
