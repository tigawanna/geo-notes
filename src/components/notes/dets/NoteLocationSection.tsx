import { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { logger } from "@/utils/logger";
import { LocationObject } from "expo-location";
import { UseFormReturn } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { TNoteForm } from "./NoteDetails";
import { useState } from "react";

interface NoteLocationSectionProps {
  note: TNote & { latitude?: string; longitude?: string };
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
}

export function NoteLocationSection({ form, note }: NoteLocationSectionProps) {
  const { locationEnabled } = useSettingsStore();
  const theme = useTheme();
  const [open, setOpen] = useState();
  const savedLat = parseFloat(note?.latitude || "0");
  const savedLng = parseFloat(note?.longitude || "0");
  const savedLocation =
    !isNaN(savedLat) && !isNaN(savedLng)
      ? {
          lat: savedLat,
          lng: savedLng,
        }
      : null;

  const onEditLocation = () => {
    logger.info("Edit location pressed");
    // Implement location editing logic here
  };
  // Format location with proper decimal places
  const formatLocation = (loc: { lat: number; lng: number }) => {
    return `${loc?.lat}, ${loc?.lng}`;
  };

  return (
    <View style={styles.locationContainer}>
      <View style={styles.locationHeader}>
        <Text variant="titleSmall" style={styles.headerTitle}>
          📍 Location
        </Text>
        {!locationEnabled && (
          <View style={[styles.disabledBadge, { backgroundColor: theme.colors.errorContainer }]}>
            <Text
              variant="labelSmall"
              style={[styles.disabledText, { color: theme.colors.onErrorContainer }]}>
              Disabled
            </Text>
          </View>
        )}
      </View>

      <View style={styles.locationRow}>
        <Text variant="bodyMedium" style={styles.locationValue}>
          {savedLocation ? formatLocation(savedLocation) : "No location saved"}
        </Text>
        <IconButton icon="pencil" size={20} onPress={onEditLocation} style={styles.editIcon} />
      </View>

      {!locationEnabled && (
        <View style={[styles.disabledMessage, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text
            variant="bodySmall"
            style={[styles.disabledMessageText, { color: theme.colors.onSurfaceVariant }]}>
            💡 Enable location tracking in settings to view current location
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationContainer: {
    gap: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: "600",
  },
  disabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  disabledText: {
    fontSize: 11,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationValue: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 14,
  },
  editIcon: {
    margin: 0,
  },
  disabledMessage: {
    padding: 16,
    borderRadius: 12,
  },
  disabledMessageText: {
    lineHeight: 20,
  },
});
