import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LibraryScreen() {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bibliothek</Text>
            <Text style={styles.subtitle}>Willkommen, {user?.email}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 32,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "300",
        color: "#000",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        fontWeight: "400",
    },
});
