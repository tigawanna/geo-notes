import { calculateDistance, formatDistance } from "@/utils/note-utils";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

interface NoteDetailsDialogsProps {
  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (visible: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  unsavedDialogVisible: boolean;
  onCancelNavigation: () => void;
  onDiscardChanges: () => void;
  onSave: () => void;
  locationUpdateDialogVisible: boolean;
  setLocationUpdateDialogVisible: (visible: boolean) => void;
  onConfirmLocationUpdate: () => void;
  savedLocation: { lat: number; lng: number } | null;
  currentLocation: any;
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
  locationUpdateDialogVisible,
  setLocationUpdateDialogVisible,
  onConfirmLocationUpdate,
  savedLocation,
  currentLocation,
}: NoteDetailsDialogsProps) {
  const theme = useTheme();

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

      {/* Location Update Confirmation Dialog */}
      <Dialog
        visible={locationUpdateDialogVisible}
        onDismiss={() => setLocationUpdateDialogVisible(false)}>
        <Dialog.Title>Update Location</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
            Update the note&apos;s location to your current position?
          </Text>
          {savedLocation &&
            currentLocation &&
            typeof currentLocation === "object" &&
            "coords" in currentLocation && (
              <>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Current saved: {savedLocation.lat.toFixed(6)}, {savedLocation.lng.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  New location: {(currentLocation as any).coords.latitude.toFixed(6)},{" "}
                  {(currentLocation as any).coords.longitude.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ color: "#FF9800", fontWeight: "500" }}>
                  Distance:{" "}
                  {formatDistance(
                    calculateDistance(
                      savedLocation.lat,
                      savedLocation.lng,
                      (currentLocation as any).coords.latitude,
                      (currentLocation as any).coords.longitude
                    )
                  )}
                </Text>
              </>
            )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLocationUpdateDialogVisible(false)}>Cancel</Button>
          <Button onPress={onConfirmLocationUpdate}>Update</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
