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
    console.log("🔄 Erstelle Rezension für Buch:", bookId);
    console.log("📝 Rezensionsdaten:", reviewData);
    
    // Prüfe ob bereits eine Rezension des Benutzers für dieses Buch existiert
    const existingReview = await getUserBookRating(reviewData.userId, bookId);
    if (existingReview) {
      throw new Error("Du hast bereits eine Rezension für dieses Buch abgegeben. Bitte aktualisiere deine bestehende Bewertung.");
    }
    
    const reviewsRef = collection(db, "reviews");
    const reviewDoc = await addDoc(reviewsRef, {
      bookId: String(bookId), // Stelle sicher, dass bookId als String gespeichert wird
      userId: reviewData.userId,
      username: reviewData.username,
      rating: reviewData.rating,
      text: reviewData.text || "",
      likes: [],
      isPublic: true, // Alle Rezensionen sind standardmäßig öffentlich
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log("✅ Rezension erfolgreich erstellt mit ID:", reviewDoc.id);
    console.log("📚 Für Buch-ID:", String(bookId));
    
    // Aktualisiere auch die Buchinformationen Cache (optional)
    await updateBookReviewsCache(bookId);
    
    return reviewDoc.id;
  } catch (error) {
    console.error("❌ Fehler beim Erstellen der Rezension:", error);
    throw error;
  }
}

/**
 * Cache für Buchrezensionen aktualisieren (optional - für Performance)
 */
async function updateBookReviewsCache(bookId) {
  try {
    // Lade alle Rezensionen für das Buch
    const reviews = await getBookReviews(bookId);
    
    // Berechne Durchschnittsbewertung
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    // Speichere in books cache collection (optional)
    const bookCacheRef = doc(db, "bookCache", String(bookId));
    await setDoc(bookCacheRef, {
      bookId: String(bookId),
      reviewCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10, // Runde auf 1 Dezimalstelle
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log(`📊 Buch-Cache für ${bookId} aktualisiert: ${reviews.length} Rezensionen, ⭐ ${averageRating.toFixed(1)}`);
  } catch (error) {
    console.warn("Warnung: Buch-Cache konnte nicht aktualisiert werden:", error);
    // Dies ist nicht kritisch, daher nicht werfen
  }
}

/**
 * Alle Rezensionen für ein Buch abrufen
 */
export async function getBookReviews(bookId) {
  try {
    console.log("🔍 Lade Rezensionen für Buch-ID:", bookId);
    
    const reviewsRef = collection(db, "reviews");
    // Verwende nur where-Filter ohne orderBy um Index-Anforderung zu vermeiden
    const q = query(
      reviewsRef,
      where("bookId", "==", String(bookId)) // Stelle sicher, dass als String gesucht wird
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    console.log("📊 Anzahl gefundener Rezensionen:", querySnapshot.docs.length);
    
    // Sammle alle UserIds um zusätzliche Benutzerinformationen zu laden
    const userIds = new Set();
    const reviewsData = [];
    
    querySnapshot.forEach((doc) => {
      const reviewData = doc.data();
      console.log("📝 Gefundene Rezension:", {
        id: doc.id,
        bookId: reviewData.bookId,
        userId: reviewData.userId,
        username: reviewData.username,
        rating: reviewData.rating
      });
      
      reviewsData.push({
        id: doc.id,
        ...reviewData
      });
      
      userIds.add(reviewData.userId);
    });
    
    // Lade zusätzliche Benutzerinformationen wenn nötig
    const userCache = {};
    for (const userId of userIds) {
      try {
        const userData = await getUserDocument(userId);
        if (userData) {
          userCache[userId] = {
            username: userData.username,
            profileImageUrl: userData.profileImageUrl
          };
        }
      } catch (error) {
        console.warn(`Konnte Benutzerdaten für ${userId} nicht laden:`, error);
      }
    }
    
    // Bereichere Reviews mit aktuellen Benutzerdaten
    reviewsData.forEach((reviewData) => {
      const cachedUser = userCache[reviewData.userId];
      if (cachedUser) {
        reviewData.username = cachedUser.username || reviewData.username;
        reviewData.profileImageUrl = cachedUser.profileImageUrl;
      }
      
      reviews.push(reviewData);
    });
    
    // Sortiere client-seitig nach createdAt (neueste zuerst)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log("✅ Rezensionen erfolgreich geladen:", reviews.length);
    return reviews;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Rezensionen:", error);
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
      
      console.log("✅ Rezension erfolgreich aktualisiert");
      
      // Aktualisiere auch den Buch-Cache
      await updateBookReviewsCache(reviewData.bookId);
      
      return true;
    } else {
      throw new Error("Rezension nicht gefunden");
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
      
      const bookId = reviewData.bookId; // Speichere bookId vor dem Löschen
      
      await deleteDoc(reviewRef);
      console.log("✅ Rezension erfolgreich gelöscht");
      
      // Aktualisiere auch den Buch-Cache
      await updateBookReviewsCache(bookId);
      
      return true;
    } else {
      throw new Error("Rezension nicht gefunden");
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Rezension:", error);
    throw error;
  }
}

/**
 * Buchstatistiken aus Cache abrufen
 */
export async function getBookStats(bookId) {
  try {
    const bookCacheRef = doc(db, "bookCache", String(bookId));
    const bookCacheSnap = await getDoc(bookCacheRef);
    
    if (bookCacheSnap.exists()) {
      return bookCacheSnap.data();
    }
    
    // Falls kein Cache existiert, berechne live
    const reviews = await getBookReviews(bookId);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    return {
      bookId: String(bookId),
      reviewCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Fehler beim Abrufen der Buchstatistiken:", error);
    return {
      bookId: String(bookId),
      reviewCount: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString()
    };
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
        isPrivate: shelfData.isPrivate || false,
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
      
      // Bestimme ob das Ziel-Regal privat ist
      const allShelves = userData.customShelves || DEFAULT_LIBRARY_SHELVES;
      const targetShelf = allShelves.find(shelf => shelf.id === shelfId);
      const isPrivateShelf = targetShelf?.isPrivate || false;
      
      // Füge Buch zum Ziel-Regal hinzu
      shelfBooks[shelfId].push({
        id: bookData.id,
        title: bookData.title,
        authors: bookData.authors || [],
        imageLinks: bookData.imageLinks || {},
        isPrivate: isPrivateShelf,
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

/**
 * Bewertung eines Benutzers für ein spezifisches Buch abrufen
 */
export async function getUserBookRating(userId, bookId) {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("bookId", "==", String(bookId)),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const reviewDoc = querySnapshot.docs[0];
      const reviewData = reviewDoc.data();
      return {
        rating: reviewData.rating,
        reviewId: reviewDoc.id,
        text: reviewData.text || "",
        createdAt: reviewData.createdAt,
        isPublic: reviewData.isPublic !== false // Standard ist true
      };
    }
    
    return null;
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerbewertung:", error);
    return null;
  }
}

/**
 * Prüfe ob ein Benutzer bereits eine Rezension für ein Buch geschrieben hat
 */
export async function hasUserReviewedBook(userId, bookId) {
  try {
    const rating = await getUserBookRating(userId, bookId);
    return rating !== null;
  } catch (error) {
    console.error("Fehler beim Prüfen der Benutzerrezension:", error);
    return false;
  }
}

/**
 * Alle öffentlichen Rezensionen für ein Buch abrufen (für andere Benutzer)
 */
export async function getPublicBookReviews(bookId, excludeUserId) {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("bookId", "==", String(bookId)),
      where("isPublic", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    // Sammle alle UserIds um zusätzliche Benutzerinformationen zu laden
    const userIds = new Set();
    const reviewsData = [];
    
    querySnapshot.forEach((doc) => {
      const reviewData = doc.data();
      
      // Schließe eigene Rezension aus wenn gewünscht
      if (excludeUserId && reviewData.userId === excludeUserId) {
        return;
      }
      
      reviewsData.push({
        id: doc.id,
        ...reviewData
      });
      
      userIds.add(reviewData.userId);
    });
    
    // Lade zusätzliche Benutzerinformationen
    const userCache = {};
    for (const userId of userIds) {
      try {
        const userData = await getUserDocument(userId);
        if (userData) {
          userCache[userId] = {
            username: userData.username,
            profileImageUrl: userData.profileImageUrl
          };
        }
      } catch (error) {
        console.warn(`Konnte Benutzerdaten für ${userId} nicht laden:`, error);
      }
    }
    
    // Bereichere Reviews mit aktuellen Benutzerdaten
    reviewsData.forEach((reviewData) => {
      const cachedUser = userCache[reviewData.userId];
      if (cachedUser) {
        reviewData.username = cachedUser.username || reviewData.username;
        reviewData.profileImageUrl = cachedUser.profileImageUrl;
      }
      
      reviews.push(reviewData);
    });
    
    // Sortiere client-seitig nach createdAt (neueste zuerst)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return reviews;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der öffentlichen Rezensionen:", error);
    throw error;
  }
}
