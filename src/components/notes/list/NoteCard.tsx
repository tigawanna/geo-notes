import type { TNote } from "@/lib/drizzle/schema";
import { formatKillometers } from "@/utils/note-utils";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Checkbox, Text, useTheme } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

const CARD_SPACING = 8;

export interface NoteWithDistance extends TNote {
  latitude: string;
  longitude: string;
  distance_km: number;
}

interface NoteCardProps {
  note: NoteWithDistance;
  isSelectionMode: boolean;
  isSelected: boolean;
  isLocationLoading: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function NoteCard({
  note,
  isSelectionMode,
  isSelected,
  isLocationLoading,
  onPress,
  onLongPress,
}: NoteCardProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={onPress}
        onLongPress={isSelectionMode ? undefined : onLongPress}
        style={{ marginHorizontal: CARD_SPACING / 2 }}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
          },
          isSelectionMode &&
            isSelected && {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
        ]}
        mode="elevated">
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <Checkbox status={isSelected ? "checked" : "unchecked"} onPress={onPress} />
          </View>
        )}
        <Card.Content>
          <Text variant="titleMedium" numberOfLines={2}>
            {note.title || "Untitled"}
          </Text>
          {note.content && (
            <Text variant="bodyMedium" numberOfLines={4} style={styles.content}>
              {note.content}
            </Text>
          )}
          <View style={styles.footer}>
            {isLocationLoading ? (
              <Text variant="bodySmall" style={styles.distance}>
                📍 ...
              </Text>
            ) : (
              <Text variant="bodySmall" style={styles.distance}>
                📍 {formatKillometers(note.distance_km)}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: CARD_SPACING,
    width: "100%",
    paddingTop: 8,
  },
  content: {
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    gap: 4,
  },
  distance: {
    opacity: 0.7,
  },
  checkboxContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
});
