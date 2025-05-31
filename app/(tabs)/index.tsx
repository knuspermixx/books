import { useRouter } from "expo-router";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Bücherdaten - in einer echten App würden diese aus einer API oder Datenbank kommen
const ALL_BOOKS = [
    { id: "1", title: "Der Herr der Ringe", author: "J.R.R. Tolkien", cover: "📚", rating: 5, genre: "Fantasy" },
    { id: "2", title: "Harry Potter", author: "J.K. Rowling", cover: "⚡", rating: 4, genre: "Fantasy" },
    { id: "3", title: "1984", author: "George Orwell", cover: "👁", rating: 5, genre: "Dystopie" },
    { id: "4", title: "Der Alchemist", author: "Paulo Coelho", cover: "✨", rating: 3, genre: "Philosophie" },
    { id: "5", title: "Stolz und Vorurteil", author: "Jane Austen", cover: "💕", rating: 4, genre: "Klassiker" },
    { id: "6", title: "Der Kleine Prinz", author: "Antoine de Saint-Exupéry", cover: "🌟", rating: 5, genre: "Philosophie" },
    { id: "7", title: "Die Verwandlung", author: "Franz Kafka", cover: "🪲", rating: 4, genre: "Klassiker" },
    { id: "8", title: "Das Parfum", author: "Patrick Süskind", cover: "🌹", rating: 4, genre: "Krimi" },
    { id: "9", title: "Der Steppenwolf", author: "Hermann Hesse", cover: "🐺", rating: 3, genre: "Klassiker" },
    { id: "10", title: "Faust", author: "Johann Wolfgang von Goethe", cover: "🎭", rating: 4, genre: "Klassiker" },
    { id: "11", title: "Die Buddenbrooks", author: "Thomas Mann", cover: "🏛️", rating: 4, genre: "Klassiker" },
    { id: "12", title: "Der Zauberberg", author: "Thomas Mann", cover: "🏔️", rating: 3, genre: "Klassiker" },
    { id: "13", title: "Die unendliche Geschichte", author: "Michael Ende", cover: "🐉", rating: 5, genre: "Fantasy" },
    { id: "14", title: "Der Name der Rose", author: "Umberto Eco", cover: "🌹", rating: 4, genre: "Krimi" },
    { id: "15", title: "Brave New World", author: "Aldous Huxley", cover: "🧬", rating: 4, genre: "Dystopie" },
    { id: "16", title: "Siddharta", author: "Hermann Hesse", cover: "🧘", rating: 4, genre: "Philosophie" },
];

// Kategorien für die Slider
const BOOK_CATEGORIES = {
    trending: {
        title: "📈 Trending diese Woche",
        books: ALL_BOOKS.filter(book => [5, 4].includes(book.rating)).slice(0, 6)
    },
    recommended: {
        title: "⭐ Empfohlene Bücher", 
        books: ALL_BOOKS.filter(book => book.rating === 5)
    },
    fantasy: {
        title: "🧙‍♂️ Fantasy Welten",
        books: ALL_BOOKS.filter(book => book.genre === "Fantasy")
    },
    classics: {
        title: "📖 Deutsche Klassiker",
        books: ALL_BOOKS.filter(book => book.genre === "Klassiker").slice(0, 6)
    },
    philosophy: {
        title: "💭 Philosophie & Weisheit",
        books: ALL_BOOKS.filter(book => book.genre === "Philosophie")
    },
    mystery: {
        title: "🔍 Krimis & Thriller",
        books: ALL_BOOKS.filter(book => book.genre === "Krimi")
    }
};

export default function LibraryScreen() {
    const router = useRouter();

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Text key={i} style={styles.star}>
                {i < rating ? "★" : "☆"}
            </Text>
        ));
    };

    const handleBookPress = (bookId: string) => {
        router.push(`/book/${bookId}`);
    };

    const renderBookItem = ({ item }: { item: typeof ALL_BOOKS[0] }) => (
        <TouchableOpacity 
            style={styles.bookSliderItem} 
            onPress={() => handleBookPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.bookCover}>
                <Text style={styles.bookEmoji}>{item.cover}</Text>
            </View>
            {/* Nur das Cover anzeigen, keine weiteren Infos */}
        </TouchableOpacity>
    );

    const renderBookCategory = (categoryKey: keyof typeof BOOK_CATEGORIES) => {
        const category = BOOK_CATEGORIES[categoryKey];
        const handleSeeAll = () => {
            // Navigiere zum neuen Kategorie-Listen-Screen und übergebe Titel und Bücher als JSON
            router.push({
                pathname: "/library/category-list",
                params: {
                    title: category.title,
                    books: JSON.stringify(category.books),
                },
            });
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
                    data={category.books}
                    renderItem={renderBookItem}
                    keyExtractor={(item) => `${categoryKey}-${item.id}`}
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
            >
                {(Object.keys(BOOK_CATEGORIES) as (keyof typeof BOOK_CATEGORIES)[]).map(renderBookCategory)}
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
});
