import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";
import { BOOK_GENRES, updateGenres, updateUsername } from "../config/firestoreService";
import GenreSelector from "./components/GenreSelector";
import { useAuth } from "./contexts/AuthContext";

export default function ProfileScreen() {
    const { user, userData, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(userData?.username || "");
    const [selectedGenres, setSelectedGenres] = useState<string[]>(userData?.genres || []);
    const [saving, setSaving] = useState(false);

    // Update local state when userData changes
    useEffect(() => {
        if (userData) {
            setUsername(userData.username || "");
            setSelectedGenres(userData.genres || []);
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
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setUsername(userData?.username || "");
        setSelectedGenres(userData?.genres || []);
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
                {!isEditing && (
                    <TouchableOpacity style={styles.editButton} onPress={handleEditStart}>
                        <Ionicons name="pencil-outline" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>

                
                <View style={styles.section}>
                    <Text style={styles.label}>Benutzername</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Benutzername"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!saving}
                        />
                    ) : (
                        <Text style={styles.value}>
                            {userData?.username || "Nicht gesetzt"}
                        </Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Lieblings-Genres</Text>
                    {isEditing ? (
                        <>
                            <Text style={styles.description}>
                                Wähle deine bevorzugten Buchgenres aus (max. 5)
                            </Text>
                            <GenreSelector
                                availableGenres={BOOK_GENRES}
                                selectedGenres={selectedGenres}
                                onGenreToggle={handleGenreToggle}
                            />
                        </>
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
            </View>

            {isEditing ? (
                <View style={styles.editActions}>
                    <TouchableOpacity 
                        style={[styles.button, styles.secondary]} 
                        onPress={handleEditCancel}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>Abbrechen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.primary]} 
                        onPress={handleEditSave}
                        disabled={saving}
                    >
                        <Text style={[styles.buttonText, styles.primaryText]}>
                            {saving ? "Speichern..." : "Speichern"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={[styles.button, styles.danger]} onPress={handleSignOut}>
                    <Text style={[styles.buttonText, styles.dangerText]}>Abmelden</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 32,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "300",
        color: "#000",
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#f8f8f8",
    },
    content: {
        flex: 1,
        gap: 32,
    },
    section: {
        gap: 12,
    },
    label: {
        fontSize: 12,
        color: "#999",
        fontWeight: "400",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: "#000",
        fontWeight: "400",
        lineHeight: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        color: "#000",
    },
    description: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
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
    editActions: {
        flexDirection: "row",
        gap: 16,
        paddingTop: 24,
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
    buttonText: {
        fontSize: 14,
        fontWeight: "400",
    },
    primary: {
        backgroundColor: "#000",
    },
    primaryText: {
        color: "#fff",
    },
    secondary: {
        backgroundColor: "#f8f8f8",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    danger: {
        backgroundColor: "#000",
        marginTop: 40,
    },
    dangerText: {
        color: "#fff",
    },
});
