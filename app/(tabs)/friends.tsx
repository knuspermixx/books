import { StyleSheet, Text, View } from "react-native";

export default function FriendsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.description}>
                Verbinden Sie sich mit Freunden
            </Text>
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
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        fontWeight: "400",
    },
});
