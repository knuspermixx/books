import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { createReview, getBookReviews } from "../../config/firestoreService";
import { useAuth } from "../contexts/AuthContext";

// Hardcodierte Buchdaten (Google Books API Format)
const BOOKS_DATA = {
    "1": {
        id: "1",
        title: "Der Herr der Ringe",
        authors: ["J.R.R. Tolkien"],
        description: "Ein episches Fantasy-Abenteuer in Mittelerde, in dem Frodo Beutlin den Einen Ring zerstören muss, um die Welt vor dem dunklen Herrscher Sauron zu retten. Eine zeitlose Geschichte über Freundschaft, Mut und die Macht des Guten über das Böse.",
        publishedDate: "1954",
        pageCount: 1216,
        categories: ["Fantasy", "Klassiker"],
        isbn: "9783608938043",
        publisher: "Klett-Cotta",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/6B73FF/FFFFFF?text=LOTR"
        },
        cover: "📚",
        reviews: [
            {
                id: "r1-1",
                bookId: "1",
                userId: "user1",
                username: "FantasyFan42",
                rating: 5,
                text: "Ein absolutes Meisterwerk! Tolkien hat eine so detailreiche Welt geschaffen, dass man sich komplett darin verliert. Die Charakterentwicklung ist grandios und die Freundschaft zwischen Frodo und Sam ist einfach herzerwärmend.",
                createdAt: "2024-12-15T10:30:00Z",
                likes: ["user3", "user5"],
                isFriend: true
            },
            {
                id: "r1-2", 
                bookId: "1",
                userId: "user2",
                username: "BücherWurm",
                rating: 4,
                text: "",
                createdAt: "2024-12-10T14:20:00Z",
                likes: ["user1"],
                isFriend: false
            },
            {
                id: "r1-3",
                bookId: "1", 
                userId: "user4",
                username: "Leseratte88",
                rating: 5,
                text: "Zeitlos und magisch! Jedes Mal wenn ich es lese, entdecke ich neue Details. Die Sprache ist poetisch und die Geschichte voller Hoffnung trotz der dunklen Momente.",
                createdAt: "2024-11-28T09:15:00Z",
                likes: ["user1", "user2", "user5"],
                isFriend: false
            }
        ]
    },
    "2": {
        id: "2",
        title: "Harry Potter und der Stein der Weisen",
        authors: ["J.K. Rowling"],
        description: "Der elfjährige Harry Potter erfährt an seinem Geburtstag, dass er ein Zauberer ist und in Hogwarts, der Schule für Hexerei und Zauberei, aufgenommen wurde. Dort entdeckt er nicht nur seine magischen Fähigkeiten, sondern auch ein dunkles Geheimnis aus seiner Vergangenheit.",
        publishedDate: "1997",
        pageCount: 336,
        categories: ["Fantasy", "Young Adult"],
        isbn: "9783551551672",
        publisher: "Carlsen",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/7B1FA2/FFFFFF?text=HP"
        },
        cover: "⚡",
        reviews: [
            {
                id: "r2-1",
                bookId: "2",
                userId: "user3",
                username: "MagieFreund",
                rating: 5,
                text: "Der perfekte Einstieg in die Zauberwelt! Rowling schafft es, eine komplexe magische Welt so zu erklären, dass sie völlig logisch erscheint. Harry ist ein wunderbar sympathischer Protagonist.",
                createdAt: "2024-12-12T16:45:00Z",
                likes: ["user1", "user4"],
                isFriend: true
            },
            {
                id: "r2-2",
                bookId: "2", 
                userId: "user5",
                username: "Nostalgiker",
                rating: 4,
                text: "Ein Kindheitsfavorit! Auch als Erwachsener noch sehr unterhaltsam. Die Nostalgie macht es noch schöner, aber objektiv betrachtet ist es eher ein solides Jugendbuch.",
                createdAt: "2024-12-08T11:30:00Z",
                likes: ["user2"],
                isFriend: false
            }
        ]
    },
    "3": {
        id: "3",
        title: "1984",
        authors: ["George Orwell"],
        description: "In einer düsteren Zukunft überwacht der totalitäre Staat jeden Gedanken seiner Bürger. Winston Smith arbeitet im Ministerium für Wahrheit und verändert die Geschichte nach den Wünschen der Partei. Doch als er sich in Julia verliebt, beginnt er zu rebellieren.",
        publishedDate: "1949",
        pageCount: 416,
        categories: ["Klassiker", "Science Fiction"],
        isbn: "9783548234106",
        publisher: "Ullstein",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/424242/FFFFFF?text=1984"
        },
        cover: "👁",
        reviews: [
            {
                id: "r3-1",
                bookId: "3",
                userId: "user6",
                username: "PhilosophReader",
                rating: 5,
                text: "Erschreckend aktuell! Orwells Vision einer totalitären Gesellschaft ist beängstigend präzise. Ein Buch das zum Nachdenken anregt und vor Manipulation warnt. Sollte Pflichtlektüre sein.",
                createdAt: "2024-12-05T20:15:00Z", 
                likes: ["user1", "user3", "user7"],
                isFriend: false
            },
            {
                id: "r3-2",
                bookId: "3",
                userId: "user7", 
                username: "Skeptiker",
                rating: 4,
                text: "Wichtiges Buch, aber sehr deprimierend. Die Botschaft ist klar und relevant, aber die Geschichte ist teilweise schwer zu ertragen. Trotzdem empfehlenswert für das Verständnis moderner Überwachung.",
                createdAt: "2024-11-22T13:40:00Z",
                likes: ["user2"],
                isFriend: true
            }
        ]
    },
    "4": {
        id: "4",
        title: "Der Alchemist",
        authors: ["Paulo Coelho"],
        description: "Santiago, ein andalusischer Hirte, träumt wiederholt von einem Schatz bei den ägyptischen Pyramiden. Seine Reise dorthin wird zu einer Reise der Selbstfindung und spirituellen Erleuchtung. Ein zeitloser Roman über das Verfolgen der eigenen Träume.",
        publishedDate: "1988",
        pageCount: 188,
        categories: ["Spiritualität", "Abenteuer"],
        isbn: "9783257237580",
        publisher: "Diogenes",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/FF9800/FFFFFF?text=Alchemist"
        },
        cover: "✨",
        reviews: [
            {
                id: "r4-1",
                bookId: "4",
                userId: "user8",
                username: "SpiritSeeker",
                rating: 5,
                text: "Ein Buch das das Leben verändert! Coelhos Botschaft über das Verfolgen der eigenen Träume ist so einfach wie kraftvoll. Jedes Mal wenn ich es lese, entdecke ich neue Weisheiten.",
                createdAt: "2024-12-01T08:20:00Z",
                likes: ["user4", "user9"],
                isFriend: true
            },
            {
                id: "r4-2",
                bookId: "4",
                userId: "user9",
                username: "RealistIn",
                rating: 3,
                text: "",
                createdAt: "2024-11-18T15:10:00Z",
                likes: [],
                isFriend: false
            }
        ]
    },
    "5": {
        id: "5",
        title: "Stolz und Vorurteil",
        authors: ["Jane Austen"],
        description: "Elizabeth Bennet, eine kluge und unabhängige junge Frau, begegnet dem stolzen Mr. Darcy. Was als gegenseitige Abneigung beginnt, entwickelt sich langsam zu einer der größten Liebesgeschichten der Weltliteratur.",
        publishedDate: "1813",
        pageCount: 432,
        categories: ["Romance", "Klassiker"],
        isbn: "9783746626857",
        publisher: "Aufbau",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/E91E63/FFFFFF?text=P%26P"
        },
        cover: "💕",
        reviews: [
            {
                id: "r5-1",
                bookId: "5",
                userId: "user10",
                username: "RomanceFan",
                rating: 5,
                text: "Die perfekte Liebesgeschichte! Austen schreibt so witzig und intelligent. Elizabeth und Darcy sind unvergessliche Charaktere. Ein Buch das zeigt, dass wahre Liebe Zeit braucht.",
                createdAt: "2024-11-30T19:25:00Z",
                likes: ["user5", "user11"],
                isFriend: true
            },
            {
                id: "r5-2",
                bookId: "5",
                userId: "user11",
                username: "ClassicLover",
                rating: 4,
                text: "Sehr gut geschrieben und zeitlos relevant. Austens gesellschaftskritischer Humor ist brilliant. Manchmal etwas langatmig, aber die Charakterentwicklung entschädigt dafür.",
                createdAt: "2024-11-15T12:35:00Z",
                likes: ["user10"],
                isFriend: false
            }
        ]
    },
    "6": {
        id: "6",
        title: "Der Kleine Prinz",
        authors: ["Antoine de Saint-Exupéry"],
        description: "Ein Pilot strandet in der Sahara und trifft dort einen kleinen Prinzen von einem anderen Planeten. Durch ihre Begegnung lernt er wichtige Lektionen über Freundschaft, Liebe und was wirklich wichtig im Leben ist.",
        publishedDate: "1943",
        pageCount: 96,
        categories: ["Klassiker", "Philosophie"],
        isbn: "9783150096260",
        publisher: "Reclam",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/4CAF50/FFFFFF?text=Prince"
        },
        cover: "🌟",
        reviews: [
            {
                id: "r6-1",
                bookId: "6",
                userId: "user12",
                username: "Träumer",
                rating: 5,
                text: "Ein Buch für die Seele! So einfach und doch so tiefgreifend. Saint-Exupéry verpackt wichtige Lebenslektionen in eine wunderschöne Geschichte. Für Kinder und Erwachsene gleichermaßen wertvoll.",
                createdAt: "2024-12-03T14:50:00Z",
                likes: ["user6", "user8"],
                isFriend: false
            },
            {
                id: "r6-2",
                bookId: "6",
                userId: "user13",
                username: "Elternteil",
                rating: 4,
                text: "Lese es immer wieder mit meinen Kindern. Jedes Mal entdecken wir neue Bedeutungen. Ein wunderbares Familienbuch das zum Nachdenken und Diskutieren anregt.",
                createdAt: "2024-11-20T10:15:00Z",
                likes: ["user12"],
                isFriend: true
            }
        ]
    },
    "7": {
        id: "7",
        title: "Die Verwandlung",
        authors: ["Franz Kafka"],
        description: "Gregor Samsa erwacht eines Morgens als riesiges Ungeziefer. Diese surreale Verwandlung bringt nicht nur ihn, sondern seine ganze Familie in eine existenzielle Krise. Ein Meisterwerk der deutschsprachigen Literatur.",
        publishedDate: "1915",
        pageCount: 104,
        categories: ["Klassiker", "Moderne Literatur"],
        isbn: "9783150095270",
        publisher: "Reclam",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/795548/FFFFFF?text=Kafka"
        },
        cover: "🪲",
        reviews: [
            {
                id: "r7-1",
                bookId: "7",
                userId: "user14",
                username: "LitStudent",
                rating: 4,
                text: "Verstörend und brilliant! Kafka beschreibt Entfremdung und Isolation auf eine völlig neue Art. Die Geschichte ist surreal, aber die menschlichen Emotionen sind sehr real. Schwer verdaulich aber wichtig.",
                createdAt: "2024-11-25T16:20:00Z",
                likes: ["user6", "user15"],
                isFriend: false
            },
            {
                id: "r7-2",
                bookId: "7",
                userId: "user15",
                username: "Modernist",
                rating: 5,
                text: "Ein Meisterwerk der modernen Literatur! Kafkas Stil ist einzigartig und seine Themen zeitlos. Die Verwandlung als Metapher für gesellschaftliche Ausgrenzung ist genial umgesetzt.",
                createdAt: "2024-11-12T09:30:00Z",
                likes: ["user14"],
                isFriend: true
            }
        ]
    },
    "8": {
        id: "8",
        title: "Das Parfum",
        authors: ["Patrick Süskind"],
        description: "Jean-Baptiste Grenouille besitzt einen außergewöhnlichen Geruchssinn, aber selbst keinen Eigengeruch. Seine Obsession mit Düften führt ihn auf eine dunkle Reise durch das Paris des 18. Jahrhunderts.",
        publishedDate: "1985",
        pageCount: 368,
        categories: ["Historisch", "Thriller"],
        isbn: "9783257228007",
        publisher: "Diogenes",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/9C27B0/FFFFFF?text=Parfum"
        },
        cover: "🌹",
        reviews: [
            {
                id: "r8-1",
                bookId: "8",
                userId: "user16",
                username: "ThrillerFan",
                rating: 4,
                text: "Faszinierend und verstörend zugleich! Süskinds Schreibstil ist so bildhaft, dass man die Düfte förmlich riechen kann. Grenouille ist ein unvergesslicher Anti-Held. Nichts für schwache Nerven.",
                createdAt: "2024-11-28T21:10:00Z",
                likes: ["user17", "user18"],
                isFriend: true
            },
            {
                id: "r8-2",
                bookId: "8", 
                userId: "user17",
                username: "HistoryBuff",
                rating: 5,
                text: "Brillante Mischung aus historischem Roman und Thriller! Das Paris des 18. Jahrhunderts ist so authentisch beschrieben. Die Geschichte ist dunkel aber fesselnd bis zur letzten Seite.",
                createdAt: "2024-11-10T14:45:00Z",
                likes: ["user16"],
                isFriend: false
            }
        ]
    },
    "9": {
        id: "9",
        title: "Der Steppenwolf",
        authors: ["Hermann Hesse"],
        description: "Harry Haller, ein intellektueller Einzelgänger, kämpft mit seinem Doppelwesen als kultivierter Mensch und triebhafter Wolf. Ein psychologischer Roman über die Identitätssuche und den Konflikt zwischen Geist und Seele.",
        publishedDate: "1927",
        pageCount: 288,
        categories: ["Klassiker", "Psychologie"],
        isbn: "9783518395806",
        publisher: "Suhrkamp",
        language: "de",
        imageLinks: {
            thumbnail: "https://via.placeholder.com/300x450/607D8B/FFFFFF?text=Wolf"
        },
        cover: "🐺",
        reviews: [
            {
                id: "r9-1",
                bookId: "9",
                userId: "user18",
                username: "PsychoReader",
                rating: 4,
                text: "Tiefgreifend und introspektiv! Hesse erkundet die menschliche Psyche auf eine sehr persönliche Art. Harry Hallers innerer Konflikt ist nachvollziehbar und bewegend. Requires mehrmaliges Lesen.",
                createdAt: "2024-11-08T11:20:00Z",
                likes: ["user19"],
                isFriend: false
            },
            {
                id: "r9-2",
                bookId: "9",
                userId: "user19",
                username: "Philosophy101", 
                rating: 3,
                text: "Interessant aber anstrengend zu lesen. Hesses philosophische Gedanken sind wertvoll, aber die Geschichte zieht sich manchmal. Für Fans von Selbstreflexion und Existentialismus zu empfehlen.",
                createdAt: "2024-10-30T17:55:00Z",
                likes: [],
                isFriend: true
            }
        ]
    }
};

interface BookData {
    id: string;
    title: string;
    authors: string[];
    description: string;
    publishedDate: string;
    pageCount: number;
    categories: string[];
    isbn: string;
    publisher: string;
    language: string;
    imageLinks: {
        thumbnail: string;
    };
    cover: string;
    reviews?: Review[];
}

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
    const { user, userData } = useAuth();
    const [book, setBook] = useState<BookData | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, text: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadBookData = () => {
            const bookData = BOOKS_DATA[id as keyof typeof BOOKS_DATA];
            if (bookData) {
                setBook(bookData);
                // Lade hardcodierte Reviews für dieses Buch
                setReviews(bookData.reviews || []);
            }
            setLoading(false);
        };

        const loadReviews = async () => {
            try {
                // Lade zusätzliche Reviews aus Firebase
                const firebaseReviews = await getBookReviews(id);
                const bookData = BOOKS_DATA[id as keyof typeof BOOKS_DATA];
                
                // Kombiniere hardcodierte und Firebase Reviews
                const allReviews = [
                    ...(bookData?.reviews || []),
                    ...firebaseReviews
                ];
                
                setReviews(allReviews);
            } catch (error) {
                console.error("Fehler beim Laden der Rezensionen:", error);
                // Fallback: Nur hardcodierte Reviews anzeigen
                const bookData = BOOKS_DATA[id as keyof typeof BOOKS_DATA];
                setReviews(bookData?.reviews || []);
            }
        };

        if (id) {
            loadBookData();
            loadReviews();
        }
    }, [id]);

    const calculateAverageRating = () => {
        if (reviews.length === 0) return "0.0";
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const refreshReviews = async () => {
        try {
            // Lade zusätzliche Reviews aus Firebase
            const firebaseReviews = await getBookReviews(id);
            const bookData = BOOKS_DATA[id as keyof typeof BOOKS_DATA];
            
            // Kombiniere hardcodierte und Firebase Reviews
            const allReviews = [
                ...(bookData?.reviews || []),
                ...firebaseReviews
            ];
            
            setReviews(allReviews);
        } catch (error) {
            console.error("Fehler beim Laden der Rezensionen:", error);
            // Fallback: Nur hardcodierte Reviews anzeigen
            const bookData = BOOKS_DATA[id as keyof typeof BOOKS_DATA];
            setReviews(bookData?.reviews || []);
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
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => router.push(`/profile/${item.userId}`)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person" size={20} color="#999" />
                    </TouchableOpacity>
                    <View style={styles.userDetails}>
                        <TouchableOpacity
                            onPress={() => router.push(`/profile/${item.userId}`)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.usernameClickable}>{item.username}</Text>
                        </TouchableOpacity>
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = [
        { key: 'currently-reading', label: 'Lese ich gerade' },
        { key: 'want-to-read', label: 'Will ich lesen' },
        { key: 'read', label: 'Bereits gelesen' },
    ];

    if (loading || !book) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Lädt...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Buchcover und Titel */}
                <View style={[styles.bookSection, {alignItems: 'center', paddingBottom: 16}]}> 
                    <View style={styles.coverLarge}>
                        <Text style={styles.coverEmoji}>{book.cover}</Text>
                    </View>
                    <Text style={styles.bookTitleCentered}>{book.title}</Text>
                    <View style={styles.authorsContainer}>
                        {book.authors.map((author, index) => (
                            <React.Fragment key={author}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.bookAuthorClickable}>{author}</Text>
                                </TouchableOpacity>
                                {index < book.authors.length - 1 && (
                                    <Text style={styles.authorSeparator}>, </Text>
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                        {renderStars(parseFloat(calculateAverageRating()), 18)}
                        <Text style={styles.averageRating}>
                            {calculateAverageRating()} ({reviews.length} Bewertungen)
                        </Text>
                    </View>
                </View>

                {/* Kategorie Dropdown - selbsterklärend */}
                <View style={{paddingHorizontal: 24, marginBottom: 12}}>
                    <Text style={styles.dropdownLabel}>Zu welcher Kategorie möchtest du dieses Buch in deiner Bibliothek hinzufügen?</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setDropdownVisible((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="library-outline" size={18} color="#007AFF" style={{ marginRight: 6 }} />
                        <Text style={styles.dropdownButtonText}>
                            {selectedCategory
                                ? categories.find((c) => c.key === selectedCategory)?.label
                                : 'Kategorie auswählen'}
                        </Text>
                        <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={18} color="#007AFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownMenu}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedCategory(cat.key);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
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
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>Erscheinungsjahr</Text><Text style={styles.metaValue}>{book.publishedDate}</Text></View>
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>Seiten</Text><Text style={styles.metaValue}>{book.pageCount}</Text></View>
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>Verlag</Text><Text style={styles.metaValue}>{book.publisher}</Text></View>
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>ISBN</Text><Text style={styles.metaValue}>{book.isbn}</Text></View>
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>Genres</Text><Text style={styles.metaValue}>{book.categories.join(", ")}</Text></View>
                            <View style={styles.metaRow}><Text style={styles.metaLabel}>Sprache</Text><Text style={styles.metaValue}>{book.language}</Text></View>
                        </View>
                    )}
                </View>

                {/* Buchbeschreibung */}
                <View style={{paddingHorizontal: 24, marginBottom: 24}}>
                    <Text style={styles.description}>{book.description}</Text>
                </View>

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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
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
});
