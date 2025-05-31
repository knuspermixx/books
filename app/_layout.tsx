import { Stack } from "expo-router";
import AuthProvider from "./contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="library/[category]" 
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: "#000",
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
            headerBackTitle: "",
          }}
        />
        <Stack.Screen 
          name="book/[id]" 
          options={{
            headerShown: true,
            title: "Buchdetails",
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: "#000",
            headerTitleStyle: {
              fontWeight: "300",
              fontSize: 18,
            },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
