import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    BOOK_GENRES,
    updateGenres,
    updateStatus,
    updateUsername,
} from "../config/firestoreService";
import { useAuth } from "./contexts/AuthContext";

// Design System
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const COLORS = {
  primary: "#000",
  secondary: "#666",
  tertiary: "#999",
  border: "#e0e0e0",
  light: "#f0f0f0",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
  accent: "#9C27B0",
  rating: "#FFD700",
};

const GenreChip = ({ genre, isSelected, onPress, disabled }: {
  genre: string;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity
    style={[styles.chip, isSelected && styles.chipSelected]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
      {genre}
    </Text>
  </TouchableOpacity>
);

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function ProfileEditScreen() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState(userData?.username || "");
  const [selectedGenres, setSelectedGenres] = useState(userData?.genres || []);
  const [status, setStatus] = useState(userData?.status || "Was liest du gerade?");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || "");
      setSelectedGenres(userData.genres || []);
      setStatus(userData.status || "Was liest du gerade?");
    }
  }, [userData]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!user || !username.trim()) {
      return Alert.alert("Fehler", "Benutzername darf nicht leer sein");
    }
    
    setSaving(true);
    try {
      await Promise.all([
        updateUsername(user.uid, username.trim()),
        updateGenres(user.uid, selectedGenres),
        updateStatus(user.uid, status.trim()),
      ]);
      await refreshUserData();
      router.back();
    } catch {
      Alert.alert("Fehler", "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length >= 5
        ? (Alert.alert("Limit erreicht", "Du kannst maximal 5 Genres auswählen"), prev)
        : [...prev, genre]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleCancel}
          disabled={saving}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil bearbeiten</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, saving && styles.saveButtonTextDisabled]}>
            {saving ? "..." : "Speichern"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color={COLORS.tertiary} />
            </View>
            <TouchableOpacity style={styles.imageEdit}>
              <Ionicons name="camera" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileImageText}>Profilbild ändern</Text>
        </View>

        {/* Username */}
        <InfoSection title="Benutzername">
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Benutzername eingeben"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={COLORS.tertiary}
            editable={!saving}
          />
        </InfoSection>

        <View style={styles.divider} />

        {/* Status */}
        <InfoSection title="Status">
          <TextInput
            value={status}
            onChangeText={setStatus}
            style={[styles.input, styles.textArea]}
            placeholder="Was liest du gerade?"
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.tertiary}
            editable={!saving}
          />
        </InfoSection>

        <View style={styles.divider} />

        {/* Genres */}
        <InfoSection title="Lieblings-Genres">
          <Text style={styles.genreSubtitle}>
            Wähle bis zu 5 Genres aus ({selectedGenres.length}/5)
          </Text>
          <View style={styles.chipContainer}>
            {BOOK_GENRES.map((genre: string) => (
              <GenreChip
                key={genre}
                genre={genre}
                isSelected={selectedGenres.includes(genre)}
                onPress={() => handleGenreToggle(genre)}
                disabled={saving}
              />
            ))}
          </View>
        </InfoSection>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={[styles.buttonText, styles.cancelText]}>Abbrechen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, saving && styles.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.buttonText, styles.primaryText, saving && styles.primaryTextDisabled]}>
            {saving ? "Speichern..." : "Speichern"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: "#fff" },
  divider: { height: 1, backgroundColor: COLORS.light, marginVertical: SPACING.md },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  saveButtonTextDisabled: {
    color: COLORS.tertiary,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  
  // Profile Picture
  profileSection: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  imageEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileImageText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  
  // Sections
  section: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  
  // Input
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.primary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  
  // Genres
  genreSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  
  // Bottom Actions
  bottomActions: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.light,
    borderColor: COLORS.light,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: COLORS.secondary,
  },
  primaryText: {
    color: "#fff",
  },
  primaryTextDisabled: {
    color: COLORS.tertiary,
  },
});
