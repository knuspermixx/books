import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getShelfBooks, getUserBookRating } from "../../config/firestoreService";
import StarRating from "../components/StarRating";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_CONFIG = {
  completed: {
    title: 'Durchgelesen',
    icon: 'checkmark-circle-outline' as const,
    color: '#4CAF50',
    description: 'Alle Bücher, die du bereits gelesen hast'
  },
  reading: {
    title: 'Aktuell dabei',
    icon: 'book-outline' as const,
    color: '#2196F3',
    description: 'Bücher, die du gerade liest'
  },
  wishlist: {
    title: 'Leseliste',
    icon: 'bookmark-outline' as const,
    color: '#FF9800',
    description: 'Bücher, die du lesen möchtest'
  },
};

interface Book {
  id: string;
  title: string;
  authors: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  addedAt: string;
}

const BookCover = ({ book, showRating = false }: { book: Book; showRating?: boolean }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loadingRating, setLoadingRating] = useState(showRating);
  
  // Lade Benutzerbewertung wenn showRating aktiviert ist
  useEffect(() => {
    const loadUserRating = async () => {
      if (!showRating || !user || !book?.id) {
        setLoadingRating(false);
        return;
      }
      
      try {
        const rating = await getUserBookRating(user.uid, book.id);
        setUserRating(rating?.rating || null);
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerbewertung:", error);
        setUserRating(null);
      } finally {
        setLoadingRating(false);
      }
    };

    loadUserRating();
  }, [showRating, user, book?.id]);
  
  const handlePress = () => {
    router.push(`/book/${book.id}` as any);
  };

  // Wähle die beste verfügbare Bildquelle
  const imageSource = book.imageLinks?.thumbnail || 
                      book.imageLinks?.small || 
                      book.imageLinks?.medium || 
                      book.imageLinks?.smallThumbnail;

  return (
    <TouchableOpacity style={styles.bookItem} onPress={handlePress}>
      <View style={styles.bookCoverContainer}>
        <View style={styles.bookCover}>
          {imageSource ? (
            <Image 
              source={{ uri: imageSource }}
              style={styles.bookCoverImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="book" size={20} color="#ccc" />
          )}
        </View>
        {showRating && !loadingRating && (
          <View style={styles.bookRatingOverlay}>
            <StarRating 
              rating={userRating} 
              size={10} 
              showGray={true}
            />
          </View>
        )}
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {book.authors.join(', ')}
      </Text>
    </TouchableOpacity>
  );
};

export default function LibraryCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { user, refreshKey } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  
  const loadBooks = useCallback(async () => {
    if (!user || !category) return;
    
    try {
      const shelfBooks = await getShelfBooks(user.uid, category);
      setBooks(shelfBooks);
    } catch (error) {
      console.error("Fehler beim Laden der Bücher:", error);
      Alert.alert("Fehler", "Bücher konnten nicht geladen werden.");
      setBooks([]);
    }
  }, [user, category]);

  // Bücher beim ersten Laden
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadBooks();
      setLoading(false);
    };
    
    initialLoad();
  }, [loadBooks]);

  // Bücher neu laden, wenn sich der refreshKey ändert (z.B. nach einer Buchverschiebung)
  useEffect(() => {
    if (refreshKey > 0) {
      loadBooks();
    }
  }, [refreshKey, loadBooks]);

  // Bücher neu laden, wenn die Seite fokussiert wird (z.B. nach Navigation zurück)
  useFocusEffect(
    useCallback(() => {
      // Immer neu laden, wenn die Seite fokussiert wird
      loadBooks();
    }, [loadBooks])
  );

  // Pull-to-Refresh Funktion
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  }, [loadBooks]);
  
  if (!config) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Kategorie nicht gefunden",
            headerBackTitle: "Zurück",
          }}
        />
        <Text>Kategorie nicht gefunden</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen
          options={{
            title: config.title,
            headerBackTitle: "Zurück",
          }}
        />
        <ActivityIndicator size="large" color={config.color} />
        <Text style={styles.loadingText}>Bücher werden geladen...</Text>
      </View>
    );
  }

  const renderBook = ({ item }: { item: Book }) => (
    <BookCover book={item} showRating={category === 'completed'} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={config.icon} size={64} color="#ddd" />
      <Text style={styles.emptyTitle}>Noch keine Bücher</Text>
      <Text style={styles.emptyDescription}>
        {category === 'completed' && 'Du hast noch keine Bücher als gelesen markiert.'}
        {category === 'reading' && 'Du liest gerade keine Bücher.'}
        {category === 'wishlist' && 'Deine Leseliste ist noch leer.'}
      </Text>
      <Text style={styles.emptyHint}>
        Durchsuche Bücher und füge sie zu diesem Regal hinzu!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: config.title,
          headerBackTitle: "Zurück",
        }}
      />
      
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Ionicons name={config.icon} size={24} color={config.color} />
            <Text style={styles.categoryDescription}>
              {config.description}
            </Text>
          </View>
          <Text style={styles.bookCount}>
            {books.length} {books.length === 1 ? 'Buch' : 'Bücher'}
          </Text>
        </View>
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={books.length === 0 ? styles.emptyList : styles.booksGrid}
        columnWrapperStyle={books.length > 0 ? styles.bookRow : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#666"
            title="Aktualisieren..."
            titleColor="#666"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerInfo: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
    flex: 1,
  },
  bookCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'System',
  },
  booksGrid: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bookItem: {
    flex: 1,
    maxWidth: '32%',
    alignItems: 'center',
  },
  bookCoverContainer: {
    position: 'relative',
    width: '100%',
  },
  bookCover: {
    width: '100%',
    aspectRatio: 0.65,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
  },
  bookRatingOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'System',
  },
  bookAuthor: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});
