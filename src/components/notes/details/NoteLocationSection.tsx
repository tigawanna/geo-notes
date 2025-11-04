import { useSettingsStore } from "@/store/settings-store";
import { calculateDistance, formatDistance } from "@/utils/note-utils";
import { LocationObject } from "expo-location";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

interface NoteLocationSectionProps {
  savedLocation: { lat: string; lng: string } | null;
  currentLocation: LocationObject | undefined;
  isLocationLoading: boolean;
  onAddLocation: () => void;
  updatedAt?: string | null;
}

export function NoteLocationSection({
  savedLocation,
  currentLocation,
  isLocationLoading,
  onAddLocation,
  updatedAt,
}: NoteLocationSectionProps) {
  const { locationEnabled } = useSettingsStore();
  const theme = useTheme();

  return (
    <View style={styles.locationContainer}>
      <View style={styles.locationHeader}>
        <Text variant="labelLarge">Location</Text>
        {!locationEnabled && (
          <Text variant="bodySmall" style={styles.disabledText}>
            (Disabled in settings)
          </Text>
        )}
      </View>

      {savedLocation && (
        <View style={styles.locationDetails}>
          <View style={styles.locationRow}>
            <Text variant="labelMedium" style={styles.locationLabel}>
              Saved Location:
            </Text>
            <Text variant="bodyMedium">
              📍 {savedLocation.lat}, {savedLocation.lng}
            </Text>
          </View>

          {currentLocation &&
            typeof currentLocation === "object" &&
            "coords" in currentLocation && (
              <View style={styles.locationRow}>
                <Text variant="labelMedium" style={styles.locationLabel}>
                  Current Location:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.currentLocationText, { color: theme.colors.secondary }]}>
                  📍 {currentLocation.coords.latitude.toFixed(6)},{" "}
                  {currentLocation.coords.longitude.toFixed(6)}
                </Text>
              </View>
            )}
        </View>
      )}
      {locationEnabled ? (
        <Button
          mode="outlined"
          icon="map-marker-plus"
          onPress={onAddLocation}
          loading={isLocationLoading}
          disabled={isLocationLoading}>
          Add Current Location
        </Button>
      ) : (
        <Text variant="bodySmall" style={styles.disabledText}>
          Enable location tracking in settings to add location to notes
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationContainer: {
    marginTop: 24,
    gap: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationDetails: {
    gap: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  locationLabel: {
    fontWeight: "600",
    minWidth: 120,
  },
  currentLocationText: {
    flex: 1,
  },
  disabledText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
});
