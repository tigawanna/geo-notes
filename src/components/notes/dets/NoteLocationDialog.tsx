import { useDeviceLocation } from "@/hooks/use-device-location";
import { TNote } from "@/lib/drizzle/schema";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { View } from "react-native";
import { Button, Dialog, IconButton, Text, TextInput } from "react-native-paper";
import { TNoteForm } from "./NoteDetails";

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
  const hasChanges = manualCoords !== `${currentLat}, ${currentLng}`;

  const hasValidCoordinates = (() => {
    const coords = manualCoords.split(',').map(s => parseFloat(s.trim()));
    if (coords.length !== 2 || coords.some(isNaN)) return false;
    const [lat, lng] = coords;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  })();

  const handleUseCurrentLocation = () => {
    if (freshLocation && typeof freshLocation === 'object' && 'coords' in freshLocation) {
      const lat = freshLocation.coords.latitude.toFixed(6);
      const lng = freshLocation.coords.longitude.toFixed(6);
      setManualCoords(`${lat}, ${lng}`);
    }
  };

  const handleSave = () => {
    if (hasValidCoordinates) {
      const coords = manualCoords.split(',').map(s => parseFloat(s.trim()));
      const [lat, lng] = coords;
      form.setValue('location.lat', lat.toString());
      form.setValue('location.lng', lng.toString());
      setOpen(false);
    }
  };

  return (
    <Dialog visible={open} onDismiss={() => setOpen(false)}>
      <Dialog.Title>Edit Location</Dialog.Title>
      <Dialog.Content>
        {/* Current Location Display */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text variant="labelMedium" style={{ fontWeight: "600", marginRight: 8 }}>
              Current Location
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
              ? `${freshLocation.coords.latitude.toFixed(6)}, ${freshLocation.coords.longitude.toFixed(6)}`
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
