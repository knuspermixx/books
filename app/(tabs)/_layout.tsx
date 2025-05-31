import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, TouchableOpacity } from "react-native";
import { auth } from "../../config/firebaseConfig";

export default function TabsLayout() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Fehler", "Abmeldung fehlgeschlagen");
    }
  };

  const handleEditProfile = () => {
    // TODO: Implement profile editing trigger
    console.log("Profile edit triggered from header");
  };

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
     
        },
        headerTintColor: "#000",
        headerTitleStyle: {
          fontWeight: "300",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="friends"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                marginRight: 16,
                padding: 8,
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
