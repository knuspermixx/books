import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LibraryScreen() {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bibliothek</Text>
            <Text style={styles.subtitle}>Willkommen, {user?.email}</Text>
            <Text style={styles.description}>
                Hier können Sie Ihre Bücher verwalten.
            </Text>
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
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
});
