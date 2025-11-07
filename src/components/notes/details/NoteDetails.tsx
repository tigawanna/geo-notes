import { getNoteQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { NoteDetailsDialogs } from "./NoteDetailsDialogs";
import { NoteDetailsForm } from "./NoteDetailsForm";
import { NoteDetailsHeader } from "./NoteDetailsHeader";
import { NoteLocationSection } from "./NoteLocationSection";
import { NoteTagsSection } from "./NoteTagsSection";
import { useNoteActions } from "./use-note-actions";
import { useNoteDetailsForm } from "./use-note-details-form";
import { useNoteLocation } from "./use-note-location";
import { useUnsavedChanges } from "./use-unsaved-changes";
import { LoadingFallback } from "@/components/state-screens/LoadingFallback";

export function NoteDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [locationDialogVisible, setLocationDialogVisible] = useState(false);

  const { location } = useNoteLocation(id);

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
    noteQuickCopyMode,
    setNoteQuickCopyMode,
    savedLocation,
    setSavedLocation,
    tags,
    setTags,
  } = useNoteDetailsForm({ note });

  const {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    unsavedDialogVisible,
    handleBack,
    discardChanges,
    cancelNavigation,
  } = useUnsavedChanges({ note, title, content, quickCopy, tags });

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
    saveNote(title, content, quickCopy, savedLocation, noteQuickCopyMode, tags);
  };

  const handleQuickCopyModeChange = (mode: "title" | "phone" | "manual" | null) => {
    setNoteQuickCopyMode(mode);
    setHasUnsavedChanges(true);
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
    return <LoadingFallback />;
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
      {/* {isPending && (
        <View style={{ paddingTop: 20, width: "100%", alignItems: "center" }}>
          <LoadingIndicatorDots />
        </View>
      )} */}
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
          {/* Main Content - Flush with screen */}
          <View style={styles.mainContent}>
            <NoteDetailsForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              quickCopy={quickCopy}
              setQuickCopy={setQuickCopy}
              updatedAt={note?.updated}
              noteQuickCopyMode={noteQuickCopyMode}
              onQuickCopyModeChange={handleQuickCopyModeChange}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Location Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <NoteLocationSection
                savedLocation={savedLocation}
                currentLocation={location}
                onEditLocation={() => setLocationDialogVisible(true)}
              />
            </Card.Content>
          </Card>

          {/* Tags Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <NoteTagsSection
                noteTags={tags}
                onTagsChange={(newTags) => {
                  setTags(newTags);
                  setHasUnsavedChanges(true);
                }}
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
        savedLocation={savedLocation}
        currentLocation={location}
        locationDialogVisible={locationDialogVisible}
        setLocationDialogVisible={setLocationDialogVisible}
        onSaveLocation={(location) => {
          setSavedLocation(location);
          setHasUnsavedChanges(true);
        }}
        noteId={id}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: "OK",
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
    paddingBottom: 32,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
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
