import { Stack } from "expo-router";
import { AuthProvider } from "./contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: true, 
            title: "Profil",
            headerStyle: { backgroundColor: "#1976d2" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" }
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
