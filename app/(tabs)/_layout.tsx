import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function TabsLayout() {
    const handleProfilePress = () => router.push("/profile");

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#000",
                tabBarInactiveTintColor: "#999",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#eee",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                headerStyle: {
                    backgroundColor: "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                },
                headerTintColor: "#000",
                headerTitleStyle: {
                    fontWeight: "300",
                    fontSize: 18,
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleProfilePress}
                        style={{ marginRight: 16 }}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#000" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Bibliothek",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: "Friends",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
