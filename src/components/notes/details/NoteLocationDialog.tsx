import { useDeviceLocation } from "@/hooks/use-device-location";
import { TNote } from "@/lib/drizzle/schema";
import { UseFormReturn, useController } from "react-hook-form";
import { View } from "react-native";
import { Button, Dialog, IconButton, Portal, Text, TextInput } from "react-native-paper";
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
  const { field } = useController({
    control: form.control,
    name: "location",
    defaultValue: {
      lat: currentLat.toString(),
      lng: currentLng.toString(),
    },
  });

  const manualCoords = `${field.value?.lat || currentLat}, ${field.value?.lng || currentLng}`;
  const hasChanges = form.formState.isDirty;

  const handleUseCurrentLocation = () => {
    if (freshLocation && typeof freshLocation === "object" && "coords" in freshLocation) {
      const lat = freshLocation.coords.latitude.toFixed(6);
      const lng = freshLocation.coords.longitude.toFixed(6);

      field.onChange({ lat, lng });
    }
  };

  const handleCoordsChange = (text: string) => {
    const coords = text.split(",").map((s) => parseFloat(s.trim()));
    if (coords.length === 2 && !coords.some(isNaN)) {
      const [lat, lng] = coords;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        field.onChange({ lat: lat.toString(), lng: lng.toString() });
      }
    }
  };

  const handleSave = () => {
    setOpen(false);
  };

  return (
    <Portal>
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
            <TextInput
              label="Latitude, Longitude"
              value={manualCoords}
              onChangeText={handleCoordsChange}
              keyboardType="numeric"
              mode="outlined"
              dense
              placeholder="e.g. 37.7749, -122.4194"
            />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpen(false)}>Cancel</Button>
          <Button onPress={handleSave} disabled={!hasChanges}>
            Save Location
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
