import { db } from "@/lib/drizzle/client";
import { notes } from "@/lib/drizzle/schema";
import { useMutation } from "@tanstack/react-query";
import FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Divider, List, Portal, ProgressBar, Text } from "react-native-paper";
import { NotesJSONImport } from "./NotesJSONImport";

export function NotesJSONExport() {
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [progressDialogVisible, setProgressDialogVisible] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [exportedFileUri, setExportedFileUri] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: async () => {
      setProgressDialogVisible(true);
      const allNotes = await db.select().from(notes);
      const jsonData = JSON.stringify(allNotes, null, 2);
      
      const fileName = `notes_export_${new Date().toISOString().split('T')[0]}.json`;
      // @ts-ignore
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      return fileUri;
    },
    onSuccess: (fileUri) => {
      setProgressDialogVisible(false);
      setExportedFileUri(fileUri);
      setSuccessDialogVisible(true);
    },
    onError: () => {
      setProgressDialogVisible(false);
      // Handle error, maybe show error dialog
    },
  });

  const handleExport = () => {
    setConfirmDialogVisible(false);
    exportMutation.mutate();
  };

  const handleShare = async () => {
    if (exportedFileUri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(exportedFileUri);
    }
    setSuccessDialogVisible(false);
  };

  return (
    <View>
      <List.Section>
        <List.Subheader style={styles.listSubHeader}>Export Notes</List.Subheader>
        <List.Item
          title="Export to JSON"
          description="Export all notes to a JSON file"
          left={(props) => <List.Icon {...props} icon="file-export" />}
          onPress={() => setConfirmDialogVisible(true)}
          disabled={exportMutation.isPending}
        />
        <NotesJSONImport />
        <Divider />
      </List.Section>

      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm Export</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will export all your notes to a JSON file. Continue?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleExport}>Export</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={progressDialogVisible} dismissable={false}>
          <Dialog.Title>Exporting Notes</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Preparing your notes for export...
            </Text>
            <ProgressBar indeterminate />
          </Dialog.Content>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={successDialogVisible} onDismiss={() => setSuccessDialogVisible(false)}>
          <Dialog.Title>Export Complete</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Your notes have been successfully exported to JSON.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSuccessDialogVisible(false)}>Close</Button>
            <Button onPress={handleShare}>Share File</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
