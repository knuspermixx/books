import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { createUserDocument, getUserDocument } from "../../config/firestoreService";

interface UserData {
  username?: string;
  email: string;
  genres: string[];
  status?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
});

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserDocument(user.uid);
        setUserData(data as UserData | null);
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Prüfen, ob Benutzer-Dokument existiert
          let userData = await getUserDocument(user.uid);
          
          // Falls nicht, erstelle ein neues Dokument
          if (!userData) {
            await createUserDocument(user.uid, {
              email: user.email || "",
            });
            userData = await getUserDocument(user.uid);
          }
          
          setUserData(userData as UserData | null);
          // Benutzer ist eingeloggt - zur Tab-Navigation weiterleiten
          router.replace("/(tabs)");
        } catch (error) {
          console.error("Fehler beim Laden/Erstellen der Benutzerdaten:", error);
          setUserData(null);
        }
      } else {
        // Benutzer ist nicht eingeloggt
        setUserData(null);
        router.replace("/auth");
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData, refreshKey, triggerRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
