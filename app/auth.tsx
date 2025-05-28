import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";

const ERROR_MESSAGES = {
    "auth/email-already-in-use": "E-Mail bereits vergeben",
    "auth/weak-password": "Passwort zu schwach", 
    "auth/invalid-email": "Ungültige E-Mail",
    "auth/user-not-found": "Benutzer nicht gefunden",
    "auth/wrong-password": "Falsches Passwort",
    "auth/invalid-credential": "Ungültige Anmeldedaten",
} as const;

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Fehler", "Bitte alle Felder ausfüllen");
            return;
        }

        setLoading(true);
        try {
            await (isLogin 
                ? signInWithEmailAndPassword(auth, email.trim(), password)
                : createUserWithEmailAndPassword(auth, email.trim(), password)
            );
        } catch (error: any) {
            Alert.alert("Fehler", ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || "Anmeldung fehlgeschlagen");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    {isLogin ? "Anmelden" : "Registrieren"}
                </Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-Mail"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        editable={!loading}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Passwort"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                        editable={!loading}
                    />
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.button, styles.primary, loading && styles.disabled]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={[styles.buttonText, styles.primaryText]}>
                            {loading ? "..." : (isLogin ? "Anmelden" : "Registrieren")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.link} 
                        onPress={() => setIsLogin(!isLogin)}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>
                            {isLogin ? "Konto erstellen" : "Anmelden"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    content: {
        gap: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "300",
        color: "#000",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    form: {
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
        gap: 24,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 4,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "400",
    },
    primary: {
        backgroundColor: "#000",
    },
    primaryText: {
        color: "#fff",
    },
    link: {
        alignItems: "center",
        paddingVertical: 8,
    },
    linkText: {
        fontSize: 15,
        color: "#666",
        fontWeight: "400",
    },
    disabled: {
        opacity: 0.6,
    },
});
