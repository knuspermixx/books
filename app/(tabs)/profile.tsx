import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createUserShelf,
  deleteUserShelf,
  getUserShelves,
  updateUserShelf,
} from "../../config/firestoreService";
import ShelfModal from "../components/ShelfModal";
import { useAuth } from "../contexts/AuthContext";

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

const SOCIAL_STATS = [
  { number: "1.2k", label: "Follower" },
  { number: "842", label: "Folgt" },
];

const LIBRARY_SECTIONS = [
  { id: "completed", title: "Durchgelesen", icon: "checkmark-circle-outline", color: COLORS.success, count: 24 },
  { id: "reading", title: "Aktuell dabei", icon: "book-outline", color: COLORS.info, count: 3 },
  { id: "wishlist", title: "Leseliste", icon: "bookmark-outline", color: COLORS.warning, count: 12 },
];

const ACHIEVEMENTS = [
  { icon: "trophy", color: COLORS.rating, bg: "#4FC3F7" },
  { icon: "star", color: "#FF6B35", bg: "#BA68C8" },
  { icon: "flame", color: "#FF4081", bg: "#FF8A65" },
];

const ACTIVITY_TYPES = {
  completed: { icon: "checkmark-circle", color: COLORS.success },
  rating: { icon: "star", color: COLORS.rating },
  wishlist: { icon: "bookmark", color: COLORS.warning },
  follow: { icon: "person-add", color: COLORS.accent },
};

// Reusable Components
const Badge = ({ type, size = 20 }: { type: keyof typeof ACTIVITY_TYPES; size?: number }) => {
  const config = ACTIVITY_TYPES[type];
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={config.icon as any} size={size * 0.6} color={config.color} />
    </View>
  );
};

const StatItem = ({ number, label }: { number: string; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BookCover = ({ onPress, bookId }: { onPress?: () => void; bookId?: string }) => {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (bookId) {
      router.push(`/book/${bookId}` as any);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.bookCover}>
      <Ionicons name="book" size={24} color={COLORS.tertiary} />
    </TouchableOpacity>
  );
};

const GenreChip = ({ genre }: { genre: string }) => (
  <View style={[styles.chip, styles.chipSelected]}>
    <Text style={[styles.chipText, styles.chipTextSelected]}>
      {genre}
    </Text>
  </View>
);

const SocialStats = () => (
  <View style={styles.socialStats}>
    {SOCIAL_STATS.map((stat, index) => (
      <View key={index} style={styles.socialStatInline}>
        <StatItem number={stat.number} label={stat.label} />
        {index < SOCIAL_STATS.length - 1 && <View style={styles.socialStatDivider} />}
      </View>
    ))}
  </View>
);

const Achievements = () => (
  <View style={styles.achievementsRow}>
    {ACHIEVEMENTS.map((achievement, index) => (
      <View
        key={index}
        style={[
          styles.achievementCircle,
          { backgroundColor: achievement.bg, marginLeft: index > 0 ? -SPACING.sm : 0 }
        ]}
      >
        <Ionicons name={achievement.icon as any} size={22} color={achievement.color} />
      </View>
    ))}
    <Text style={styles.achievementsText}>16 Erfolge</Text>
    <TouchableOpacity>
      <Ionicons name="chevron-forward" size={16} color={COLORS.tertiary} />
    </TouchableOpacity>
  </View>
);

const LibrarySection = ({ section, onEdit }: { section: any; onEdit: (section: any) => void }) => {
  const router = useRouter();
  const handleShowAll = () => router.push(`/library/${section.id}`);
  
  // Standard-Regale können nicht bearbeitet werden
  const isStandardShelf = ["completed", "reading", "wishlist"].includes(section.id);

  return (
    <View style={styles.librarySection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={section.icon as any} size={20} color={section.color} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.count}>{section.count}</Text>
        </View>
        <View style={styles.sectionActions}>
          {!isStandardShelf && (
            <TouchableOpacity onPress={() => onEdit(section)} style={styles.editButton}>
              <Ionicons name="create-outline" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleShowAll} style={styles.showAll}>
            <Text style={styles.showAllText}>Alle anzeigen</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalBookList}>
        {Array.from({ length: 8 }, (_, index) => {
          // Mock-Buch-IDs für Demo-Zwecke
          const bookId = String(index + 1);
          return <BookCover key={index} bookId={bookId} />;
        })}
      </ScrollView>
    </View>
  );
};

const Library = () => {
  const { user } = useAuth();
  const [shelves, setShelves] = useState(LIBRARY_SECTIONS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShelf, setEditingShelf] = useState<any>(null);

  const loadUserShelves = useCallback(async () => {
    if (!user) return;
    try {
      const userShelves = await getUserShelves(user.uid);
      setShelves(userShelves);
    } catch (error) {
      console.error("Fehler beim Laden der Regale:", error);
    }
  }, [user]);

  useEffect(() => {
    loadUserShelves();
  }, [loadUserShelves]);

  const handleCreateShelf = () => {
    setEditingShelf(null);
    setIsModalVisible(true);
  };

  const handleEditShelf = (shelf: any) => {
    setEditingShelf(shelf);
    setIsModalVisible(true);
  };

  const handleSaveShelf = async (shelfData: any) => {
    if (!user) return;
    
    try {
      if (editingShelf) {
        // Bearbeiten
        await updateUserShelf(user.uid, editingShelf.id, shelfData);
      } else {
        // Erstellen
        await createUserShelf(user.uid, shelfData);
      }
      await loadUserShelves();
    } catch (error) {
      console.error("Fehler beim Speichern des Regals:", error);
      Alert.alert("Fehler", "Das Regal konnte nicht gespeichert werden.");
    }
  };

  const handleDeleteShelf = async () => {
    if (!user || !editingShelf) return;
    
    try {
      await deleteUserShelf(user.uid, editingShelf.id);
      await loadUserShelves();
    } catch (error) {
      console.error("Fehler beim Löschen des Regals:", error);
      Alert.alert("Fehler", "Das Regal konnte nicht gelöscht werden.");
    }
  };

  return (
    <View style={styles.container}>
      {shelves.map((section, index) => (
        <View key={section.id}>
          <LibrarySection section={section} onEdit={handleEditShelf} />
          {index < shelves.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
      
      {/* Neues Regal hinzufügen */}
      <View style={styles.addShelfSection}>
        <TouchableOpacity style={styles.addShelfButton} onPress={handleCreateShelf}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.addShelfText}>Neues Regal erstellen</Text>
        </TouchableOpacity>
      </View>

      <ShelfModal
        visible={isModalVisible}
        shelf={editingShelf}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveShelf}
        onDelete={handleDeleteShelf}
      />
    </View>
  );
};

const ActivityItem = ({ type, action, content, time, bookId, onPress }: {
  type: keyof typeof ACTIVITY_TYPES;
  action: string;
  content: string;
  time: string;
  bookId?: string;
  onPress?: () => void;
}) => (
  <View style={styles.activityItem}>
    {type === 'follow' ? (
      <View style={styles.activityIconContainer}>
        <Badge type={type} />
      </View>
    ) : (
      <BookCover onPress={onPress} bookId={bookId} />
    )}
    <View style={styles.activityContent}>
      <View style={styles.activityHeader}>
        {type !== 'follow' && <Badge type={type} size={20} />}
        <Text style={styles.activityAction}>{action}</Text>
      </View>
      <Text style={styles.activityText}>{content}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

const Activities = () => {
  const router = useRouter();
  const activities = [
    {
      type: 'completed' as const,
      action: 'Als gelesen markiert',
      content: 'Der Herr der Ringe',
      time: 'vor 2 Stunden',
      bookId: '1',
      onPress: () => router.push('/book/1' as any),
    },
    {
      type: 'rating' as const,
      action: 'Mit 5 Sternen bewertet',
      content: '1984',
      time: 'gestern',
      bookId: '3',
      onPress: () => router.push('/book/3' as any),
    },
    {
      type: 'wishlist' as const,
      action: 'Zur Leseliste hinzugefügt',
      content: 'Harry Potter und der Stein der Weisen',
      time: 'vor 3 Tagen',
      bookId: '2',
      onPress: () => router.push('/book/2' as any),
    },
    {
      type: 'follow' as const,
      action: 'Folgt jetzt',
      content: '@bookworm_sarah',
      time: 'vor 1 Woche',
    },
  ];

  return (
    <View style={styles.container}>
      {activities.map((activity, index) => (
        <View key={index}>
          <ActivityItem {...activity} />
          {index < activities.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
};

const MemberSince = ({ createdAt }: { createdAt?: string }) => {
  if (!createdAt) return null;
  const date = new Date(createdAt).toLocaleDateString("de-DE", {
    year: "numeric", month: "long", day: "numeric",
  });
  return (
    <View style={styles.memberSince}>
      <Ionicons name="calendar-outline" size={12} color={COLORS.tertiary} />
      <Text style={styles.memberSinceText}>Mitglied seit {date}</Text>
    </View>
  );
};

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Info = ({ userData }: { userData: any }) => (
  <View style={styles.container}>
    <InfoSection title="Über mich">
      <Text style={styles.statusText}>{userData?.status || "Was liest du gerade?"}</Text>
    </InfoSection>

    <View style={styles.divider} />

    <InfoSection title="Lieblings-Genres">
      {userData?.genres && userData.genres.length > 0 ? (
        <View style={styles.chipContainer}>
          {userData.genres.map((genre: string) => (
            <GenreChip key={genre} genre={genre} />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Keine Genres ausgewählt</Text>
      )}
    </InfoSection>
  </View>
);

export default function ProfileScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");

  const handleEditPress = () => {
    router.push("/profile-edit");
  };

  const totalBooks = LIBRARY_SECTIONS.reduce((sum, section) => sum + section.count, 0);
  
  const tabs = [
    { id: "info", label: "Info" },
    { id: "library", label: `Bibliothek (${totalBooks})` },
    { id: "activities", label: "Aktivitäten" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color={COLORS.tertiary} />
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{userData?.username || "Benutzername"}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <SocialStats />
            <Achievements />
            <MemberSince createdAt={userData?.createdAt} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {activeTab === "info" ? (
        <Info userData={userData} />
      ) : activeTab === "library" ? (
        <Library />
      ) : (
        <Activities />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: "#fff" },
  divider: { height: 1, backgroundColor: COLORS.light },
  
  // Header
  header: { backgroundColor: "#fff", paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  profileRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.lg },
  profileImageContainer: { position: "relative" },
  profileImage: {
    width: 130, height: 130, borderRadius: 100, backgroundColor: "transparent",
    justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: COLORS.border,
  },
  imageEdit: {
    position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14,
    backgroundColor: "transparent", justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  userInfo: { flex: 1, gap: SPACING.md },
  usernameRow: { flexDirection: "row", alignItems: "center" },
  username: { fontSize: 20, color: COLORS.primary, fontWeight: "600", flex: 1 },
  editButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "transparent",
    borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center",
    marginLeft: SPACING.sm,
  },
  
  // Social Stats
  socialStats: { flexDirection: "row", alignItems: "center", gap: SPACING.lg },
  socialStatInline: { flexDirection: "row", alignItems: "baseline", gap: SPACING.xs },
  socialStatDivider: { width: 1, height: 12, backgroundColor: COLORS.border },
  
  // Stats
  statItem: { flexDirection: "row", alignItems: "baseline", gap: SPACING.xs },
  statNumber: { fontSize: 16, fontWeight: "600", color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.secondary, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  
  // Achievements
  achievementsRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  achievementCircle: {
    width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center",
    backgroundColor: COLORS.light, marginRight: -4, borderWidth: 3, borderColor: "#fff",
  },
  achievementsText: { fontSize: 12, color: COLORS.secondary, fontWeight: "500", marginLeft: SPACING.sm, marginRight: SPACING.xs  },
  
  // Tabs
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingTop: SPACING.xxl },
  tab: { width: "33.333%", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.lg, position: "relative" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "500", color: COLORS.secondary, textAlign: "center" },
  tabTextActive: { color: COLORS.primary, fontWeight: "600" },
  
  // Content Sections
  section: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.primary, marginBottom: SPACING.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  sectionActions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  showAll: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  showAllText: { fontSize: 12, color: COLORS.secondary, fontWeight: "500" },
  count: {
    fontSize: 11, color: COLORS.secondary, backgroundColor: "transparent",
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8, fontWeight: "500",
  },
  
  // Status and Text
  statusText: { fontSize: 14, color: COLORS.secondary, lineHeight: 20 },
  emptyText: { fontSize: 12, color: "#ccc", fontStyle: "italic" },
  
  // Chips
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: SPACING.lg, paddingVertical: 10, borderRadius: 6, backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08,
    shadowRadius: 2, elevation: 1, marginBottom: 6, marginRight: 6,
  },
  chipSelected: {
    backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  chipText: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
  chipTextSelected: { color: COLORS.primary, fontWeight: "600" },
  
  // Badge
  badge: {
    alignItems: "center", justifyContent: "center", backgroundColor: "transparent",
    borderWidth: 1, borderColor: COLORS.border,
  },
  
  // Member Since
  memberSince: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  memberSinceText: { fontSize: 11, color: COLORS.tertiary, fontWeight: "500" },
  
  // Library
  librarySection: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl },
  horizontalBookList: { gap: SPACING.md },
  bookCover: {
    width: 110, height: 160, backgroundColor: "transparent", borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 6, justifyContent: "center", alignItems: "center",
  },
  
  // Activities
  activityItem: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl },
  activityIconContainer: { width: 110, height: 160, alignItems: "center", justifyContent: "center" },
  activityHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  activityAction: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: COLORS.secondary, lineHeight: 20, marginBottom: 4 },
  activityTime: { fontSize: 12, color: COLORS.tertiary, fontWeight: "500" },
  
  // Add Shelf
  addShelfSection: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl },
  addShelfButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    paddingVertical: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, borderStyle: "dashed",
  },
  addShelfText: { fontSize: 14, color: COLORS.secondary, fontWeight: "500" },
});
