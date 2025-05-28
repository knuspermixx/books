import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function TabsLayout() {
    function handleProfilePress() {
        router.push("/profile");
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#1976d2",
                tabBarInactiveTintColor: "#666",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#e0e0e0",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                headerStyle: {
                    backgroundColor: "#1976d2",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleProfilePress}
                        style={{ marginRight: 15 }}
                    >
                        <Ionicons name="person-circle" size={28} color="#fff" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Bibliothek",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="discover"
                options={{
                    title: "Discover",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: "Friends",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
