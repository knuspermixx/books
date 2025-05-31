import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

// Mock data - in a real app, this would come from your database  
const BOOK_TITLES = [
  'Der Herr der Ringe',
  'Harry Potter und der Stein der Weisen', 
  '1984',
  'Der Alchemist',
  'Stolz und Vorurteil',
  'Der Kleine Prinz',
  'Die Verwandlung',
  'Das Parfum',
  'Der Steppenwolf'
];

const BOOK_AUTHORS = [
  'J.R.R. Tolkien',
  'J.K. Rowling',
  'George Orwell', 
  'Paulo Coelho',
  'Jane Austen',
  'Antoine de Saint-Exupéry',
  'Franz Kafka',
  'Patrick Süskind',
  'Hermann Hesse'
];

const MOCK_BOOKS = Array.from({ length: 24 }, (_, index) => {
  const bookIndex = index % 9;
  return {
    id: String(bookIndex + 1), // Verwende die echten Buch-IDs 1-9 (wiederholt)
    title: BOOK_TITLES[bookIndex],
    author: BOOK_AUTHORS[bookIndex],
    cover: null,
  };
});

const BookCover = ({ book }: { book: typeof MOCK_BOOKS[0] }) => {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/book/${book.id}` as any);
  };

  return (
    <TouchableOpacity style={styles.bookItem} onPress={handlePress}>
      <View style={styles.bookCover}>
        <Ionicons name="book" size={20} color="#ccc" />
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
};

export default function LibraryCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  
  if (!config) {
    return (
      <View style={styles.container}>
        <Text>Kategorie nicht gefunden</Text>
      </View>
    );
  }

  const renderBook = ({ item }: { item: typeof MOCK_BOOKS[0] }) => (
    <BookCover book={item} />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: config.title,
        }}
      />
      <View style={styles.container}>        
        <FlatList
          data={MOCK_BOOKS}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.booksGrid}
          columnWrapperStyle={styles.bookRow}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  <Ionicons name={config.icon} size={20} color={config.color} />
                  <Text style={styles.categoryDescription}>{config.description}</Text>
                </View>
                <Text style={styles.bookCount}>{MOCK_BOOKS.length} Bücher</Text>
              </View>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bookItem: {
    flex: 1,
    maxWidth: '32%',
    alignItems: 'center',
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
});
