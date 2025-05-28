import { useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/LoadingScreen";

export default function Index() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    // Navigation wird automatisch durch AuthContext gehandhabt
    return <LoadingScreen />;
}
