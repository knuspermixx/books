import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.text}>Lade...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        gap: 20,
    },
    text: {
        fontSize: 16,
        color: "#666",
        fontWeight: "400",
    },
});
