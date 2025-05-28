import { signOut } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";
import { updateUsername } from "../config/firestoreService";
import { useAuth } from "./contexts/AuthContext";

export default function ProfileScreen() {
    const { user, userData, refreshUserData } = useAuth();
    const [username, setUsername] = useState(userData?.username || "");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch {
            Alert.alert("Fehler", "Abmeldung fehlgeschlagen");
        }
    };

    const handleSave = async () => {
        if (!user || !username.trim()) return;

        setSaving(true);
        try {
            await updateUsername(user.uid, username.trim());
            await refreshUserData();
            setIsEditing(false);
        } catch {
            Alert.alert("Fehler", "Speichern fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setUsername(userData?.username || "");
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>E-Mail</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.label}>Benutzername</Text>
                    {isEditing ? (
                        <View style={styles.editForm}>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Benutzername"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!saving}
                            />
                            <View style={styles.actions}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.secondary]} 
                                    onPress={handleCancel}
                                    disabled={saving}
                                >
                                    <Text style={styles.buttonText}>Abbrechen</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.button, styles.primary]} 
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    <Text style={[styles.buttonText, styles.primaryText]}>
                                        {saving ? "..." : "Speichern"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.field}>
                            <Text style={styles.value}>
                                {userData?.username || "Nicht gesetzt"}
                            </Text>
                            <TouchableOpacity 
                                style={styles.link} 
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.linkText}>Bearbeiten</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity style={[styles.button, styles.danger]} onPress={handleSignOut}>
                <Text style={[styles.buttonText, styles.dangerText]}>Abmelden</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 32,
        justifyContent: "space-between",
    },
    content: {
        gap: 40,
    },
    section: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        color: "#000",
        fontWeight: "400",
    },
    editForm: {
        gap: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#fff",
        color: "#000",
    },
    actions: {
        flexDirection: "row",
        gap: 16,
    },
    field: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 4,
        alignItems: "center",
        flex: 1,
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
        borderColor: "#ddd",
    },
    link: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    linkText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
    },
    danger: {
        backgroundColor: "#000",
        marginTop: 40,
    },
    dangerText: {
        color: "#fff",
    },
});
