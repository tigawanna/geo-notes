import { createNote } from "@/data-access-layer/notes-api";
import { TNote } from "@/lib/drizzle/schema";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from 'expo-document-picker';
import FileSystem from 'expo-file-system';
import { useState } from "react";
import { View } from "react-native";
import { Button, Checkbox, Dialog, List, Portal, ProgressBar, Text } from "react-native-paper";

export function NotesJSONImport() {
  const qc = useQueryClient();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importedNotes, setImportedNotes] = useState<TNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [importProgressVisible, setImportProgressVisible] = useState(false);

  const handleImportPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const notes: TNote[] = JSON.parse(content);

      if (!Array.isArray(notes)) {
        throw new Error('Invalid JSON format');
      }

      setImportedNotes(notes);
      setSelectedNotes(new Set(notes.map(note => note.id)));
      setImportDialogVisible(true);
    } catch (error) {
      // Handle error
      console.error(error);
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
      setSelectedNotes(new Set(importedNotes.map(note => note.id)));
    }
  };

  const handleImportSelected = async () => {
    setImportProgressVisible(true);
    const selectedNotesData = importedNotes.filter(note => selectedNotes.has(note.id));

    for (const note of selectedNotesData) {
      // Create new note with new ID
      const { id, ...noteData } = note;
      await createNote({ ...noteData, id: Crypto.randomUUID() });
    }

    setImportProgressVisible(false);
    setImportDialogVisible(false);
    qc.invalidateQueries({ queryKey: ['notes'] });
  };

  return (
    <>
      <List.Item
        title="Import from JSON"
        description="Import notes from a JSON file"
        left={(props) => <List.Icon {...props} icon="file-import" />}
        onPress={handleImportPress}
      />

      <Portal>
        <Dialog visible={importDialogVisible} onDismiss={() => setImportDialogVisible(false)} style={{ maxHeight: '80%' }}>
          <Dialog.Title>Import Notes</Dialog.Title>
          <Dialog.Content style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text variant="bodyMedium">Select notes to import ({selectedNotes.size}/{importedNotes.length})</Text>
              <Button onPress={toggleSelectAll}>
                {selectedNotes.size === importedNotes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </View>
            <FlashList
              data={importedNotes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <Checkbox
                    status={selectedNotes.has(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleNoteSelection(item.id)}
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text variant="bodyMedium" numberOfLines={1}>{item.title}</Text>
                    <Text variant="bodySmall" numberOfLines={2} style={{ opacity: 0.7 }}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleImportSelected} disabled={selectedNotes.size === 0}>
              Import Selected ({selectedNotes.size})
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={importProgressVisible} dismissable={false}>
          <Dialog.Title>Importing Notes</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Importing selected notes...
            </Text>
            <ProgressBar indeterminate />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
}
