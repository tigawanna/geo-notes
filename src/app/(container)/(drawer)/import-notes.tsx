import { createNote } from "@/data-access-layer/notes-api";
import { InsertNoteZodSchema, TNote } from "@/lib/drizzle/schema";
import { logger } from "@/utils/logger";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Checkbox, ProgressBar, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImportNotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { fileUri } = useLocalSearchParams<{ fileUri: string }>();

  const [importedNotes, setImportedNotes] = useState<TNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [importProgressVisible, setImportProgressVisible] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileUri) {
      loadFile(fileUri);
    } else {
      setError("No file selected");
      setIsLoadingFile(false);
    }
  }, [fileUri]);

  const loadFile = async (uri: string) => {
    try {
      setIsLoadingFile(true);
      setError(null);

      const content = await FileSystem.readAsStringAsync(uri);
      const notes: TNote[] = JSON.parse(content);

      if (!Array.isArray(notes)) {
        throw new Error("Invalid JSON format - expected an array of notes");
      }

      setImportedNotes(notes);
      setSelectedNotes(new Set(notes.map((note) => note.id)));
    } catch (error) {
      console.error("Error loading file:", error);
      setError(error instanceof Error ? error.message : "Failed to load file");
    } finally {
      setIsLoadingFile(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNotes.size === importedNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(importedNotes.map((note) => note.id)));
    }
  };

  const handleImportSelected = async () => {
    setImportProgressVisible(true);
    const selectedNotesData = importedNotes.filter((note) => selectedNotes.has(note.id));
    // logger.log("Importing notes:", selectedNotesData);

    for (const note of selectedNotesData) {
      // Create new note with new ID
      const { id, ...noteData } = note;
      const importedNote = InsertNoteZodSchema.safeParse({ ...noteData, id: Crypto.randomUUID() });
      if (importedNote.success) {
        await createNote(importedNote.data);
      } else {
        logger.error("Failed to import note:", importedNote.error);
      }
    }

    setImportProgressVisible(false);
    qc.invalidateQueries({ queryKey: ["notes"] });
    router.back();
  };

  if (isLoadingFile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge">Loading file...</Text>
          <ProgressBar indeterminate style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
            Error: {error}
          </Text>
          <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Select Notes to Import
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {selectedNotes.size} of {importedNotes.length} notes selected
          </Text>
          <Button onPress={toggleSelectAll} style={styles.selectAllButton}>
            {selectedNotes.size === importedNotes.length ? "Deselect All" : "Select All"}
          </Button>
        </View>

        <FlashList
          data={importedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.noteItem, { backgroundColor: theme.colors.surface }]}>
              <Checkbox
                status={selectedNotes.has(item.id) ? "checked" : "unchecked"}
                onPress={() => toggleNoteSelection(item.id)}
              />
              <View style={styles.noteContent}>
                <Text variant="bodyLarge" numberOfLines={1} style={styles.noteTitle}>
                  {item.title || "Untitled"}
                </Text>
                <Text variant="bodyMedium" numberOfLines={3} style={styles.noteText}>
                  {item.content || "No content"}
                </Text>
                {item.created && (
                  <Text variant="bodySmall" style={styles.noteDate}>
                    Created: {new Date(item.created).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">No notes found in the selected file</Text>
            </View>
          }
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button mode="outlined" onPress={() => router.back()} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleImportSelected}
            disabled={selectedNotes.size === 0 || importProgressVisible}
            loading={importProgressVisible}
            style={styles.importButton}>
            Import {selectedNotes.size} Notes
          </Button>
        </View>
      </View>

      {importProgressVisible && (
        <View style={styles.progressOverlay}>
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
            <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
              Importing notes...
            </Text>
            <ProgressBar indeterminate />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    padding: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
    opacity: 0.7,
  },
  selectAllButton: {
    alignSelf: "flex-start",
  },
  listContent: {
    padding: 16,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  noteText: {
    marginBottom: 8,
    opacity: 0.8,
  },
  noteDate: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  importButton: {
    flex: 2,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    padding: 32,
    borderRadius: 8,
    margin: 32,
    alignItems: "center",
  },
});
