import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebaseConfig";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    async function handleAuth() {
        if (!email || !password) {
            Alert.alert("Fehler", "Bitte E-Mail und Passwort eingeben");
            return;
        }

        setLoading(true);
        
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                // Navigation wird automatisch durch AuthContext gehandhabt
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                // Nach erfolgreicher Registrierung automatisch eingeloggt
                // Navigation wird automatisch durch AuthContext gehandhabt
            }
        } catch (error: any) {
            console.error("Auth Fehler:", error);
            let errorMessage = "Ein Fehler ist aufgetreten";
            
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "Diese E-Mail-Adresse wird bereits verwendet";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Das Passwort ist zu schwach (mindestens 6 Zeichen)";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Ungültige E-Mail-Adresse";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "Benutzer nicht gefunden";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Falsches Passwort";
            } else if (error.code === "auth/invalid-credential") {
                errorMessage = "Ungültige Anmeldedaten";
            }
            
            Alert.alert("Fehler", errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isLogin ? "Anmelden" : "Registrieren"}
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="E-Mail"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Passwort"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                />
            </View>

            <TouchableOpacity 
                style={[styles.button_container, loading && styles.buttonDisabled]} 
                onPress={handleAuth}
                disabled={loading}
            >
                <Text style={styles.button_text}>
                    {loading ? "Wird verarbeitet..." : (isLogin ? "Anmelden" : "Registrieren")}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.switchButton} 
                onPress={() => setIsLogin(!isLogin)}
            >
                <Text style={styles.switchText}>
                    {isLogin 
                        ? "Noch kein Konto? Registrieren" 
                        : "Bereits ein Konto? Anmelden"
                    }
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 28,
        marginBottom: 30,
        color: "#333",
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    button_text: {
        textAlign: "center",
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
    button_container: {
        borderRadius: 8,
        margin: 16,
        padding: 15,
        justifyContent: "center",
        backgroundColor: "#1976d2",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    switchButton: {
        marginTop: 20,
        padding: 10,
    },
    switchText: {
        textAlign: "center",
        fontSize: 16,
        color: "#1976d2",
    },
});
