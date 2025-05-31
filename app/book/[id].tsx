import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {
    addBookToShelf,
    createReview,
    DEFAULT_LIBRARY_SHELVES,
    findBookInStandardShelves,
    getBookReviews,
    getUserShelves,
    isBookInShelf
} from "../../config/firestoreService";
import { Book, getBookById } from "../../services/googleBooksApi";
import { useAuth } from "../contexts/AuthContext";

// Hardcodierte Buchdaten werden durch Google Books API ersetzt - entfernt

interface Review {
    id: string;
    bookId: string;
    userId: string;
    username: string;
    rating: number;
    text: string;
    createdAt: string;
    likes: string[];
    isFriend?: boolean;
}

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user, userData, triggerRefresh } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, text: "" });
    const [submitting, setSubmitting] = useState(false);
    
    // Regale State
    const [userShelves, setUserShelves] = useState<any[]>([]);
    const [loadingShelves, setLoadingShelves] = useState(true);
    const [bookInShelves, setBookInShelves] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadBookData = async () => {
            if (!id) return;
            
            setLoading(true);
            try {
                // Lade Buch von Google Books API
                const bookData = await getBookById(id);
                if (bookData) {
                    setBook(bookData);
                } else {
                    Alert.alert("Fehler", "Buch konnte nicht geladen werden.");
                    router.back();
                }
            } catch (error) {
                console.error("Fehler beim Laden des Buches:", error);
                Alert.alert("Fehler", "Buch konnte nicht geladen werden.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        const loadReviews = async () => {
            if (!id) return;
            
            try {
                // Lade nur Firebase Reviews - keine hardcodierten mehr
                const firebaseReviews = await getBookReviews(id);
                setReviews(firebaseReviews);
            } catch (error) {
                console.error("Fehler beim Laden der Rezensionen:", error);
                setReviews([]);
            }
        };

        const loadUserShelves = async () => {
            if (!user) return;
            
            setLoadingShelves(true);
            try {
                const shelves = await getUserShelves(user.uid);
                setUserShelves(shelves);
                
                // Prüfe für jedes Regal, ob das Buch bereits darin ist
                if (id) {
                    const shelfStatus: Record<string, boolean> = {};
                    for (const shelf of shelves) {
                        shelfStatus[shelf.id] = await isBookInShelf(user.uid, shelf.id, id);
                    }
                    setBookInShelves(shelfStatus);
                }
            } catch (error) {
                console.error("Fehler beim Laden der Benutzerregale:", error);
                setUserShelves([]);
            } finally {
                setLoadingShelves(false);
            }
        };

        if (id) {
            loadBookData();
            loadReviews();
        }
        
        if (user) {
            loadUserShelves();
        }
    }, [id, router, user]);

    const calculateAverageRating = () => {
        if (reviews.length === 0) return "0.0";
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const refreshReviews = async () => {
        if (!id) return;
        
        try {
            // Lade nur Firebase Reviews
            const firebaseReviews = await getBookReviews(id);
            setReviews(firebaseReviews);
        } catch (error) {
            console.error("Fehler beim Laden der Rezensionen:", error);
        }
    };

    const handleSubmitReview = async () => {
        if (!user || !userData) return;

        // Rezension ist gültig wenn entweder Text vorhanden ist (mindestens 20 Zeichen) oder nur Bewertung
        const hasValidText = newReview.text.trim().length >= 20;
        const isOnlyRating = newReview.text.trim().length === 0;
        
        if (!hasValidText && !isOnlyRating) {
            Alert.alert("Fehler", "Die Rezension muss entweder leer sein (nur Bewertung) oder mindestens 20 Zeichen lang sein.");
            return;
        }

        setSubmitting(true);
        try {
            await createReview(id, {
                userId: user.uid,
                username: userData.username,
                rating: newReview.rating,
                text: newReview.text.trim(),
            });

            // Reset form
            setNewReview({ rating: 5, text: "" });
            setShowReviewForm(false);
            
            // Reload reviews
            await refreshReviews();
            
            Alert.alert("Erfolg", "Deine Rezension wurde hinzugefügt!");
        } catch (error) {
            console.error("Fehler beim Erstellen der Rezension:", error);
            Alert.alert("Fehler", "Rezension konnte nicht erstellt werden.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToShelf = async (shelfId: string) => {
        if (!user || !book || !id) return;

        try {
            // Prüfe, ob das Buch bereits in einem Standard-Regal ist
            const isStandardShelf = DEFAULT_LIBRARY_SHELVES.some(shelf => shelf.id === shelfId);
            let confirmationNeeded = false;
            let currentStandardShelf = null;

            if (isStandardShelf) {
                // Finde heraus, ob das Buch bereits in einem anderen Standard-Regal ist
                currentStandardShelf = await findBookInStandardShelves(user.uid, id);
                if (currentStandardShelf && currentStandardShelf.shelfId !== shelfId) {
                    confirmationNeeded = true;
                }
            }

            // Zeige Bestätigung, wenn das Buch von einem Standard-Regal zu einem anderen verschoben wird
            if (confirmationNeeded && currentStandardShelf) {
                const targetShelf = userShelves.find(shelf => shelf.id === shelfId);
                const moveConfirmation = await new Promise<boolean>((resolve) => {
                    Alert.alert(
                        "Buch verschieben",
                        `"${book.title}" ist aktuell in "${currentStandardShelf.shelfTitle}". Möchtest du es zu "${targetShelf?.title}" verschieben?`,
                        [
                            { text: "Abbrechen", style: "cancel", onPress: () => resolve(false) },
                            { text: "Verschieben", style: "default", onPress: () => resolve(true) }
                        ]
                    );
                });

                if (!moveConfirmation) {
                    return;
                }
            }

            const result = await addBookToShelf(user.uid, shelfId, book);
            
            // Trigger refresh für alle anderen Bildschirme
            triggerRefresh();
            
            // Aktualisiere den Status für alle Regale (da sich die Situation geändert haben könnte)
            if (id) {
                const shelfStatus: Record<string, boolean> = {};
                for (const shelf of userShelves) {
                    shelfStatus[shelf.id] = await isBookInShelf(user.uid, shelf.id, id);
                }
                setBookInShelves(shelfStatus);
            }
            
            const shelfName = userShelves.find(shelf => shelf.id === shelfId)?.title || "Regal";
            
            // Zeige entsprechende Erfolgs-Nachricht
            if (result && result.movedFromShelf) {
                Alert.alert(
                    "✅ Erfolgreich verschoben!", 
                    `"${book.title}" wurde von "${result.movedFromShelf}" zu "${shelfName}" verschoben!`,
                    [{ text: "OK", onPress: () => {
                        // Gehe zurück zur vorherigen Seite, damit useFocusEffect ausgelöst wird
                        if (router.canGoBack()) {
                            router.back();
                        }
                    }}]
                );
            } else {
                Alert.alert(
                    "✅ Erfolgreich hinzugefügt!", 
                    `"${book.title}" wurde zu "${shelfName}" hinzugefügt!`,
                    [{ text: "OK", onPress: () => {
                        // Gehe zurück zur vorherigen Seite, damit useFocusEffect ausgelöst wird
                        if (router.canGoBack()) {
                            router.back();
                        }
                    }}]
                );
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen zum Regal:", error);
            Alert.alert("❌ Fehler", (error as Error).message || "Buch konnte nicht zum Regal hinzugefügt werden.");
        }
    };

    const renderStars = (rating: number, size = 16, interactive = false, onPress?: (rating: number) => void) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => interactive && onPress && onPress(i)}
                    disabled={!interactive}
                >
                    <Ionicons
                        name={i <= rating ? "star" : "star-outline"}
                        size={size}
                        color={i <= rating ? "#FFD700" : "#E0E0E0"}
                    />
                </TouchableOpacity>
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const renderReviewItem = ({ item }: { item: Review }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color="#999" />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.username}>{item.username}</Text>
                        <View style={styles.ratingRow}>
                            {renderStars(item.rating, 14)}
                            <Text style={styles.reviewDate}>
                                {new Date(item.createdAt).toLocaleDateString('de-DE')}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.likeButton}>
                    <Ionicons 
                        name="heart-outline" 
                        size={20} 
                        color="#666" 
                    />
                    <Text style={styles.likeCount}>{item.likes.length}</Text>
                </TouchableOpacity>
            </View>
            {item.text && item.text.trim() && (
                <Text style={styles.reviewText}>{item.text}</Text>
            )}
        </View>
    );

    // UI State für Accordion und Dropdown (müssen immer aufgerufen werden)
    const [detailsExpanded, setDetailsExpanded] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedShelf, setSelectedShelf] = useState<string | null>(null);

    if (loading || !book) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#666" />
                <Text style={{marginTop: 16, fontSize: 16, color: "#666"}}>Lädt Buch...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Buchcover und Titel */}
                <View style={[styles.bookSection, {alignItems: 'center', paddingBottom: 16}]}> 
                    <View style={styles.coverLarge}>
                        {book.imageLinks?.large || book.imageLinks?.medium || book.imageLinks?.small || book.imageLinks?.thumbnail ? (
                            <Image 
                                source={{ uri: book.imageLinks.large || book.imageLinks.medium || book.imageLinks.small || book.imageLinks.thumbnail }}
                                style={styles.bookCoverImageLarge}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.coverEmoji}>{book.cover}</Text>
                        )}
                    </View>
                    <Text style={styles.bookTitleCentered}>{book.title}</Text>
                    <View style={styles.authorsContainer}>
                        {book.authors.map((author: string, index: number) => (
                            <React.Fragment key={author}>
                                <Text style={styles.bookAuthorCentered}>{author}</Text>
                                {index < book.authors.length - 1 && (
                                    <Text style={styles.authorSeparator}>, </Text>
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                    
                    {/* Google Books Bewertung & Firebase Bewertungen */}
                    <View style={{alignItems: 'center', marginTop: 12, gap: 4}}>
                        {book.rating && book.ratingsCount && (
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                {renderStars(book.rating, 18)}
                                <Text style={styles.googleRating}>
                                    {book.rating}/5 ({book.ratingsCount} Google Books Bewertungen)
                                </Text>
                            </View>
                        )}
                        
                        {reviews.length > 0 && (
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                {renderStars(parseFloat(calculateAverageRating()), 16)}
                                <Text style={styles.averageRating}>
                                    {calculateAverageRating()}/5 ({reviews.length} Community Bewertungen)
                                </Text>
                            </View>
                        )}
                        
                        {!book.rating && reviews.length === 0 && (
                            <Text style={styles.noRating}>Noch keine Bewertungen verfügbar</Text>
                        )}
                    </View>
                </View>

                {/* Regal-Dropdown */}
                <View style={{paddingHorizontal: 24, marginBottom: 12}}>
                    <Text style={styles.dropdownLabel}>Zu welchem Regal möchtest du dieses Buch hinzufügen?</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setDropdownVisible((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Ionicons name="library-outline" size={18} color="#007AFF" />
                            <Text style={styles.dropdownButtonText}>
                                {selectedShelf
                                    ? userShelves.find((shelf) => shelf.id === selectedShelf)?.title || "Regal auswählen"
                                    : 'Regal auswählen'}
                            </Text>
                        </View>
                        <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={18} color="#007AFF" />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownMenu}>
                            {loadingShelves ? (
                                <View style={styles.dropdownItem}>
                                    <View style={styles.dropdownItemContent}>
                                        <ActivityIndicator size="small" color="#666" />
                                        <Text style={styles.dropdownItemText}>Lade Regale...</Text>
                                    </View>
                                </View>
                            ) : userShelves.length === 0 ? (
                                <View style={styles.dropdownItem}>
                                    <View style={styles.dropdownItemContent}>
                                        <Ionicons name="information-circle-outline" size={20} color="#999" />
                                        <Text style={styles.dropdownItemText}>Keine Regale verfügbar</Text>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    {/* Standard-Regale */}
                                    {(() => {
                                        const defaultShelves = userShelves.filter(shelf => 
                                            DEFAULT_LIBRARY_SHELVES.some(defaultShelf => defaultShelf.id === shelf.id)
                                        );
                                        const customShelves = userShelves.filter(shelf => 
                                            !DEFAULT_LIBRARY_SHELVES.some(defaultShelf => defaultShelf.id === shelf.id)
                                        );

                                        return (
                                            <>
                                                {defaultShelves.length > 0 && (
                                                    <View style={customShelves.length > 0 ? styles.dropdownSection : null}>
                                                        {customShelves.length > 0 && (
                                                            <Text style={styles.dropdownSectionTitle}>Standard-Regale</Text>
                                                        )}
                                                        {defaultShelves.map((shelf) => {
                                                            const isInThisShelf = bookInShelves[shelf.id];
                                                            const hasBookInAnyStandardShelf = DEFAULT_LIBRARY_SHELVES.some(
                                                                s => s.id !== shelf.id && bookInShelves[s.id]
                                                            );
                                                            
                                                            return (
                                                                <TouchableOpacity
                                                                    key={shelf.id}
                                                                    style={[
                                                                        styles.dropdownItem,
                                                                        isInThisShelf && styles.dropdownItemSelected
                                                                    ]}
                                                                    onPress={() => {
                                                                        if (!isInThisShelf) {
                                                                            handleAddToShelf(shelf.id);
                                                                            setSelectedShelf(shelf.id);
                                                                        }
                                                                        setDropdownVisible(false);
                                                                    }}
                                                                >
                                                                    <View style={styles.dropdownItemContent}>
                                                                        <Ionicons 
                                                                            name={shelf.icon as any} 
                                                                            size={20} 
                                                                            color={isInThisShelf ? "#4CAF50" : shelf.color} 
                                                                        />
                                                                        <Text style={[
                                                                            styles.dropdownItemText,
                                                                            isInThisShelf && styles.dropdownItemTextSelected
                                                                        ]}>
                                                                            {shelf.title}
                                                                        </Text>
                                                                        {isInThisShelf && (
                                                                            <Ionicons 
                                                                                name="checkmark-circle" 
                                                                                size={16} 
                                                                                color="#4CAF50" 
                                                                            />
                                                                        )}
                                                                        {!isInThisShelf && hasBookInAnyStandardShelf && (
                                                                            <Ionicons 
                                                                                name="arrow-forward" 
                                                                                size={14} 
                                                                                color="#666" 
                                                                            />
                                                                        )}
                                                                    </View>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                )}
                                                
                                                {/* Benutzerdefinierte Regale */}
                                                {customShelves.length > 0 && (
                                                    <View>
                                                        {defaultShelves.length > 0 && (
                                                            <Text style={styles.dropdownSectionTitle}>Meine Regale</Text>
                                                        )}
                                                        {customShelves.map((shelf) => (
                                                            <TouchableOpacity
                                                                key={shelf.id}
                                                                style={[
                                                                    styles.dropdownItem,
                                                                    bookInShelves[shelf.id] && styles.dropdownItemDisabled
                                                                ]}
                                                                onPress={() => {
                                                                    if (!bookInShelves[shelf.id]) {
                                                                        handleAddToShelf(shelf.id);
                                                                        setSelectedShelf(shelf.id);
                                                                    }
                                                                    setDropdownVisible(false);
                                                                }}
                                                                disabled={bookInShelves[shelf.id]}
                                                            >
                                                                <View style={styles.dropdownItemContent}>
                                                                    <Ionicons 
                                                                        name={shelf.icon as any} 
                                                                        size={20} 
                                                                        color={bookInShelves[shelf.id] ? "#ccc" : shelf.color} 
                                                                    />
                                                                    <Text style={[
                                                                        styles.dropdownItemText,
                                                                        bookInShelves[shelf.id] && styles.dropdownItemTextDisabled
                                                                    ]}>
                                                                        {shelf.title}
                                                                    </Text>
                                                                    {bookInShelves[shelf.id] && (
                                                                        <Ionicons 
                                                                            name="checkmark-circle" 
                                                                            size={16} 
                                                                            color="#4CAF50" 
                                                                        />
                                                                    )}
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Accordion für Buchdetails */}
                <View style={{paddingHorizontal: 24, marginBottom: 12}}>
                    <TouchableOpacity
                        style={styles.accordionHeaderSimple}
                        onPress={() => setDetailsExpanded((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="information-circle-outline" size={18} color="#666" style={{marginRight: 8}} />
                        <Text style={styles.accordionTitleSimple}>Buchdetails anzeigen</Text>
                        <Ionicons name={detailsExpanded ? "chevron-up" : "chevron-down"} size={18} color="#666" style={{marginLeft: 8}} />
                    </TouchableOpacity>
                    {detailsExpanded && (
                        <View style={styles.accordionContentSimple}>
                            {book.publishedDate && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Erscheinungsjahr</Text>
                                    <Text style={styles.metaValue}>{new Date(book.publishedDate).getFullYear()}</Text>
                                </View>
                            )}
                            {book.pageCount && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Seiten</Text>
                                    <Text style={styles.metaValue}>{book.pageCount}</Text>
                                </View>
                            )}
                            {book.publisher && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Verlag</Text>
                                    <Text style={styles.metaValue}>{book.publisher}</Text>
                                </View>
                            )}
                            {book.isbn && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>ISBN</Text>
                                    <Text style={styles.metaValue}>{book.isbn}</Text>
                                </View>
                            )}
                            {book.categories && book.categories.length > 0 && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Kategorien</Text>
                                    <Text style={styles.metaValue}>{book.categories.join(", ")}</Text>
                                </View>
                            )}
                            {book.language && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Sprache</Text>
                                    <Text style={styles.metaValue}>
                                        {book.language === 'de' ? 'Deutsch' : 
                                         book.language === 'en' ? 'Englisch' : 
                                         book.language === 'es' ? 'Spanisch' : 
                                         book.language === 'fr' ? 'Französisch' : 
                                         book.language === 'it' ? 'Italienisch' : 
                                         book.language.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {book.genre && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Hauptgenre</Text>
                                    <Text style={styles.metaValue}>{book.genre}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Buchbeschreibung */}
                {book.description && (
                    <View style={{paddingHorizontal: 24, marginBottom: 24}}>
                        <Text style={styles.sectionTitle}>Beschreibung</Text>
                        <Text style={styles.description}>
                            {book.description.replace(/<[^>]*>/g, '').trim()}
                        </Text>
                    </View>
                )}

                {/* Rezensionen */}
                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.reviewsTitle}>
                            Rezensionen ({reviews.length})
                        </Text>
                        <TouchableOpacity 
                            style={styles.addReviewButton}
                            onPress={() => setShowReviewForm(!showReviewForm)}
                        >
                            <Ionicons 
                                name={showReviewForm ? "close" : "add"} 
                                size={20} 
                                color="#000" 
                            />
                            <Text style={styles.addReviewText}>
                                {showReviewForm ? "Abbrechen" : "Rezension"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* New Review Form */}
                    {showReviewForm && (
                        <View style={styles.reviewForm}>
                            <Text style={styles.formLabel}>Bewertung</Text>
                            {renderStars(newReview.rating, 24, true, (rating) => 
                                setNewReview(prev => ({ ...prev, rating }))
                            )}
                            <Text style={styles.formLabel}>Deine Meinung (optional, mindestens 20 Zeichen)</Text>
                            <TextInput
                                style={styles.reviewInput}
                                multiline
                                numberOfLines={4}
                                placeholder="Schreibe deine Rezension... (optional)"
                                value={newReview.text}
                                onChangeText={(text) => setNewReview(prev => ({ ...prev, text }))}
                                editable={!submitting}
                            />
                            <TouchableOpacity 
                                style={[
                                    styles.submitButton,
                                    submitting && styles.submitButtonDisabled
                                ]}
                                onPress={handleSubmitReview}
                                disabled={submitting}
                            >
                                <Text style={styles.submitButtonText}>
                                    {submitting ? "Wird gesendet..." : "Rezension veröffentlichen"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Reviews List */}
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={styles.reviewsList}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  // Cover Large
  coverLarge: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookTitleCentered: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  bookAuthorCentered: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  authorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookAuthorClickable: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  authorSeparator: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  // Dropdown Styles
  dropdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'left',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
    marginLeft: 6,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dropdownItemDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  dropdownItemTextDisabled: {
    color: '#999',
  },
  dropdownSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownSectionTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Accordion Styles (Simple)
  accordionHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  accordionTitleSimple: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  accordionContentSimple: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 2,
    gap: 6,
  },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "300",
        color: "#000",
    },
    content: {
        flex: 1,
    },
    bookSection: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    bookHeader: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 24,
    },
    coverContainer: {
        alignItems: "center",
    },
    cover: {
        width: 120,
        height: 180,
        borderRadius: 8,
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "#e8e8e8",
        justifyContent: "center",
        alignItems: "center",
    },
    coverEmoji: {
        fontSize: 48,
    },
    bookInfo: {
        flex: 1,
        gap: 12,
    },
    bookTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
        lineHeight: 28,
    },
    bookAuthor: {
        fontSize: 16,
        color: "#666",
        fontWeight: "400",
    },
    ratingSection: {
        gap: 8,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 2,
    },
    averageRating: {
        fontSize: 14,
        color: "#666",
    },
    favoriteButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#fafafa",
        alignSelf: "flex-start",
    },
    favoriteText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    detailsSection: {
        gap: 20,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: "#333",
    },
    metaInfo: {
        gap: 8,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    metaLabel: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    metaValue: {
        fontSize: 14,
        color: "#000",
        fontWeight: "500",
        flex: 1,
        textAlign: "right",
    },
    reviewsSection: {
        padding: 24,
    },
    reviewsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    reviewsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    addReviewButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: "#f8f8f8",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    addReviewText: {
        fontSize: 14,
        color: "#000",
        fontWeight: "500",
    },
    reviewForm: {
        backgroundColor: "#fafafa",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        gap: 16,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginBottom: 8,
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        backgroundColor: "#fff",
        minHeight: 100,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#000",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    reviewsList: {
        gap: 16,
    },
    reviewCard: {
        backgroundColor: "#fafafa",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    userDetails: {
        flex: 1,
        gap: 4,
    },
    username: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    usernameClickable: {
        fontSize: 14,
        fontWeight: "600",
        color: "#007AFF",
        textDecorationLine: "underline",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: "#999",
    },
    likeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    likeCount: {
        fontSize: 12,
        color: "#666",
    },
    reviewText: {
        fontSize: 15,
        lineHeight: 20,
        color: "#333",
    },
    bookCoverImageLarge: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    googleRating: {
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "500",
    },
    noRating: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    dropdownItemSelected: {
        backgroundColor: "#f0f8ff",
    },
    dropdownItemTextSelected: {
        color: "#4CAF50",
        fontWeight: "600",
    },
});
