
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  "projectId": "medipoint-akoz6",
  "appId": "1:47680034904:web:a0594bfde08b409bd5d22d",
  "storageBucket": "medipoint-akoz6.firebasestorage.app",
  "apiKey": "AIzaSyBA9mZh28RAjlsjEws0QNdsqDFCadFhFaM",
  "authDomain": "medipoint-akoz6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "47680034904"
};
  
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// This ensures we have a single instance of RecaptchaVerifier on the window object
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

const generateRecaptcha = () => {
    if (typeof window === 'undefined') {
        throw new Error('reCAPTCHA can only be generated on the client.');
    }
    
    // Clear any existing verifier
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
    }

    // Always create a new verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // This callback is managed by Firebase.
        }
    });
    
    return window.recaptchaVerifier;
};

export { db, auth, generateRecaptcha };
