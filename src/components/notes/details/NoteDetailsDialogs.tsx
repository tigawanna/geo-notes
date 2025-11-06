import { useDeviceLocation } from "@/hooks/use-device-location";
import { logger } from "@/utils/logger";
import React from "react";
import { View } from "react-native";
import { Button, Dialog, IconButton, Portal, Text, TextInput, useTheme } from "react-native-paper";

interface NoteDetailsDialogsProps {
  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (visible: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  unsavedDialogVisible: boolean;
  onCancelNavigation: () => void;
  onDiscardChanges: () => void;
  onSave: () => void;
  savedLocation: { lat: number; lng: number } | null;
  currentLocation: any;
  locationDialogVisible: boolean;
  setLocationDialogVisible: (visible: boolean) => void;
  onSaveLocation: (location: { lat: number; lng: number }) => void;
  noteId?: string;
}

export function NoteDetailsDialogs({
  deleteDialogVisible,
  setDeleteDialogVisible,
  onConfirmDelete,
  isDeleting,
  unsavedDialogVisible,
  onCancelNavigation,
  onDiscardChanges,
  onSave,
  savedLocation,
  currentLocation,
  locationDialogVisible,
  setLocationDialogVisible,
  onSaveLocation,
  noteId,
}: NoteDetailsDialogsProps) {
  logger.log("saved location:", savedLocation);
  const theme = useTheme();
  const {
    location: freshLocation,
    isLoading: isLocationRefreshing,
    isRefreshing: isLocationRefreshingAgain,
    refetch: refetchLocation,
  } = useDeviceLocation();
  const [manualLat, setManualLat] = React.useState(savedLocation?.lat.toString() || "");
  const [manualLng, setManualLng] = React.useState(savedLocation?.lng.toString() || "");

  // Update manual inputs when saved location changes
  React.useEffect(() => {
    if (savedLocation) {
      setManualLat(savedLocation.lat.toString());
      setManualLng(savedLocation.lng.toString());
    }
  }, [savedLocation]);

  const handleUseCurrentLocation = () => {
    if (freshLocation && typeof freshLocation === "object" && "coords" in freshLocation) {
      const coords = freshLocation.coords;
      setManualLat(coords.latitude.toString());
      setManualLng(coords.longitude.toString());
    }
  };

  const handleSave = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onSaveLocation({ lat, lng });
      setLocationDialogVisible(false);
    }
  };

  const hasValidCoordinates = (() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  })();

  const hasChanges = savedLocation
    ? parseFloat(manualLat) !== savedLocation.lat || parseFloat(manualLng) !== savedLocation.lng
    : manualLat.trim() !== "" || manualLng.trim() !== "";
  const locationPending = isLocationRefreshing || isLocationRefreshingAgain;
  return (
    <Portal>
      {/* Delete Confirmation Dialog */}
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Note</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to delete this note? This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
          <Button onPress={onConfirmDelete} loading={isDeleting} textColor={theme.colors.error}>
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Unsaved Changes Dialog */}
      <Dialog visible={unsavedDialogVisible} onDismiss={onCancelNavigation}>
        <Dialog.Title>Unsaved Changes</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            You have unsaved changes. Would you like to save them before leaving?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancelNavigation}>Cancel</Button>
          <Button onPress={onDiscardChanges}>Discard</Button>
          <Button onPress={onSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Location Edit Dialog */}
      <Dialog visible={locationDialogVisible} onDismiss={() => setLocationDialogVisible(false)}>
        <Dialog.Title>Edit Location</Dialog.Title>
        <Dialog.Content>
          {/* Current Location Display */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text variant="labelMedium" style={{ fontWeight: "600", marginRight: 8 }}>
                � Current Location
              </Text>
              <IconButton
                icon="refresh"
                size={16}
                onPress={() => refetchLocation()}
                loading={locationPending}
                style={{ margin: 0 }}
              />
            </View>
            <Text variant="bodyMedium" style={{ fontFamily: "monospace", marginBottom: 8 }}>
              {freshLocation && typeof freshLocation === "object" && "coords" in freshLocation
                ? `${freshLocation.coords.latitude.toFixed(
                    6
                  )}, ${freshLocation.coords.longitude.toFixed(6)}`
                : "No location available"}
            </Text>
            <Button
              mode="outlined"
              onPress={handleUseCurrentLocation}
              disabled={!freshLocation || locationPending}
              style={{ marginTop: 8 }}>
              Use Current Location
            </Button>
          </View>

          {/* Manual Location Input */}
          <View style={{ marginBottom: 16 }}>
            <Text variant="labelMedium" style={{ fontWeight: "600", marginBottom: 8 }}>
              Manual Coordinates
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                label="Latitude"
                value={manualLat}
                onChangeText={setManualLat}
                keyboardType="numeric"
                mode="outlined"
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                label="Longitude"
                value={manualLng}
                onChangeText={setManualLng}
                keyboardType="numeric"
                mode="outlined"
                dense
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* Saved Location Display */}
          {savedLocation && (
            <View
              style={{
                padding: 12,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 8,
              }}>
              <Text variant="bodySmall" style={{ fontWeight: "600", marginBottom: 4 }}>
                Currently Saved:
              </Text>
              <Text variant="bodySmall" style={{ fontFamily: "monospace" }}>
                {savedLocation.lat.toFixed(6)}, {savedLocation.lng.toFixed(6)}
              </Text>
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLocationDialogVisible(false)}>Cancel</Button>
          <Button onPress={handleSave} disabled={!hasValidCoordinates || !hasChanges}>
            Save Location
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
