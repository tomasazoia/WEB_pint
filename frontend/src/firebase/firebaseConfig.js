import { initializeApp } from "firebase/app";
import { getAuth, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBYjR0fHaXpF8Kn8BqPp_fugqGJIub9vBI",
  authDomain: "login-pint.firebaseapp.com",
  projectId: "login-pint",
  storageBucket: "login-pint.appspot.com",
  messagingSenderId: "993764111857",
  appId: "1:993764111857:web:8e62a7f654ce0119058050",
  measurementId: "G-ZYPTR9JDV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =getAuth(app);
export const facebookProvider = new FacebookAuthProvider();
export default app