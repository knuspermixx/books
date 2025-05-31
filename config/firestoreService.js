import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
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
 * Standard-Bibliotheksregale
 */
export const DEFAULT_LIBRARY_SHELVES = [
  { id: "completed", title: "Durchgelesen", icon: "checkmark-circle-outline", color: "#4CAF50" },
  { id: "reading", title: "Aktuell dabei", icon: "book-outline", color: "#2196F3" },
  { id: "wishlist", title: "Leseliste", icon: "bookmark-outline", color: "#FF9800" },
];

/**
 * Standard-Regal-IDs (diese können nicht bearbeitet oder neu erstellt werden)
 */
export const PROTECTED_SHELF_IDS = DEFAULT_LIBRARY_SHELVES.map(shelf => shelf.id);

/**
 * Prüft ob eine Regal-ID geschützt ist
 */
function isProtectedShelf(shelfId) {
  return PROTECTED_SHELF_IDS.includes(shelfId);
}

/**
 * Prüft ob ein Regal ein Standard-Regal ist (für exklusive Logik)
 */
function isStandardShelf(shelfId) {
  return PROTECTED_SHELF_IDS.includes(shelfId);
}

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

/**
 * Benutzerstatus aktualisieren
 */
export async function updateStatus(userId, status) {
  try {
    await updateUserDocument(userId, { status });
    console.log("Benutzerstatus erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzerstatus:", error);
    throw error;
  }
}

/**
 * Profilbild URL aktualisieren
 */
export async function updateProfileImage(userId, profileImageUrl) {
  try {
    await updateUserDocument(userId, { profileImageUrl });
    console.log("Profilbild erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Profilbilds:", error);
    throw error;
  }
}

/**
 * Rezension für ein Buch erstellen
 */
export async function createReview(bookId, reviewData) {
  try {
    const reviewsRef = collection(db, "reviews");
    const reviewDoc = await addDoc(reviewsRef, {
      bookId,
      ...reviewData,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Rezension erfolgreich erstellt");
    return reviewDoc.id;
  } catch (error) {
    console.error("Fehler beim Erstellen der Rezension:", error);
    throw error;
  }
}

/**
 * Alle Rezensionen für ein Buch abrufen
 */
export async function getBookReviews(bookId) {
  try {
    const reviewsRef = collection(db, "reviews");
    // Verwende nur where-Filter ohne orderBy um Index-Anforderung zu vermeiden
    const q = query(
      reviewsRef,
      where("bookId", "==", bookId)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sortiere client-seitig nach createdAt (neueste zuerst)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return reviews;
  } catch (error) {
    console.error("Fehler beim Abrufen der Rezensionen:", error);
    throw error;
  }
}

/**
 * Rezension liken/unliken
 */
export async function toggleReviewLike(reviewId, userId) {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const reviewData = reviewDoc.data();
      const likes = reviewData.likes || [];
      const isLiked = likes.includes(userId);
      
      const updatedLikes = isLiked
        ? likes.filter(id => id !== userId)
        : [...likes, userId];
      
      await updateDoc(reviewRef, {
        likes: updatedLikes,
        updatedAt: new Date().toISOString(),
      });
      
      console.log("Rezension-Like erfolgreich aktualisiert");
      return !isLiked;
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Rezension-Likes:", error);
    throw error;
  }
}

/**
 * Rezension aktualisieren (nur eigene)
 */
export async function updateReview(reviewId, userId, updates) {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const reviewData = reviewDoc.data();
      
      // Prüfen ob der Benutzer der Ersteller ist
      if (reviewData.userId !== userId) {
        throw new Error("Nicht berechtigt, diese Rezension zu bearbeiten");
      }
      
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      console.log("Rezension erfolgreich aktualisiert");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Rezension:", error);
    throw error;
  }
}

/**
 * Rezension löschen (nur eigene)
 */
export async function deleteReview(reviewId, userId) {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const reviewData = reviewDoc.data();
      
      // Prüfen ob der Benutzer der Ersteller ist
      if (reviewData.userId !== userId) {
        throw new Error("Nicht berechtigt, diese Rezension zu löschen");
      }
      
      await deleteDoc(reviewRef);
      console.log("Rezension erfolgreich gelöscht");
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Rezension:", error);
    throw error;
  }
}

/**
 * Benutzer-Regale aus Firestore abrufen
 */
export async function getUserShelves(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.customShelves || DEFAULT_LIBRARY_SHELVES;
    } else {
      return DEFAULT_LIBRARY_SHELVES;
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzer-Regale:", error);
    throw error;
  }
}

/**
 * Neues Regal erstellen
 */
export async function createUserShelf(userId, shelfData) {
  try {
    // Prüfen ob versucht wird, ein Standard-Regal zu erstellen
    if (isProtectedShelf(shelfData.id) || 
        PROTECTED_SHELF_IDS.some(id => 
          shelfData.title?.toLowerCase() === DEFAULT_LIBRARY_SHELVES.find(s => s.id === id)?.title?.toLowerCase()
        )) {
      throw new Error("Standard-Regale können nicht erstellt werden. Bitte wählen Sie einen anderen Namen.");
    }

    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const currentShelves = userData.customShelves || DEFAULT_LIBRARY_SHELVES;
      
      // Prüfen ob bereits ein Regal mit diesem Titel existiert
      if (currentShelves.some(shelf => 
        shelf.title.toLowerCase() === shelfData.title.toLowerCase()
      )) {
        throw new Error("Ein Regal mit diesem Namen existiert bereits.");
      }
      
      const newShelf = {
        id: `custom_${Date.now()}`,
        title: shelfData.title,
        icon: shelfData.icon || "library-outline",
        color: shelfData.color || "#666666",
        count: 0,
      };
      
      const updatedShelves = [...currentShelves, newShelf];
      
      await updateDoc(userDocRef, {
        customShelves: updatedShelves,
        updatedAt: new Date().toISOString(),
      });
      
      return newShelf;
    }
  } catch (error) {
    console.error("Fehler beim Erstellen des Regals:", error);
    throw error;
  }
}

/**
 * Regal aktualisieren
 */
export async function updateUserShelf(userId, shelfId, updates) {
  try {
    // Standard-Regale können nicht bearbeitet werden
    if (isProtectedShelf(shelfId)) {
      throw new Error("Standard-Regale können nicht bearbeitet werden.");
    }

    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const currentShelves = userData.customShelves || DEFAULT_LIBRARY_SHELVES;
      
      // Prüfen ob versucht wird, einen Standard-Titel zu verwenden
      if (updates.title && PROTECTED_SHELF_IDS.some(id => 
        updates.title.toLowerCase() === DEFAULT_LIBRARY_SHELVES.find(s => s.id === id)?.title?.toLowerCase()
      )) {
        throw new Error("Dieser Name ist für Standard-Regale reserviert. Bitte wählen Sie einen anderen Namen.");
      }
      
      // Prüfen ob bereits ein anderes Regal mit diesem Titel existiert
      if (updates.title && currentShelves.some(shelf => 
        shelf.id !== shelfId && shelf.title.toLowerCase() === updates.title.toLowerCase()
      )) {
        throw new Error("Ein Regal mit diesem Namen existiert bereits.");
      }
      
      const updatedShelves = currentShelves.map(shelf => 
        shelf.id === shelfId ? { ...shelf, ...updates } : shelf
      );
      
      await updateDoc(userDocRef, {
        customShelves: updatedShelves,
        updatedAt: new Date().toISOString(),
      });
      
      return updatedShelves.find(shelf => shelf.id === shelfId);
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Regals:", error);
    throw error;
  }
}

/**
 * Regal löschen
 */
export async function deleteUserShelf(userId, shelfId) {
  try {
    // Standard-Regale können nicht gelöscht werden
    if (isProtectedShelf(shelfId)) {
      throw new Error("Standard-Regale können nicht gelöscht werden");
    }
    
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const currentShelves = userData.customShelves || DEFAULT_LIBRARY_SHELVES;
      
      const updatedShelves = currentShelves.filter(shelf => shelf.id !== shelfId);
      
      await updateDoc(userDocRef, {
        customShelves: updatedShelves,
        updatedAt: new Date().toISOString(),
      });
      
      return true;
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Regals:", error);
    throw error;
  }
}

/**
 * Buch zu einem Benutzerregal hinzufügen
 * Standard-Regale sind exklusiv - ein Buch kann nur in einem Standard-Regal sein
 * Benutzerdefinierte Regale können Bücher parallel enthalten
 */
export async function addBookToShelf(userId, shelfId, bookData) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const shelfBooks = userData.shelfBooks || {};
      
      // Initialisiere Regal-Array falls es nicht existiert
      if (!shelfBooks[shelfId]) {
        shelfBooks[shelfId] = [];
      }
      
      // Prüfe, ob das Buch bereits im Ziel-Regal ist
      const bookExists = shelfBooks[shelfId].some(book => book.id === bookData.id);
      if (bookExists) {
        throw new Error("Dieses Buch ist bereits in diesem Regal vorhanden.");
      }

      let movedFromShelf = null;
      
      // Wenn das Ziel-Regal ein Standard-Regal ist, entferne das Buch aus anderen Standard-Regalen
      if (isStandardShelf(shelfId)) {
        for (const [currentShelfId, books] of Object.entries(shelfBooks)) {
          if (currentShelfId !== shelfId && isStandardShelf(currentShelfId)) {
            const bookIndex = books.findIndex(book => book.id === bookData.id);
            if (bookIndex !== -1) {
              // Merke dir, aus welchem Regal das Buch verschoben wird
              const currentShelfData = userData.customShelves?.find(s => s.id === currentShelfId) || 
                                     DEFAULT_LIBRARY_SHELVES.find(s => s.id === currentShelfId);
              movedFromShelf = currentShelfData?.title || currentShelfId;
              
              // Entferne das Buch aus dem aktuellen Standard-Regal
              books.splice(bookIndex, 1);
              break;
            }
          }
        }
      }
      
      // Füge Buch zum Ziel-Regal hinzu
      shelfBooks[shelfId].push({
        id: bookData.id,
        title: bookData.title,
        authors: bookData.authors || [],
        imageLinks: bookData.imageLinks || {},
        addedAt: new Date().toISOString()
      });
      
      await updateDoc(userDocRef, {
        shelfBooks: shelfBooks,
        updatedAt: new Date().toISOString(),
      });
      
      return {
        success: true,
        movedFromShelf: movedFromShelf
      };
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Buches zum Regal:", error);
    throw error;
  }
}

/**
 * Buch aus einem Benutzerregal entfernen
 */
export async function removeBookFromShelf(userId, shelfId, bookId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const shelfBooks = userData.shelfBooks || {};
      
      if (shelfBooks[shelfId]) {
        shelfBooks[shelfId] = shelfBooks[shelfId].filter(book => book.id !== bookId);
        
        await updateDoc(userDocRef, {
          shelfBooks: shelfBooks,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return true;
    }
  } catch (error) {
    console.error("Fehler beim Entfernen des Buches aus dem Regal:", error);
    throw error;
  }
}

/**
 * Alle Bücher eines Benutzerregals abrufen
 */
export async function getShelfBooks(userId, shelfId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const shelfBooks = userData.shelfBooks || {};
      return shelfBooks[shelfId] || [];
    }
    
    return [];
  } catch (error) {
    console.error("Fehler beim Abrufen der Regal-Bücher:", error);
    throw error;
  }
}

/**
 * Prüfen, ob ein Buch bereits in einem bestimmten Regal ist
 */
export async function isBookInShelf(userId, shelfId, bookId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const shelfBooks = userData.shelfBooks || {};
      
      if (shelfBooks[shelfId]) {
        return shelfBooks[shelfId].some(book => book.id === bookId);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Fehler beim Prüfen der Buchexistenz im Regal:", error);
    return false;
  }
}

/**
 * Findet das Standard-Regal, in dem sich ein Buch aktuell befindet
 * Gibt null zurück, wenn das Buch in keinem Standard-Regal ist
 */
export async function findBookInStandardShelves(userId, bookId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const shelfBooks = userData.shelfBooks || {};
      
      // Durchsuche nur Standard-Regale
      for (const standardShelf of DEFAULT_LIBRARY_SHELVES) {
        const books = shelfBooks[standardShelf.id] || [];
        if (books.some(book => book.id === bookId)) {
          return {
            shelfId: standardShelf.id,
            shelfTitle: standardShelf.title
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Fehler beim Suchen des Buches in Standard-Regalen:", error);
    return null;
  }
}
