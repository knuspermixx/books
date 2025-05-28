import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";
import { BOOK_GENRES, updateGenres, updateStatus, updateUsername } from "../config/firestoreService";
import GenreSelector from "./components/GenreSelector";
import { useAuth } from "./contexts/AuthContext";

export default function ProfileScreen() {
    const { user, userData, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(userData?.username || "");
    const [selectedGenres, setSelectedGenres] = useState<string[]>(userData?.genres || []);
    const [status, setStatus] = useState(userData?.status || "Was liest du gerade?");
    const [saving, setSaving] = useState(false);

    // Placeholder für bereits gelesene Bücher
    const [readBooks] = useState([
        { id: 1, title: "Der Herr der Ringe", author: "J.R.R. Tolkien", cover: "📚", rating: 5 },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling", cover: "⚡", rating: 4 },
        { id: 3, title: "1984", author: "George Orwell", cover: "👁", rating: 5 },
        { id: 4, title: "Der Alchemist", author: "Paulo Coelho", cover: "✨", rating: 3 },
        { id: 5, title: "Stolz und Vorurteil", author: "Jane Austen", cover: "💕", rating: 4 },
        { id: 6, title: "Der Kleine Prinz", author: "Antoine de Saint-Exupéry", cover: "🌟", rating: 5 },
        { id: 7, title: "Die Verwandlung", author: "Franz Kafka", cover: "🪲", rating: 4 },
        { id: 8, title: "Das Parfum", author: "Patrick Süskind", cover: "🌹", rating: 4 },
        { id: 9, title: "Der Steppenwolf", author: "Hermann Hesse", cover: "🐺", rating: 3 },
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
        <View style={styles.bookGridItem}>
            <View style={styles.bookCover}>
                <Text style={styles.bookEmoji}>{item.cover}</Text>
            </View>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
            {renderStars(item.rating)}
        </View>
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
                <Text style={styles.sectionTitle}>Lieblings-Genres</Text>
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
                    <FlatList
                        data={readBooks}
                        renderItem={renderBookItem}
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.booksGrid}
                        keyExtractor={(item) => item.id.toString()}
                        columnWrapperStyle={styles.bookRow}
                        scrollEnabled={false}
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
        padding: 24,
    },
    editButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1,
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#f8f8f8",
    },
    profileSection: {
        paddingTop: 60,
        paddingBottom: 40,
        gap: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 20,
        paddingHorizontal: 4,
    },
    profileImageContainer: {
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
    },
    profileInfo: {
        flex: 1,
        gap: 8,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f8f8f8",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    imageEditButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#f8f8f8",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    imageEditText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "400",
    },
    usernameSection: {
        width: "100%",
    },
    username: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
    },
    usernameInput: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    statusSection: {
        width: "100%",
    },
    status: {
        fontSize: 15,
        color: "#666",
        fontStyle: "italic",
        lineHeight: 20,
    },
    statusInput: {
        fontSize: 15,
        color: "#666",
        fontStyle: "italic",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 40,
        textAlignVertical: "top",
    },
    statsSection: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingVertical: 20,
        marginTop: 12,
        backgroundColor: "#fafafa",
        borderRadius: 12,
        marginHorizontal: 16,
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
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
    },
    booksSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 8,
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
    booksGrid: {
        paddingBottom: 20,
    },
    bookRow: {
        justifyContent: "space-between",
    },
    bookGridItem: {
        width: "31%",
        marginBottom: 24,
        alignItems: "center",
        gap: 6,
    },
    bookCover: {
        width: "100%",
        aspectRatio: 0.7,
        borderRadius: 4,
        backgroundColor: "#fafafa",
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    bookEmoji: {
        fontSize: 28,
    },
    bookTitle: {
        fontSize: 11,
        fontWeight: "500",
        color: "#000",
        textAlign: "center",
        lineHeight: 14,
        marginBottom: 2,
    },
    bookAuthor: {
        fontSize: 9,
        color: "#666",
        textAlign: "center",
        fontWeight: "400",
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    editActions: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
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
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 40,
    },
    signOutButtonText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#fff",
    },
});
