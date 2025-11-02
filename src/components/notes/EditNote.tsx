import { getNoteQueryOptions, updateNoteMutationOptions } from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Button,
    IconButton,
    Surface,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";

// Utility to extract phone numbers from text
const extractPhoneNumber = (text: string): string | null => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
};

// Utility to create GeoJSON point for SpatiaLite
const createGeoJSONPoint = (latitude: number, longitude: number): string => {
  return JSON.stringify({
    type: "Point",
    coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] order
  });
};

export function EditNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { locationEnabled, quickCopyMode } = useSettingsStore();
  const { location, requestLocationAgain, isLoading: isLocationLoading } = useDeviceLocation();

  const { data, isPending, error: queryError } = useQuery(getNoteQueryOptions(id || ""));
  const note = data?.result;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [quickCopy, setQuickCopy] = useState("");
  const [hasLocation, setHasLocation] = useState(false);

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setQuickCopy(note.quickCopy || "");
      setHasLocation(!!note.location);
    }
  }, [note]);

  // Auto-generate quick copy based on mode
  useEffect(() => {
    if (quickCopyMode === "title" && title && !quickCopy) {
      setQuickCopy(title);
    } else if (quickCopyMode === "phone" && content) {
      const phone = extractPhoneNumber(content);
      if (phone && !quickCopy) {
        setQuickCopy(phone);
      }
    }
  }, [title, content, quickCopyMode, quickCopy]);

  const updateMutation = useMutation({
    ...updateNoteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!id) return;

    const updates: Partial<TNote> = {
      title: title || "Untitled",
      content,
      quickCopy,
    };

    // Add location if enabled and available
    if (locationEnabled && location && typeof location === "object" && "coords" in location) {
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        updates.location = createGeoJSONPoint(coords.latitude, coords.longitude) as any;
      }
    }

    updateMutation.mutate({ id, updates });
  };

  const handleAddLocation = () => {
    if (location && typeof location === "object" && "coords" in location) {
      setHasLocation(true);
    } else {
      requestLocationAgain();
    }
  };

  if (isPending) {
    return (
      <Surface style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading note...
          </Text>
        </View>
      </Surface>
    );
  }

  if (queryError || !note) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={styles.errorText}>
            Failed to load note
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Note" />
        <Appbar.Action
          icon="check"
          onPress={handleSave}
          disabled={updateMutation.isPending}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <TextInput
            mode="flat"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholderTextColor={theme.colors.onSurfaceDisabled}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />

          <TextInput
            mode="flat"
            placeholder="Note content..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={20}
            style={styles.contentInput}
            placeholderTextColor={theme.colors.onSurfaceDisabled}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />

          <View style={styles.quickCopyContainer}>
            <Text variant="labelLarge" style={styles.quickCopyLabel}>
              Quick Copy
            </Text>
            <TextInput
              mode="outlined"
              placeholder={
                quickCopyMode === "title"
                  ? "Auto: Uses title"
                  : quickCopyMode === "phone"
                    ? "Auto: Detects phone numbers"
                    : "Manual input"
              }
              value={quickCopy}
              onChangeText={setQuickCopy}
              style={styles.quickCopyInput}
              right={
                quickCopy ? (
                  <TextInput.Icon icon="close" onPress={() => setQuickCopy("")} />
                ) : null
              }
            />
          </View>

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
              hasLocation || (location && typeof location === "object" && "coords" in location) ? (
                <View style={styles.locationInfo}>
                  <Text variant="bodyMedium">
                    📍 Location saved
                    {location && typeof location === "object" && "coords" in location
                      ? ` (${(location as any).coords.latitude.toFixed(4)}, ${(location as any).coords.longitude.toFixed(4)})`
                      : ""}
                  </Text>
                  <IconButton
                    icon="refresh"
                    onPress={handleAddLocation}
                    disabled={isLocationLoading}
                  />
                </View>
              ) : (
                <Button
                  mode="outlined"
                  icon="map-marker-plus"
                  onPress={handleAddLocation}
                  loading={isLocationLoading}
                  disabled={isLocationLoading}>
                  Add Current Location
                </Button>
              )
            ) : (
              <Text variant="bodySmall" style={styles.disabledText}>
                Enable location tracking in settings to add location to notes
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {updateMutation.isPending && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge">Saving...</Text>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    color: "red",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  contentInput: {
    fontSize: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    minHeight: 200,
    textAlignVertical: "top",
  },
  quickCopyContainer: {
    marginTop: 24,
    gap: 8,
  },
  quickCopyLabel: {
    marginBottom: 4,
  },
  quickCopyInput: {
    backgroundColor: "transparent",
  },
  locationContainer: {
    marginTop: 24,
    gap: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
});
