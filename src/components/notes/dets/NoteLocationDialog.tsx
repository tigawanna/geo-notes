import { useDeviceLocation } from "@/hooks/use-device-location";
import { TNote } from "@/lib/drizzle/schema";
import { UseFormReturn, useFormState } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Dialog, IconButton, Text, TextInput, Button } from "react-native-paper";
import { TNoteForm } from "./NoteDetails";
import { useState } from "react";

interface NoteLocationDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  note: TNote & { latitude?: string; longitude?: string };
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
}

export function NoteLocationDialog({ open, setOpen, form, note }: NoteLocationDialogProps) {
  const {
    location: freshLocation,
    isLoading: locationPending,
    refetch: refetchLocation,
  } = useDeviceLocation();
  const currentLat = parseFloat(note?.latitude || "0");
  const currentLng = parseFloat(note?.longitude || "0");
  const [manualCoords, setManualCoords] = useState(`${currentLat}, ${currentLng}`);
  const { isDirty } = useFormState({ control: form.control });
 const hasChanges = isDirty;


  return (
    <Dialog visible={open} onDismiss={() => setOpen(false)}>
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
              ? `${freshLocation.coords.latitude.toFixed(6)}, ${freshLocation.coords.longitude}`
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
        <Button onPress={() => setOpen(false)}>Cancel</Button>
        <Button onPress={handleSave} disabled={!hasValidCoordinates || !hasChanges}>
          Save Location
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
