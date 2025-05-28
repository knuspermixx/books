import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9byEf5M6N4xHvP2eSkzzPsU6HeisiOfQ",
  authDomain: "books-72d4b.firebaseapp.com",
  projectId: "books-72d4b",
  storageBucket: "books-72d4b.firebasestorage.app",
  messagingSenderId: "58329858380",
  appId: "1:58329858380:web:9c5f1d48cc03d230050fe9"
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);