import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  error: "#f44336",
};

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

const AVAILABLE_ICONS = [
  "library-outline",
  "book-outline",
  "bookmark-outline",
  "heart-outline",
  "star-outline",
  "trophy-outline",
  "time-outline",
  "checkmark-circle-outline",
  "add-circle-outline",
  "folder-outline",
];

const AVAILABLE_COLORS = [
  "#4CAF50", // Grün
  "#2196F3", // Blau
  "#FF9800", // Orange
  "#9C27B0", // Lila
  "#F44336", // Rot
  "#795548", // Braun
  "#607D8B", // Blau-Grau
  "#FF5722", // Tiefes Orange
  "#3F51B5", // Indigo
  "#009688", // Teal
];

interface ShelfModalProps {
  visible: boolean;
  shelf?: any;
  onClose: () => void;
  onSave: (shelfData: any) => void;
  onDelete?: () => void;
}

export default function ShelfModal({ visible, shelf, onClose, onSave, onDelete }: ShelfModalProps) {
  const [title, setTitle] = useState(shelf?.title || "");
  const [selectedIcon, setSelectedIcon] = useState(shelf?.icon || "library-outline");
  const [selectedColor, setSelectedColor] = useState(shelf?.color || AVAILABLE_COLORS[0]);
  const [isPrivate, setIsPrivate] = useState(shelf?.isPrivate || false);
  const [isIconSelectorVisible, setIsIconSelectorVisible] = useState(false);
  const [isColorSelectorVisible, setIsColorSelectorVisible] = useState(false);

  const isEditing = !!shelf;
  const isDefaultShelf = shelf && ["completed", "reading", "wishlist"].includes(shelf.id);

  // Aktualisiere Formular-Felder wenn sich das shelf-Objekt ändert
  useEffect(() => {
    if (visible) {
      setTitle(shelf?.title || "");
      setSelectedIcon(shelf?.icon || "library-outline");
      setSelectedColor(shelf?.color || AVAILABLE_COLORS[0]);
      setIsPrivate(shelf?.isPrivate || false);
      setIsIconSelectorVisible(false);
      setIsColorSelectorVisible(false);
    }
  }, [visible, shelf]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Fehler", "Bitte geben Sie einen Titel für das Regal ein.");
      return;
    }

    // Prüfung auf Standard-Regal-Namen
    const standardShelfNames = ["durchgelesen", "aktuell dabei", "leseliste"];
    if (standardShelfNames.includes(title.trim().toLowerCase())) {
      Alert.alert("Fehler", "Dieser Name ist für Standard-Regale reserviert. Bitte wählen Sie einen anderen Namen.");
      return;
    }

    onSave({
      title: title.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isPrivate: isPrivate,
    });

    // Reset form
    setTitle("");
    setSelectedIcon("library-outline");
    setSelectedColor(AVAILABLE_COLORS[0]);
    setIsPrivate(false);
    onClose();
  };

  const handleDelete = () => {
    if (isDefaultShelf) {
      Alert.alert("Fehler", "Standard-Regale können nicht gelöscht werden.");
      return;
    }

    Alert.alert(
      "Regal löschen",
      `Möchten Sie das Regal "${shelf?.title}" wirklich löschen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setTitle(shelf?.title || "");
    setSelectedIcon(shelf?.icon || "library-outline");
    setSelectedColor(shelf?.color || AVAILABLE_COLORS[0]);
    setIsPrivate(shelf?.isPrivate || false);
    setIsIconSelectorVisible(false);
    setIsColorSelectorVisible(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Abbrechen</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {isEditing ? "Regal bearbeiten" : "Neues Regal"}
          </Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.saveButtonText]}>
              Speichern
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Titel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Titel</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Regal-Name eingeben"
              maxLength={30}
              editable={!isDefaultShelf}
            />
          </View>

          {/* Icon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => !isDefaultShelf && setIsIconSelectorVisible(!isIconSelectorVisible)}
              disabled={isDefaultShelf}
            >
              <View style={styles.selectorContent}>
                <Ionicons name={selectedIcon as any} size={24} color={selectedColor} />
                <Text style={styles.selectorText}>Symbol auswählen</Text>
              </View>
              {!isDefaultShelf && (
                <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
              )}
            </TouchableOpacity>

            {isIconSelectorVisible && (
              <View style={styles.grid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.gridItem,
                      selectedIcon === icon && styles.gridItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedIcon(icon);
                      setIsIconSelectorVisible(false);
                    }}
                  >
                    <Ionicons name={icon as any} size={24} color={selectedColor} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Farbe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farbe</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => !isDefaultShelf && setIsColorSelectorVisible(!isColorSelectorVisible)}
              disabled={isDefaultShelf}
            >
              <View style={styles.selectorContent}>
                <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                <Text style={styles.selectorText}>Farbe auswählen</Text>
              </View>
              {!isDefaultShelf && (
                <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
              )}
            </TouchableOpacity>

            {isColorSelectorVisible && (
              <View style={styles.colorGrid}>
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedColor(color);
                      setIsColorSelectorVisible(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Privatsphäre */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privatsphäre</Text>
            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => !isDefaultShelf && setIsPrivate(!isPrivate)}
              disabled={isDefaultShelf}
            >
              <View style={styles.privacyToggleContent}>
                <View>
                  <Text style={styles.privacyToggleTitle}>
                    {isPrivate ? "Privates Regal" : "Öffentliches Regal"}
                  </Text>
                  <Text style={styles.privacyToggleDescription}>
                    {isPrivate 
                      ? "Nur du kannst dieses Regal sehen" 
                      : "Andere können dieses Regal sehen"
                    }
                  </Text>
                </View>
                <View style={styles.privacyToggleRight}>
                  <Ionicons 
                    name={isPrivate ? "lock-closed" : "lock-open-outline"} 
                    size={20} 
                    color={isPrivate ? COLORS.warning : COLORS.secondary} 
                  />
                  {!isDefaultShelf && (
                    <View style={[
                      styles.toggleSwitch, 
                      isPrivate && styles.toggleSwitchActive
                    ]}>
                      <View style={[
                        styles.toggleSwitchThumb,
                        isPrivate && styles.toggleSwitchThumbActive
                      ]} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Vorschau */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vorschau</Text>
            <View style={styles.preview}>
              <View style={styles.previewHeader}>
                <Ionicons name={selectedIcon as any} size={20} color={selectedColor} />
                <Text style={styles.previewTitle}>{title || "Regal-Name"}</Text>
                {isPrivate && (
                  <Ionicons name="lock-closed" size={16} color={COLORS.warning} />
                )}
                <View style={styles.previewCount}>
                  <Text style={styles.previewCountText}>0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Delete Button */}
          {isEditing && !isDefaultShelf && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Regal löschen</Text>
            </TouchableOpacity>
          )}

          {isDefaultShelf && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>
                Standard-Regale können nicht bearbeitet oder gelöscht werden.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    paddingVertical: SPACING.sm,
  },
  headerButtonText: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.primary,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  gridItem: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridItemSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: COLORS.primary,
  },
  preview: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    flex: 1,
  },
  previewCount: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewCountText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    marginTop: SPACING.xl,
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: COLORS.light,
    padding: SPACING.lg,
    borderRadius: 8,
    marginTop: SPACING.xl,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    flex: 1,
    lineHeight: 20,
  },
  privacyToggle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  privacyToggleContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  privacyToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },
  privacyToggleDescription: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  privacyToggleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.success,
  },
  toggleSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  toggleSwitchThumbActive: {
    alignSelf: "flex-end",
  },
});
