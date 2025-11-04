import { deleteNoteMutationOptions, getNoteQueryOptions, updateNoteMutationOptions } from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Menu,
  Portal,
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

// Calculate distance between two points in meters using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Format distance for display
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

export function EditNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { locationEnabled, quickCopyMode } = useSettingsStore();
  const { location, requestLocationAgain, isLoading: isLocationLoading } = useDeviceLocation();
  const navigation = useNavigation();

  const { data, isPending, error: queryError } = useQuery(getNoteQueryOptions(id || ""));
  const note = data?.result;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [quickCopy, setQuickCopy] = useState("");
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);
  const [locationUpdateDialogVisible, setLocationUpdateDialogVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [navigationAction, setNavigationAction] = useState<any>(null);

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setQuickCopy(note.quickCopy || "");
      
      // Parse saved location from GeoJSON if it exists
      if (note.location) {
        try {
          const geoJson = typeof note.location === 'string' ? JSON.parse(note.location) : note.location;
          if (geoJson.type === "Point" && Array.isArray(geoJson.coordinates)) {
            setSavedLocation({
              lng: geoJson.coordinates[0],
              lat: geoJson.coordinates[1],
            });
          }
        } catch (error) {
          console.error("Error parsing saved location:", error);
        }
      }
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
      setHasUnsavedChanges(false);
      router.back();
    },
  });

  const deleteMutation = useMutation({
    ...deleteNoteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    },
  });

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== (note.title || "");
      const contentChanged = content !== (note.content || "");
      const quickCopyChanged = quickCopy !== (note.quickCopy || "");
      setHasUnsavedChanges(titleChanged || contentChanged || quickCopyChanged);
    }
  }, [title, content, quickCopy, note]);

  // Prevent navigation when there are unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If no unsaved changes, allow navigation
      if (!hasUnsavedChanges) {
        return;
      }

      // Prevent default navigation behavior
      e.preventDefault();

      // Store the navigation action for later
      setNavigationAction(e.data.action);

      // Show the unsaved changes dialog
      setUnsavedDialogVisible(true);
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleSave = () => {
    if (!id) return;

    const updates: Partial<TNote> = {
      title: title || "Untitled",
      content,
      quickCopy,
    };

    // Add location if we have a saved location (either from note or manually set)
    if (locationEnabled && savedLocation) {
      updates.location = createGeoJSONPoint(savedLocation.lat, savedLocation.lng) as any;
    }

    updateMutation.mutate({ id, updates });
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setUnsavedDialogVisible(true);
    } else {
      router.back();
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    deleteMutation.mutate(Number(id));
  };

  const handleAddLocation = () => {
    if (!location || typeof location !== "object" || !("coords" in location)) {
      // If no current location, request it
      requestLocationAgain();
    } else if (savedLocation) {
      // If note already has a location, show confirmation dialog
      setLocationUpdateDialogVisible(true);
    } else {
      // If note doesn't have a location yet, add current location directly
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        setSavedLocation({
          lng: coords.longitude,
          lat: coords.latitude,
        });
        setHasUnsavedChanges(true);
      }
    }
  };

  const confirmLocationUpdate = () => {
    if (location && typeof location === "object" && "coords" in location) {
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        setSavedLocation({
          lng: coords.longitude,
          lat: coords.latitude,
        });
        setHasUnsavedChanges(true);
      }
    }
    setLocationUpdateDialogVisible(false);
  };

  if (isPending) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading note...
          </Text>
        </View>
      </View>
    );
  }

  if (queryError || !note) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="" />
        <Appbar.Action
          icon="check"
          onPress={handleSave}
          disabled={updateMutation.isPending || !hasUnsavedChanges}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }>
          <Menu.Item
            leadingIcon="delete"
            onPress={handleDelete}
            title="Delete"
          />
        </Menu>
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

                    {location && typeof location === "object" && "coords" in location && (
                      <View style={styles.locationRow}>
                        <Text variant="labelMedium" style={styles.locationLabel}>
                          Current Location:
                        </Text>
                        <Text variant="bodyMedium" style={styles.currentLocationText}>
                          📍 {(location as any).coords.latitude.toFixed(6)},{" "}
                          {(location as any).coords.longitude.toFixed(6)}
                        </Text>
                      </View>
                    )}

                    {location &&
                      typeof location === "object" &&
                      "coords" in location &&
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
                                (location as any).coords.latitude,
                                (location as any).coords.longitude
                              )
                            )}{" "}
                            away
                          </Text>
                        </View>
                      )}

                    <Button
                      mode="outlined"
                      icon="map-marker-refresh"
                      onPress={handleAddLocation}
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
                    onPress={handleAddLocation}
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
        </ScrollView>
      </KeyboardAvoidingView>

      {updateMutation.isPending && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge">Saving...</Text>
        </View>
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Note</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this note? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={confirmDelete}
              loading={deleteMutation.isPending}
              textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={unsavedDialogVisible} onDismiss={() => {
          setUnsavedDialogVisible(false);
          setNavigationAction(null);
        }}>
          <Dialog.Title>Unsaved Changes</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You have unsaved changes. Would you like to save them before leaving?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setUnsavedDialogVisible(false);
                setNavigationAction(null);
              }}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                setUnsavedDialogVisible(false);
                setHasUnsavedChanges(false);
                // Dispatch the stored navigation action if it exists
                if (navigationAction) {
                  navigation.dispatch(navigationAction);
                  setNavigationAction(null);
                } else {
                  router.back();
                }
              }}>
              Discard
            </Button>
            <Button
              onPress={() => {
                setUnsavedDialogVisible(false);
                handleSave();
              }}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={locationUpdateDialogVisible}
          onDismiss={() => setLocationUpdateDialogVisible(false)}>
          <Dialog.Title>Update Location</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Update the note&apos;s location to your current position?
            </Text>
            {savedLocation && location && typeof location === "object" && "coords" in location && (
              <>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Current saved: {savedLocation.lat.toFixed(6)}, {savedLocation.lng.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  New location: {(location as any).coords.latitude.toFixed(6)},{" "}
                  {(location as any).coords.longitude.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ color: "#FF9800", fontWeight: "500" }}>
                  Distance:{" "}
                  {formatDistance(
                    calculateDistance(
                      savedLocation.lat,
                      savedLocation.lng,
                      (location as any).coords.latitude,
                      (location as any).coords.longitude
                    )
                  )}
                </Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLocationUpdateDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmLocationUpdate}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
