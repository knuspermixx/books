import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Benutzer-Dokument in Firestore erstellen
 */
export async function createUserDocument(userId, userData) {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Benutzer-Dokument erfolgreich erstellt");
  } catch (error) {
    console.error("Fehler beim Erstellen des Benutzer-Dokuments:", error);
    throw error;
  }
}

/**
 * Benutzer-Daten aus Firestore abrufen
 */
export async function getUserDocument(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("Kein Benutzer-Dokument gefunden");
      return null;
    }
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzer-Dokuments:", error);
    throw error;
  }
}

/**
 * Benutzer-Daten in Firestore aktualisieren
 */
export async function updateUserDocument(userId, updates) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log("Benutzer-Dokument erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzer-Dokuments:", error);
    throw error;
  }
}

/**
 * Benutzername aktualisieren
 */
export async function updateUsername(userId, username) {
  try {
    await updateUserDocument(userId, { username });
    console.log("Benutzername erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzernamens:", error);
    throw error;
  }
}
