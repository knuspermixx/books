import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Book, getFantasyBooks, getRecommendedBooks, getTrendingBooks, getClassicBooks, getPhilosophyBooks, getMysteryBooks, getSciFiBooks, getRomanceBooks } from "../../services/googleBooksApi";

// Fallback-Bücherdaten wurden entfernt - alle Kategorien laden jetzt echte Bücher von der API

interface BookCategory {
    title: string;
    books: Book[];
    loading: boolean;
}

export default function LibraryScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [bookCategories, setBookCategories] = useState<Record<string, BookCategory>>({
        trending: { title: "📈 Trending diese Woche", books: [], loading: true },
        recommended: { title: "⭐ Empfohlene Bücher", books: [], loading: true },
        fantasy: { title: "🧙‍♂️ Fantasy Welten", books: [], loading: true },
        classics: { title: "📖 Deutsche Klassiker", books: [], loading: true },
        philosophy: { title: "💭 Philosophie & Weisheit", books: [], loading: true },
        mystery: { title: "🔍 Krimis & Thriller", books: [], loading: true },
        scifi: { title: "🚀 Science Fiction", books: [], loading: true },
        romance: { title: "💕 Romance", books: [], loading: true }
    });

    // Bücher laden
    const loadBooks = useCallback(async () => {
        console.log('Loading books from Google Books API...');
        try {
            // Alle Kategorien parallel laden
            const [
                fantasyBooks,
                trendingBooks,
                recommendedBooks,
                classicBooks,
                philosophyBooks,
                mysteryBooks,
                scifiBooks,
                romanceBooks
            ] = await Promise.all([
                getFantasyBooks(8),
                getTrendingBooks(6),
                getRecommendedBooks(8),
                getClassicBooks(6),
                getPhilosophyBooks(6),
                getMysteryBooks(6),
                getSciFiBooks(6),
                getRomanceBooks(6)
            ]);

            setBookCategories(prev => ({
                ...prev,
                fantasy: { ...prev.fantasy, books: fantasyBooks, loading: false },
                trending: { ...prev.trending, books: trendingBooks, loading: false },
                recommended: { ...prev.recommended, books: recommendedBooks, loading: false },
                classics: { ...prev.classics, books: classicBooks, loading: false },
                philosophy: { ...prev.philosophy, books: philosophyBooks, loading: false },
                mystery: { ...prev.mystery, books: mysteryBooks, loading: false },
                scifi: { ...prev.scifi, books: scifiBooks, loading: false },
                romance: { ...prev.romance, books: romanceBooks, loading: false }
            }));
        } catch (error) {
            console.error('Fehler beim Laden der Bücher:', error);
            // Bei Fehler loading auf false setzen
            setBookCategories(prev => ({
                ...prev,
                fantasy: { ...prev.fantasy, loading: false },
                trending: { ...prev.trending, loading: false },
                recommended: { ...prev.recommended, loading: false },
                classics: { ...prev.classics, loading: false },
                philosophy: { ...prev.philosophy, loading: false },
                mystery: { ...prev.mystery, loading: false },
                scifi: { ...prev.scifi, loading: false },
                romance: { ...prev.romance, loading: false }
            }));
        }
    }, []);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    // Pull-to-refresh Handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Alle Kategorien zurücksetzen
        setBookCategories(prev => Object.keys(prev).reduce((acc, key) => ({
            ...acc,
            [key]: { ...prev[key], loading: true }
        }), {} as typeof prev));
        
        await loadBooks();
        setRefreshing(false);
    }, [loadBooks]);

    const handleBookPress = (bookId: string) => {
        router.push(`/book/${bookId}`);
    };

    const renderBookItem = ({ item }: { item: Book }) => (
        <TouchableOpacity 
            style={styles.bookSliderItem} 
            onPress={() => handleBookPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.bookCover}>
                {item.imageLinks?.thumbnail ? (
                    <Image 
                        source={{ uri: item.imageLinks.thumbnail }}
                        style={styles.bookCoverImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.bookEmoji}>{item.cover}</Text>
                )}
            </View>
            {/* Nur das Cover anzeigen, keine weiteren Infos */}
        </TouchableOpacity>
    );

    const renderLoadingItem = () => (
        <View style={styles.bookSliderItem}>
            <View style={styles.bookCover}>
                <ActivityIndicator size="small" color="#666" />
            </View>
        </View>
    );

    const renderBookCategory = (categoryKey: string) => {
        const category = bookCategories[categoryKey];
        
        const handleSeeAll = () => {
            router.push(`/library/${categoryKey}` as any);
        };
        
        return (
            <View key={categoryKey} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <TouchableOpacity onPress={handleSeeAll}>
                        <Text style={styles.seeAllText}>Alle anzeigen</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={category.loading ? Array(6).fill(null) : category.books}
                    renderItem={category.loading ? renderLoadingItem : renderBookItem}
                    keyExtractor={(item, index) => category.loading ? `loading-${categoryKey}-${index}` : `${categoryKey}-${item?.id || index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sliderContainer}
                    ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Entdecken</Text>
                <Text style={styles.subtitle}>Finde dein nächstes Lieblingsbuch</Text>
            </View>
            
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#666"
                        title="Bücher aktualisieren..."
                        titleColor="#666"
                    />
                }
            >
                {Object.keys(bookCategories).map(renderBookCategory)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 24,
        gap: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#000",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        fontWeight: "400",
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 32,
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 32,
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: "500",
        color: "#000",
        letterSpacing: -0.3,
    },
    seeAllText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
    },
    sliderContainer: {
        paddingLeft: 32,
        paddingRight: 16,
    },
    bookSeparator: {
        width: 16,
    },
    bookSliderItem: {
        width: 120,
        alignItems: "center",
        gap: 8,
    },
    bookCover: {
        width: 120,
        height: 170,
        borderRadius: 12,
        backgroundColor: "#fafafa",
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    bookEmoji: {
        fontSize: 36,
    },
    bookTitle: {
        fontSize: 13,
        fontWeight: "500",
        color: "#000",
        textAlign: "center",
        lineHeight: 17,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    bookAuthor: {
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        fontWeight: "400",
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    star: {
        fontSize: 12,
        color: "#FFD700",
    },
    bookCoverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
});
