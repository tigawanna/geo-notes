import { useSettingsStore } from "@/store/settings-store";
import { calculateDistance, formatDistance } from "@/utils/note-utils";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface NoteLocationSectionProps {
  savedLocation: { lat: number; lng: number } | null;
  currentLocation: any;
  isLocationLoading: boolean;
  onAddLocation: () => void;
}

export function NoteLocationSection({
  savedLocation,
  currentLocation,
  isLocationLoading,
  onAddLocation,
}: NoteLocationSectionProps) {
  const { locationEnabled } = useSettingsStore();

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

      {locationEnabled ? (
        <>
          {savedLocation && (
            <View style={styles.locationDetails}>
              <View style={styles.locationRow}>
                <Text variant="labelMedium" style={styles.locationLabel}>
                  Saved Location:
                </Text>
                <Text variant="bodyMedium">
                  📍 {savedLocation.lat.toFixed(6)}, {savedLocation.lng.toFixed(6)}
                </Text>
              </View>

              {currentLocation && typeof currentLocation === "object" && "coords" in currentLocation && (
                <View style={styles.locationRow}>
                  <Text variant="labelMedium" style={styles.locationLabel}>
                    Current Location:
                  </Text>
                  <Text variant="bodyMedium" style={styles.currentLocationText}>
                    📍 {(currentLocation as any).coords.latitude.toFixed(6)},{" "}
                    {(currentLocation as any).coords.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              {currentLocation &&
                typeof currentLocation === "object" &&
                "coords" in currentLocation &&
                savedLocation && (
                  <View style={styles.locationRow}>
                    <Text variant="labelMedium" style={styles.locationLabel}>
                      Distance:
                    </Text>
                    <Text variant="bodyMedium" style={styles.distanceText}>
                      {formatDistance(
                        calculateDistance(
                          savedLocation.lat,
                          savedLocation.lng,
                          (currentLocation as any).coords.latitude,
                          (currentLocation as any).coords.longitude
                        )
                      )}{" "}
                      away
                    </Text>
                  </View>
                )}

              <Button
                mode="outlined"
                icon="map-marker-refresh"
                onPress={onAddLocation}
                loading={isLocationLoading}
                disabled={isLocationLoading}
                style={styles.updateLocationButton}>
                Update to Current Location
              </Button>
            </View>
          )}

          {!savedLocation && (
            <Button
              mode="outlined"
              icon="map-marker-plus"
              onPress={onAddLocation}
              loading={isLocationLoading}
              disabled={isLocationLoading}>
              Add Current Location
            </Button>
          )}
        </>
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
    color: "#2196F3",
    flex: 1,
  },
  distanceText: {
    color: "#FF9800",
    fontWeight: "500",
  },
  updateLocationButton: {
    marginTop: 8,
  },
  disabledText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
});
