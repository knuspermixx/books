import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../../config/firebaseConfig";
import { BOOK_GENRES, updateGenres, updateStatus, updateUsername } from "../../config/firestoreService";
import GenreSelector from "../components/GenreSelector";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileScreen() {
    const { user, userData, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(userData?.username || "");
    const [selectedGenres, setSelectedGenres] = useState<string[]>(userData?.genres || []);
    const [status, setStatus] = useState(userData?.status || "Was liest du gerade?");
    const [saving, setSaving] = useState(false);

    // Placeholder für bereits gelesene Bücher mit Rezensionen
    const [readBooks] = useState([
        { 
            id: 1, 
            title: "Der Herr der Ringe", 
            author: "J.R.R. Tolkien", 
            cover: "📚", 
            rating: 5,
            review: "Ein absolutes Meisterwerk der Fantasy-Literatur. Tolkiens Weltenbau ist unübertroffen und die Geschichte zeitlos fesselnd.",
            readDate: "2024-03-15"
        },
        { 
            id: 2, 
            title: "Harry Potter", 
            author: "J.K. Rowling", 
            cover: "⚡", 
            rating: 4,
            review: "Magische Geschichte, die Jung und Alt begeistert. Perfekt für alle, die gerne in fantastische Welten eintauchen.",
            readDate: "2024-02-28"
        },
        { 
            id: 3, 
            title: "1984", 
            author: "George Orwell", 
            cover: "👁", 
            rating: 5,
            review: "Erschreckend aktuell und prophetisch. Ein Buch, das zum Nachdenken über Überwachung und Freiheit anregt.",
            readDate: "2024-01-20"
        },
        { 
            id: 4, 
            title: "Der Alchemist", 
            author: "Paulo Coelho", 
            cover: "✨", 
            rating: 3,
            review: "Inspirierende Botschaft über das Verfolgen der eigenen Träume, auch wenn die Handlung etwas vorhersehbar ist.",
            readDate: "2023-12-10"
        },
        { 
            id: 5, 
            title: "Stolz und Vorurteil", 
            author: "Jane Austen", 
            cover: "💕", 
            rating: 4,
            review: "Wunderbare Charakterentwicklung und zeitlose Romantik. Austens Humor und scharfe Beobachtungen sind brilliant.",
            readDate: "2023-11-25"
        },
        { 
            id: 6, 
            title: "Der Kleine Prinz", 
            author: "Antoine de Saint-Exupéry", 
            cover: "🌟", 
            rating: 5,
            review: "Berührende Geschichte über Freundschaft, Liebe und die Wichtigkeit der kleinen Dinge im Leben.",
            readDate: "2023-10-18"
        },
        { 
            id: 7, 
            title: "Die Verwandlung", 
            author: "Franz Kafka", 
            cover: "🪲", 
            rating: 4,
            review: "Verstörend und faszinierend zugleich. Kafkas surreale Erzählweise regt zum Nachdenken an.",
            readDate: "2023-09-05"
        },
        { 
            id: 8, 
            title: "Das Parfum", 
            author: "Patrick Süskind", 
            cover: "🌹", 
            rating: 4,
            review: "Düster und atmosphärisch geschrieben. Die Beschreibungen der Düfte sind außergewöhnlich detailreich.",
            readDate: "2023-08-12"
        },
        { 
            id: 9, 
            title: "Der Steppenwolf", 
            author: "Hermann Hesse", 
            cover: "🐺", 
            rating: 3,
            review: "Philosophisch tiefgreifend, aber stellenweise schwer zugänglich. Hesses Reflexionen über das moderne Leben sind wertvoll.",
            readDate: "2023-07-30"
        },
    ]);

    // Update local state when userData changes
    useEffect(() => {
        if (userData) {
            setUsername(userData.username || "");
            setSelectedGenres(userData.genres || []);
            setStatus(userData.status || "Was liest du gerade?");
        }
    }, [userData]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch {
            Alert.alert("Fehler", "Abmeldung fehlgeschlagen");
        }
    };

    const handleEditStart = () => {
        setIsEditing(true);
        setUsername(userData?.username || "");
        setSelectedGenres(userData?.genres || []);
        setStatus(userData?.status || "Was liest du gerade?");
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setUsername(userData?.username || "");
        setSelectedGenres(userData?.genres || []);
        setStatus(userData?.status || "Was liest du gerade?");
    };

    const handleEditSave = async () => {
        if (!user || !username.trim()) {
            Alert.alert("Fehler", "Benutzername darf nicht leer sein");
            return;
        }

        setSaving(true);
        try {
            await updateUsername(user.uid, username.trim());
            await updateGenres(user.uid, selectedGenres);
            await updateStatus(user.uid, status.trim());
            await refreshUserData();
            setIsEditing(false);
        } catch {
            Alert.alert("Fehler", "Speichern fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    };

    const handleGenreToggle = (genre: string) => {
        setSelectedGenres(prev => {
            if (prev.includes(genre)) {
                return prev.filter(g => g !== genre);
            } else {
                if (prev.length >= 5) {
                    Alert.alert("Limit erreicht", "Du kannst maximal 5 Genres auswählen");
                    return prev;
                }
                return [...prev, genre];
            }
        });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={12}
                    color={i <= rating ? "#FFD700" : "#E0E0E0"}
                />
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const renderBookItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.bookListItem}
            onPress={() => router.push(`/book/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.bookCover}>
                <Text style={styles.bookEmoji}>{item.cover}</Text>
            </View>
            <View style={styles.bookInfo}>
                <View style={styles.bookHeader}>
                    <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    <View style={styles.ratingRow}>
                        {renderStars(item.rating)}
                        <Text style={styles.readDate}>
                            Gelesen am {new Date(item.readDate).toLocaleDateString('de-DE')}
                        </Text>
                    </View>
                </View>
                {item.review && (
                    <View style={styles.reviewSection}>
                        <Text style={styles.reviewText} numberOfLines={3}>{item.review}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header mit Edit Button */}
            {!isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditStart}>
                    <Ionicons name="pencil-outline" size={20} color="#666" />
                </TouchableOpacity>
            )}

            {/* Profilbereich */}
            <View style={styles.profileSection}>
                <View style={styles.profileHeader}>
                    {/* Profilbild */}
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={48} color="#999" />
                        </View>
                        {isEditing && (
                            <TouchableOpacity style={styles.imageEditButton}>
                                <Ionicons name="camera" size={16} color="#666" />
                                <Text style={styles.imageEditText}>Foto ändern</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Name und Status */}
                    <View style={styles.profileInfo}>
                        {/* Benutzername */}
                        <View style={styles.usernameSection}>
                            {isEditing ? (
                                <TextInput
                                    style={styles.usernameInput}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Benutzername"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.username}>
                                    {userData?.username || "Benutzername"}
                                </Text>
                            )}
                        </View>

                        {/* Status */}
                        <View style={styles.statusSection}>
                            {isEditing ? (
                                <TextInput
                                    style={styles.statusInput}
                                    value={status}
                                    onChangeText={setStatus}
                                    placeholder="Was liest du gerade?"
                                    multiline
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.status}>
                                    {userData?.status || "Was liest du gerade?"}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Follower Stats */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>1.2k</Text>
                        <Text style={styles.statLabel}>Follower</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>842</Text>
                        <Text style={styles.statLabel}>Gefolgt</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{readBooks.length}</Text>
                        <Text style={styles.statLabel}>Gelesen</Text>
                    </View>
                </View>
            </View>

            {/* Lieblings-Genres */}
            <View style={styles.genresSection}>
                {isEditing ? (
                    <GenreSelector
                        availableGenres={BOOK_GENRES}
                        selectedGenres={selectedGenres}
                        onGenreToggle={handleGenreToggle}
                    />
                ) : (
                    <View style={styles.genreDisplay}>
                        {selectedGenres.length > 0 ? (
                            selectedGenres.map((genre) => (
                                <View key={genre} style={styles.genreChip}>
                                    <Text style={styles.genreChipText}>{genre}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Keine Genres ausgewählt</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Bereits gelesene Bücher */}
            {!isEditing && (
                <View style={styles.booksSection}>
                    <Text style={styles.sectionTitle}>Rezessionen</Text>
                    <FlatList
                        data={readBooks}
                        renderItem={renderBookItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.booksList}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
                    />
                </View>
            )}

            {/* Action Buttons */}
            {isEditing ? (
                <View style={styles.editActions}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]} 
                        onPress={handleEditCancel}
                        disabled={saving}
                    >
                        <Text style={styles.cancelButtonText}>Abbrechen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.saveButton]} 
                        onPress={handleEditSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveButtonText}>
                            {saving ? "Speichern..." : "Speichern"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Abmelden</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    editButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1,
        padding: 8,
        backgroundColor: "transparent",
    },
    profileSection: {
        paddingTop: 48,
        paddingBottom: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 16,
    },
    profileImageContainer: {
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
    },
    profileInfo: {
        flex: 1,
        gap: 4,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    imageEditButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "transparent",
    },
    imageEditText: {
        fontSize: 11,
        color: "#666",
        fontWeight: "400",
        textDecorationLine: "underline",
    },
    usernameSection: {
        width: "100%",
    },
    username: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginBottom: 2,
    },
    usernameInput: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        paddingHorizontal: 0,
        paddingVertical: 4,
        marginBottom: 2,
    },
    statusSection: {
        width: "100%",
    },
    status: {
        fontSize: 14,
        color: "#666",
        lineHeight: 18,
    },
    statusInput: {
        fontSize: 14,
        color: "#666",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 8,
        paddingVertical: 6,
        minHeight: 32,
        textAlignVertical: "top",
    },
    statsSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "400",
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 8,
    },
    genresSection: {
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    booksSection: {
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 16,
    },
    genreDisplay: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    genreChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    genreChipText: {
        fontSize: 13,
        color: "#333",
        fontWeight: "400",
    },
    emptyText: {
        fontSize: 14,
        color: "#ccc",
        fontStyle: "italic",
    },
    booksList: {
        paddingBottom: 20,
    },
    bookSeparator: {
        height: 16,
    },
    bookListItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 0,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    bookCover: {
        width: 60,
        height: 80,
        borderRadius: 4,
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    bookEmoji: {
        fontSize: 28,
    },
    bookInfo: {
        flex: 1,
        gap: 8,
    },
    bookHeader: {
        gap: 4,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        lineHeight: 20,
    },
    bookAuthor: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },
    readDate: {
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
    reviewSection: {
        gap: 4,
        paddingTop: 8,
    },
    reviewLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#333",
    },
    reviewText: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
        fontStyle: "italic",
    },
    starsContainer: {
        flexDirection: "row",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    editActions: {
        flexDirection: "row",
        gap: 12,
        paddingTop: 24,
        paddingBottom: 40,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
        alignItems: "center",
        flex: 1,
        minHeight: 48,
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#f8f8f8",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#666",
    },
    saveButton: {
        backgroundColor: "#000",
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#fff",
    },
    signOutButton: {
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
        alignItems: "center",
        marginTop: 24,
        marginBottom: 40,
    },
    signOutButtonText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#fff",
    },
});
