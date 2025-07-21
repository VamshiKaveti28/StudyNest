// src/services/userService.js
import { doc, getDoc, setDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Create a user profile in the profiles collection
export const createUserProfile = async (userId, userData) => {
  try {
    const userProfileRef = doc(db, "profiles", userId);
    await setDoc(userProfileRef, {
      ...userData,
      createdAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get user role from profiles collection
export const getUserRole = async (userId) => {
  try {
    const userProfileRef = doc(db, "profiles", userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      return userProfileSnap.data().role;
    } else {
      return "student"; // Default role if no profile exists
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userProfileRef = doc(db, "profiles", userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      return {
        id: userProfileSnap.id,
        ...userProfileSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userProfileRef = doc(db, "profiles", userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      // Update existing profile
      await updateDoc(userProfileRef, {
        ...profileData,
        updatedAt: new Date(),
      });
    } else {
      // Create new profile if it doesn't exist
      await setDoc(userProfileRef, {
        ...profileData,
        userId,
        role: "student", // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
