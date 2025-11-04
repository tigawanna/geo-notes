import { useSettingsStore } from "@/store/settings-store";
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
        <Text variant="titleSmall" style={styles.headerTitle}>
          📍 Location
        </Text>
        {!locationEnabled && (
          <View style={[styles.disabledBadge, { backgroundColor: theme.colors.errorContainer }]}>
            <Text variant="labelSmall" style={[styles.disabledText, { color: theme.colors.onErrorContainer }]}>
              Disabled
            </Text>
          </View>
        )}
      </View>

      {savedLocation && (
        <View style={[styles.locationDetails, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
          <View style={styles.locationRow}>
            <Text variant="labelMedium" style={styles.locationLabel}>
              💾 Saved
            </Text>
            <Text variant="bodyMedium" style={styles.locationValue}>
              {savedLocation.lat}, {savedLocation.lng}
            </Text>
          </View>

          {currentLocation &&
            typeof currentLocation === "object" &&
            "coords" in currentLocation && (
              <>
                <View style={[styles.locationDivider, { backgroundColor: theme.colors.outline }]} />
                <View style={styles.locationRow}>
                  <Text variant="labelMedium" style={styles.locationLabel}>
                    📡 Current
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.locationValue, styles.currentLocationText, { color: theme.colors.secondary }]}>
                    {currentLocation.coords.latitude.toFixed(6)},{" "}
                    {currentLocation.coords.longitude.toFixed(6)}
                  </Text>
                </View>
              </>
            )}
        </View>
      )}
      {locationEnabled ? (
        <Button
          mode="contained-tonal"
          icon="map-marker-plus"
          onPress={onAddLocation}
          loading={isLocationLoading}
          disabled={isLocationLoading}
          style={styles.button}>
          {savedLocation ? "Update Location" : "Add Current Location"}
        </Button>
      ) : (
        <View style={[styles.disabledMessage, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={[styles.disabledMessageText, { color: theme.colors.onSurfaceVariant }]}>
            💡 Enable location tracking in settings to add location to notes
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
  locationDetails: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  locationLabel: {
    fontWeight: "600",
    minWidth: 80,
  },
  locationValue: {
    flex: 1,
    fontFamily: "monospace",
  },
  locationDivider: {
    height: 1,
    marginVertical: 4,
  },
  currentLocationText: {
    fontWeight: "500",
  },
  button: {
    marginTop: 4,
  },
  disabledMessage: {
    padding: 16,
    borderRadius: 12,
  },
  disabledMessageText: {
    lineHeight: 20,
  },
});
