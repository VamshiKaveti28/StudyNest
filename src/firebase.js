// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAsVT_aY-ZRTUU7Qe0-ay7L1Tsk9zqAvDw",
  authDomain: "studynest-f2ca1.firebaseapp.com",
  projectId: "studynest-f2ca1",
  storageBucket: "studynest-f2ca1.firebasestorage.app",
  messagingSenderId: "129311027415",
  appId: "1:129311027415:web:78137b948d41ec46494092",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email, password, name, role = "student") => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile to include display name
    await updateProfile(userCredential.user, {
      displayName: name,
    });

    // Create user profile in 'profiles' collection
    const userProfile = {
      userId: userCredential.user.uid,
      name,
      email,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "profiles", userCredential.user.uid), userProfile);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export { auth, db, onAuthStateChanged };
