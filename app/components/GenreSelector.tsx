import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GenreSelectorProps {
  availableGenres: string[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
}

export default function GenreSelector({ 
  availableGenres, 
  selectedGenres, 
  onGenreToggle 
}: GenreSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.genreGrid}>
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreChip,
                isSelected && styles.genreChipSelected
              ]}
              onPress={() => onGenreToggle(genre)}
            >
              <Text style={[
                styles.genreText,
                isSelected && styles.genreTextSelected
              ]}>
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  genreChipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  genreText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  genreTextSelected: {
    color: "#fff",
  },
});
