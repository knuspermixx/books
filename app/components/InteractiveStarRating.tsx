import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  color?: string;
  inactiveColor?: string;
  disabled?: boolean;
}

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  color = "#FFD700",
  inactiveColor = "#E0E0E0",
  disabled = false
}) => {
  const handleStarPress = (starRating: number) => {
    if (!disabled) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= rating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Ionicons
            name={isActive ? "star" : "star-outline"}
            size={size}
            color={isActive ? color : inactiveColor}
          />
        </TouchableOpacity>
      );
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
  starButton: {
    padding: 4,
  },
});

export default InteractiveStarRating;
