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
  const [manualCoords, setManualCoords] = React.useState(
    savedLocation ? `${savedLocation.lat.toString()},${savedLocation.lng.toString()}` : ""
  );

  // Update manual inputs when saved location changes or when fresh location loads
  React.useEffect(() => {
    if (savedLocation) {
      setManualCoords(`${savedLocation.lat.toString()},${savedLocation.lng.toString()}`);
    } else if (freshLocation && typeof freshLocation === "object" && "coords" in freshLocation) {
      // If no saved location, prefill with current location when it loads
      setManualCoords(`${freshLocation.coords.latitude.toString()},${freshLocation.coords.longitude.toString()}`);
    }
  }, [savedLocation, freshLocation]);

  const handleUseCurrentLocation = () => {
    if (freshLocation && typeof freshLocation === "object" && "coords" in freshLocation) {
      const coords = freshLocation.coords;
      setManualCoords(`${coords.latitude.toString()},${coords.longitude.toString()}`);
    }
  };

  const handleSave = () => {
    const coords = manualCoords.split(',').map(s => s.trim());
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onSaveLocation({ lat, lng });
        setLocationDialogVisible(false);
      }
    }
  };

  const hasValidCoordinates = (() => {
    const coords = manualCoords.split(',').map(s => s.trim());
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
    return false;
  })();

  const hasChanges = (() => {
    if (savedLocation) {
      const coords = manualCoords.split(',').map(s => s.trim());
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        return lat !== savedLocation.lat || lng !== savedLocation.lng;
      }
      return false;
    }
    return manualCoords.trim() !== "";
  })();
  const locationPending = isLocationRefreshing;
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
                  )}, ${freshLocation.coords.longitude}`
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
            <TextInput
              label="Latitude, Longitude"
              value={manualCoords}
              onChangeText={setManualCoords}
              keyboardType="numeric"
              mode="outlined"
              dense
              placeholder="e.g. 37.7749, -122.4194"
            />
          </View>
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
