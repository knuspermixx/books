import { signOut } from "firebase/auth";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";
import { useAuth } from "./contexts/AuthContext";

export default function ProfileScreen() {
    const { user } = useAuth();

    async function handleSignOut() {
        try {
            await signOut(auth);
            // Navigation wird automatisch durch AuthContext gehandhabt
        } catch (error) {
            console.error("Abmelde-Fehler:", error);
            Alert.alert("Fehler", "Fehler beim Abmelden");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>
            
            <View style={styles.userInfo}>
                <Text style={styles.userText}>Angemeldet als:</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Abmelden</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 30,
    },
    userInfo: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 250,
    },
    userText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 5,
        textAlign: "center",
    },
    email: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1976d2",
        textAlign: "center",
    },
    signOutButton: {
        backgroundColor: "#e53e3e",
        padding: 15,
        borderRadius: 8,
        minWidth: 200,
    },
    signOutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});
