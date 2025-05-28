import { StyleSheet, Text, View } from "react-native";

export default function FriendsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.description}>
                Verbinden Sie sich mit Freunden und teilen Sie Ihre Lesefortschritte.
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
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});
