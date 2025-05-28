import { onAuthStateChanged, User } from "firebase/auth";
import { router } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth } from "../../config/firebaseConfig";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Navigation basierend auf Auth-Status
      if (user) {
        // Benutzer ist eingeloggt - zur Tab-Navigation weiterleiten
        router.replace("/(tabs)");
      } else {
        // Benutzer ist nicht eingeloggt - zur Auth-Seite weiterleiten
        router.replace("/auth");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
