import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Verfügbare Buchgenres
export const BOOK_GENRES = [
  "Fantasy",
  "Science Fiction",
  "Krimi/Thriller",
  "Romance",
  "Historisch",
  "Biografie",
  "Sachbuch",
  "Horror",
  "Abenteuer",
  "Klassiker",
  "Young Adult",
  "Mystery"
];

/**
 * Zufälligen Benutzernamen generieren
 */
function generateRandomUsername() {
  const adjectives = [
    "Clever", "Magic", "Brave", "Swift", "Wise", "Lucky", "Happy", "Bright",
    "Cool", "Wild", "Free", "Bold", "Calm", "Pure", "Strong", "Quick"
  ];
  
  const nouns = [
    "Reader", "Dreamer", "Explorer", "Writer", "Thinker", "Seeker", "Hunter",
    "Walker", "Runner", "Climber", "Finder", "Creator", "Builder", "Maker"
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
}

/**
 * Benutzer-Dokument in Firestore erstellen
 */
export async function createUserDocument(userId, userData) {
  try {
    const userDocRef = doc(db, "users", userId);
    const username = generateRandomUsername();
    
    await setDoc(userDocRef, {
      ...userData,
      username,
      genres: [], // Leeres Array für Genre-Präferenzen
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

/**
 * Genre-Präferenzen aktualisieren
 */
export async function updateGenres(userId, genres) {
  try {
    await updateUserDocument(userId, { genres });
    console.log("Genre-Präferenzen erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Genre-Präferenzen:", error);
    throw error;
  }
}
