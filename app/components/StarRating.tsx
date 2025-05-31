import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StarRatingProps {
  rating: number | null;
  size?: number;
  color?: string;
  inactiveColor?: string;
  showGray?: boolean; // Zeigt ausgegraute Sterne für unbewertete Bücher
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  color = "#FFD700",
  inactiveColor = "#E0E0E0",
  showGray = false
}) => {
  const renderStars = () => {
    const stars = [];
    
    // Wenn keine Bewertung vorhanden ist und showGray aktiviert ist
    if (rating === null && showGray) {
      for (let i = 0; i < 5; i++) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={size}
            color="#CCCCCC"
            style={{ marginRight: 2 }}
          />
        );
      }
      return stars;
    }
    
    // Wenn keine Bewertung vorhanden ist und showGray deaktiviert ist
    if (rating === null) {
      return null;
    }
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Vollständig gefüllter Stern
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={size}
            color={color}
            style={{ marginRight: 2 }}
          />
        );
      } else if (i - 0.5 <= rating) {
        // Halbgefüllter Stern
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={size}
            color={color}
            style={{ marginRight: 2 }}
          />
        );
      } else {
        // Leerer Stern
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={size}
            color={inactiveColor}
            style={{ marginRight: 2 }}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default StarRating;
