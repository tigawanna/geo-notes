import { db } from "@/lib/drizzle/client";
import { notes } from "@/lib/drizzle/schema";
import { useMutation } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Divider, List, Portal, ProgressBar, Text } from "react-native-paper";
import { NotesJSONImport } from "./NotesJSONImport";
import { getTableColumns, sql } from "drizzle-orm";


export function NotesJSONExport() {
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [progressDialogVisible, setProgressDialogVisible] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportedFileUri, setExportedFileUri] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: async () => {
      //   console.log("Starting export mutation");

      setProgressDialogVisible(true);
      const notesColumn = getTableColumns(notes);
      const allNotes = await db
        .select({
          ...notesColumn,
          location:
            sql<string>`'{"type":"Point","coordinates":[' || ST_X(${notes.location}) || ',' || ST_Y(${notes.location}) || ']}'`.as(
              "location"
            ),
        })
        .from(notes);
    //   logger.log("Fetched notes:", allNotes);
      const jsonData = JSON.stringify(allNotes, null, 2);

      const fileName = `notes_export_${new Date().toISOString().split("T")[0]}.json`;
      console.log("File name:", fileName);

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      //   console.log("File URI:", fileUri);

      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      //   console.log("File written successfully");
      return fileUri;
    },
    onSuccess: (fileUri) => {
      console.log("Export successful:", fileUri);
      setProgressDialogVisible(false);
      setExportedFileUri(fileUri);
      setSuccessDialogVisible(true);
    },
    onError: (error) => {
      console.error("Export failed:", error);
      setProgressDialogVisible(false);
      // Show error dialog
      setErrorDialogVisible(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    },
  });

  const handleExport = () => {
    setConfirmDialogVisible(false);
    exportMutation.mutate();
  };

  const handleShare = async () => {
    if (exportedFileUri && (await Sharing.isAvailableAsync())) {
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
            <Text variant="bodyMedium">Your notes have been successfully exported to JSON.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSuccessDialogVisible(false)}>Close</Button>
            <Button onPress={handleShare}>Share File</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={errorDialogVisible} onDismiss={() => setErrorDialogVisible(false)}>
          <Dialog.Title>Export Failed</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Failed to export notes: {errorMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorDialogVisible(false)}>Close</Button>
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
