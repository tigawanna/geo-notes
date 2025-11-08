import {
  createNotesMutationOptions,
  deleteNotesMutationOptions,
  getNotesQueryOptions,
} from "@/data-access-layer/notes-query-optons";
import { useNoteSearch } from "@/hooks/notes/use-note-search";
import { useNoteSelection } from "@/hooks/notes/use-note-selection";
import { useNoteSort } from "@/hooks/notes/use-note-sort";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { useFilterStore } from "@/store/filter-store";
import { useSettingsStore } from "@/store/settings-store";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";
import { LoadingFallback } from "../../state-screens/LoadingFallback";
import { BulkActionsBar } from "./BulkActionsBar";
import { NoteCard, type NoteWithDistance } from "./NoteCard";
import { NotesScaffold } from "./NotesScaffold";

const CONTAINER_PADDING = 8;

export function Notes() {
  const [showRefreshControl, setShowRefreshControl] = useState(false);
  const { location, isLoading: isLocationLoading } = useDeviceLocation();
  const lat = location?.coords.latitude || 0;
  const lng = location?.coords.longitude || 0;
  const { locationEnabled } = useSettingsStore();
  const { selectedTagId } = useFilterStore();
  const theme = useTheme();
  const qc = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { sortOption, setSortOption } = useNoteSort("distance-asc");
  const {
    isSelectionMode,
    selectedNoteIds,
    toggleSelectionMode,
    toggleNoteSelection,
    selectAll,
    clearSelection,
    exitSelectionMode,
  } = useNoteSelection();

  const {
    data,
    isPending,
    error: queryError,
    refetch,
  } = useQuery(
    getNotesQueryOptions({
      sortOption,
      location: { lat, lng },
      tagId: selectedTagId,
    })
  );

  const { searchQuery, setSearchQuery, filteredNotes } = useNoteSearch(
    (data?.result || []) as NoteWithDistance[]
  );

  const createNoteMutation = useMutation({
    ...createNotesMutationOptions,
    onSuccess: (result) => {
      if (result.result) {
        router.push(`/note/details?id=${result.result}` as any);
      }
    },
    meta: { invalidates: [["notes"]] },
  });

  const deleteNoteMutation = useMutation(deleteNotesMutationOptions);

  const handleSelectAll = () => {
    const allIds = filteredNotes.map((note) => note.id);
    selectAll(allIds);
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedNoteIds);
    await deleteNoteMutation.mutateAsync(selectedIds);
    exitSelectionMode();
    showSnackbar(`Deleted \${selectedIds.length} notes`);
  };

  const handleBulkExport = async () => {
    try {
      const selectedNotes = filteredNotes.filter((note) => selectedNoteIds.has(note.id));
      const notesToExport = selectedNotes.map((note) => ({
        ...note,
        location:
          note.latitude && note.longitude
            ? `{"type":"Point","coordinates":[${note.longitude},${note.latitude}]}`
            : null,
      }));

      const jsonData = JSON.stringify(notesToExport, null, 2);
      const fileName = `notes_export_${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonData);

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(fileUri);
      }

      exitSelectionMode();
      showSnackbar(`Exported ${selectedNotes.length} notes`);
    } catch (err) {
      showSnackbar(
        `Failed to export notes: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleCreateNote = () => {
    const newNote: any = {
      title: "Untitled",
      content: "",
      quickCopy: null,
    };

    if (locationEnabled && location && lng && lat) {
      newNote.location = createGeoJSONPoint({ latitude: lat, longitude: lng });
    } else {
      newNote.location = null;
    }

    createNoteMutation.mutate(newNote);
  };

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["device-location"] });
    setShowRefreshControl(true);
    refetch().finally(() => setShowRefreshControl(false));
  };

  const handleNotePress = (noteId: string) => {
    if (isSelectionMode) {
      toggleNoteSelection(noteId);
    } else {
      router.push(`/note/details?id=\${noteId}` as any);
    }
  };

  const handleNoteLongPress = async (quickCopy: string | null) => {
    if (quickCopy) {
      await Clipboard.setStringAsync(quickCopy);
      showSnackbar(`"\${quickCopy}" has been copied to clipboard.`);
    }
  };

  const renderNoteCard = ({ item }: { item: NoteWithDistance }) => (
    <NoteCard
      note={item}
      isSelectionMode={isSelectionMode}
      isSelected={selectedNoteIds.has(item.id)}
      isLocationLoading={isLocationLoading}
      onPress={() => handleNotePress(item.id)}
      onLongPress={() => handleNoteLongPress(item.quickCopy)}
    />
  );

  const scaffoldProps = {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedTagId,
    isSelectionMode,
    onToggleSelectionMode: toggleSelectionMode,
    selectedCount: selectedNoteIds.size,
    onSelectAll: handleSelectAll,
    onClearSelection: clearSelection,
    location,
    isLocationLoading,
  };

  if (isPending) {
    return (
      <NotesScaffold {...scaffoldProps}>
        <LoadingFallback />
      </NotesScaffold>
    );
  }

  if (queryError) {
    return (
      <NotesScaffold {...scaffoldProps}>
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={styles.errorText}>
            Error loading notes
          </Text>
          <Text variant="bodyMedium">{queryError.message}</Text>
        </View>
      </NotesScaffold>
    );
  }

  if (!filteredNotes || filteredNotes.length === 0) {
    return (
      <NotesScaffold {...scaffoldProps}>
        <View style={styles.centerContainer}>
          <Text variant="titleLarge">No notes yet</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your first geo-note!
          </Text>
        </View>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateNote}
          loading={createNoteMutation.isPending}
          label="New Note"
        />
      </NotesScaffold>
    );
  }

  return (
    <NotesScaffold {...scaffoldProps}>
      <FlashList
        data={filteredNotes}
        renderItem={renderNoteCard}
        keyExtractor={(item: NoteWithDistance) => item.id}
        masonry
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.masonryContainer}
        refreshControl={
          <RefreshControl
            refreshing={showRefreshControl}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
      {isSelectionMode && (
        <BulkActionsBar
          selectedCount={selectedNoteIds.size}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          isDeleting={deleteNoteMutation.isPending}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateNote}
        loading={createNoteMutation.isPending}
        label="New Note"
      />
    </NotesScaffold>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  masonryContainer: {
    padding: CONTAINER_PADDING,
    gap: 8,
    paddingBottom: "25%",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
