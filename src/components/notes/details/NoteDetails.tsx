import { getNoteQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Card, Divider, Snackbar, Text, useTheme } from "react-native-paper";
import { NoteDetailsDialogs } from "./NoteDetailsDialogs";
import { NoteDetailsForm } from "./NoteDetailsForm";
import { NoteDetailsHeader } from "./NoteDetailsHeader";
import { NoteLocationSection } from "./NoteLocationSection";
import { useNoteActions } from "./use-note-actions";
import { useNoteDetailsForm } from "./use-note-details-form";
import { useNoteLocation } from "./use-note-location";
import { useUnsavedChanges } from "./use-unsaved-changes";

export function NoteDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    location,
    isLocationLoading,
    locationUpdateDialogVisible,
    setLocationUpdateDialogVisible,
    handleAddLocation: addLocation,
    confirmLocationUpdate: updateLocation,
  } = useNoteLocation(id);

  const {
    data,
    isPending,
    error: queryError,
  } = useQuery(
    getNoteQueryOptions(id || "", {
      lat: location?.coords.latitude || 0,
      lng: location?.coords.longitude || 0,
    })
  );
  const note = data?.result;

  // Custom hooks for managing different aspects of the component
  const {
    title,
    setTitle,
    content,
    setContent,
    quickCopy,
    setQuickCopy,
    savedLocation,
    setSavedLocation,
  } = useNoteDetailsForm({ note });

  const {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    unsavedDialogVisible,
    handleBack,
    discardChanges,
    cancelNavigation,
  } = useUnsavedChanges({ note, title, content, quickCopy });

  const {
    menuVisible,
    setMenuVisible,
    deleteDialogVisible,
    setDeleteDialogVisible,
    updateMutation,
    deleteMutation,
    handleSave: saveNote,
    handleDelete,
    confirmDelete,
  } = useNoteActions({ id, setHasUnsavedChanges });

  // Wrapper functions to pass the right parameters
  const handleSave = () => {
    saveNote(title, content, quickCopy, savedLocation);
  };

  const handleAddLocation = () => {
    addLocation(savedLocation, setSavedLocation, setHasUnsavedChanges);
  };

  const confirmLocationUpdate = () => {
    updateLocation(setSavedLocation, setHasUnsavedChanges);
  };

  const handleSaveFromDialog = () => {
    handleSave();
  };

  const handleQuickCopy = async () => {
    if (quickCopy.trim()) {
      await Clipboard.setStringAsync(quickCopy);
      setSnackbarVisible(true);
    }
  };

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={[styles.errorText, { color: theme.colors.error }]}>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <NoteDetailsHeader
        onBack={handleBack}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        hasUnsavedChanges={hasUnsavedChanges}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        onDelete={handleDelete}
        onQuickCopy={handleQuickCopy}
        hasQuickCopy={!!quickCopy.trim()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Updated Date Card */}
          {note.updated && (
            <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
              <Card.Content>
                <View style={styles.metadataRow}>
                  <Text
                    variant="labelMedium"
                    style={[styles.metadataLabel, { color: theme.colors.onSurfaceVariant }]}>
                    📅 Last Updated
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(note.updated).toLocaleString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Main Content Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <NoteDetailsForm
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                quickCopy={quickCopy}
                setQuickCopy={setQuickCopy}
              />
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* Location Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <NoteLocationSection
                savedLocation={{
                  lat: note.latitude,
                  lng: note.longitude,
                }}
                currentLocation={location}
                isLocationLoading={isLocationLoading}
                onAddLocation={handleAddLocation}
                updatedAt={note?.updated}
              />
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {updateMutation.isPending && (
        <View style={[styles.savingOverlay, { backgroundColor: theme.colors.backdrop }]}>
          <Card style={styles.savingCard} elevation={4}>
            <Card.Content style={styles.savingContent}>
              <ActivityIndicator size="large" />
              <Text variant="bodyLarge">Saving...</Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <NoteDetailsDialogs
        deleteDialogVisible={deleteDialogVisible}
        setDeleteDialogVisible={setDeleteDialogVisible}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        unsavedDialogVisible={unsavedDialogVisible}
        onCancelNavigation={cancelNavigation}
        onDiscardChanges={discardChanges}
        onSave={handleSaveFromDialog}
        locationUpdateDialogVisible={locationUpdateDialogVisible}
        setLocationUpdateDialogVisible={setLocationUpdateDialogVisible}
        onConfirmLocationUpdate={confirmLocationUpdate}
        savedLocation={savedLocation}
        currentLocation={location}
      />
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        Copied to clipboard!
      </Snackbar>
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
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  metadataLabel: {
    fontWeight: "600",
    fontSize: 13,
  },
  divider: {
    marginVertical: 8,
    height: 1,
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
    fontWeight: "600",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  savingCard: {
    borderRadius: 16,
    minWidth: 200,
  },
  savingContent: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
});
