import { getNoteQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Text } from "react-native-paper";
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
      <NoteDetailsHeader
        onBack={handleBack}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        hasUnsavedChanges={hasUnsavedChanges}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        onDelete={handleDelete}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {note.updated && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}>
              <Text
                variant="labelMedium"
                style={{
                  fontWeight: "600",
                  minWidth: 120,
                }}>
                Updated At:
              </Text>
              <Text variant="bodyMedium">{new Date(note.updated).toLocaleString()}</Text>
            </View>
          )}
          <NoteDetailsForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            quickCopy={quickCopy}
            setQuickCopy={setQuickCopy}
          />

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
        </ScrollView>
      </KeyboardAvoidingView>

      {updateMutation.isPending && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge">Saving...</Text>
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
