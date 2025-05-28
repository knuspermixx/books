import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.text}>Lade...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        color: "#666",
    },
});
