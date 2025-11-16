import { formatKillometers } from "@/utils/note-utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";
import Animated, {
    SharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from "react-native-reanimated";
import type { NoteWithDistance } from "./NoteCard";

interface ClosestNoteFloatingCardProps {
  closestNote: NoteWithDistance | null;
  isVisible: SharedValue<boolean>;
  onCopy: (text: string) => void;
  onAddNew: () => void;
  isCreating?: boolean;
  handedness?: "left" | "right";
}

export function ClosestNoteFloatingCard({
  closestNote,
  isVisible,
  onCopy,
  onAddNew,
  isCreating = false,
  handedness = "right",
}: ClosestNoteFloatingCardProps) {
  const theme = useTheme();

  // Derive animated values from the shared value
  const animatedStyle = useAnimatedStyle(() => {
    const visible = isVisible.value && !!closestNote;

    return {
      transform: [
        {
          translateY: visible
            ? withSpring(0, { damping: 15, stiffness: 150 })
            : withTiming(200, { duration: 200 }),
        },
      ],
      opacity: visible ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
    };
  });

  if (!closestNote) {
    return null;
  }

  const handlePress = () => {
    router.push(`/note/details?id=${closestNote.id}`);
  };

  const handleCopy = () => {
    const textToCopy = closestNote.quickCopy || closestNote.title || closestNote.content;
    if (textToCopy) {
      Clipboard.setStringAsync(textToCopy);
      onCopy(textToCopy);
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.elevation.level3,
          },
        ]}>
        {handedness === "right" ? (
          <>
            <FAB
              icon="plus"
              size="small"
              onPress={onAddNew}
              loading={isCreating}
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
            />
            <Pressable onPress={handlePress} style={styles.cardContent}>
              <View style={styles.infoSection}>
                <Pressable onPress={handlePress} style={styles.titleRow}>
                  <Text variant="titleLarge" numberOfLines={1} style={styles.title}>
                    {closestNote.title || "Untitled"}
                  </Text>
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={16}
                    color={theme.colors.onSurface}
                    style={styles.linkIcon}
                  />
                </Pressable>
                <View style={styles.detailsRow}>
                  <Text variant="bodySmall" style={styles.label}>
                    📍 Closest
                  </Text>
                  <Text variant="bodySmall" style={styles.distance}>
                    {formatKillometers(closestNote.distance_km)}
                  </Text>
                </View>
              </View>
            </Pressable>
            <FAB
              icon="content-copy"
              size="small"
              onPress={handleCopy}
              style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
            />
          </>
        ) : (
          <>
            <FAB
              icon="content-copy"
              size="small"
              onPress={handleCopy}
              style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
            />
            <Pressable onPress={handlePress} style={styles.cardContent}>
              <View style={styles.infoSection}>
                <Pressable onPress={handlePress} style={styles.titleRow}>
                  <Text variant="titleLarge" numberOfLines={1} style={styles.title}>
                    {closestNote.title || "Untitled"}
                  </Text>
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={16}
                    color={theme.colors.onSurface}
                    style={styles.linkIcon}
                  />
                </Pressable>
                <View style={styles.detailsRow}>
                  <Text variant="bodySmall" style={styles.label}>
                    📍 Closest
                  </Text>
                  <Text variant="bodySmall" style={styles.distance}>
                    {formatKillometers(closestNote.distance_km)}
                  </Text>
                </View>
              </View>
            </Pressable>
            <FAB
              icon="plus"
              size="small"
              onPress={onAddNew}
              loading={isCreating}
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
            />
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  infoSection: {
    gap: 4,
    alignItems: "flex-end",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  title: {
    fontWeight: "600",
    maxWidth: "50%",
    textAlign: "right",
  },
  linkIcon: {
    margin: 0,
    padding: 0,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  label: {
    opacity: 0.7,
    fontSize: 11,
  },
  distance: {
    opacity: 0.7,
    fontWeight: "500",
    fontSize: 11,
  },
  actionButton: {
    margin: 0,
  },
});
