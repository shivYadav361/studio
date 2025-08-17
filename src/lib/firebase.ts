
'use client';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDTWWMd5p3FUYpoOOsXpQZ5GFmOfV7WqwQ",
    authDomain: "hospital-management-7d105.firebaseapp.com",
    projectId: "hospital-management-7d105",
    storageBucket: "hospital-management-7d105.firebasestorage.app",
    messagingSenderId: "53540545971",
    appId: "1:53540545971:web:72d8c7ada6257169f857c6",
    measurementId: "G-GHPMMYENV1"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
