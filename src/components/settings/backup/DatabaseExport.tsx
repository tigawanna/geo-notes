import { backupDatabase } from "@/lib/op-sqlite/backup";
import { logger } from "@/utils/logger";
import { useState } from "react";
import { Button, Dialog, List, Portal, ProgressBar, Text } from "react-native-paper";

export function DatabaseExport() {
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [progressDialogVisible, setProgressDialogVisible] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  const handleExport = async () => {
    setConfirmDialogVisible(false);
    setProgressDialogVisible(true);
    try {
      await backupDatabase();
      setProgressDialogVisible(false);
      setSuccessDialogVisible(true);
    } catch (error) {
      logger.error("Backup failed:", error);
      setProgressDialogVisible(false);
      // Could add error dialog here
    }
  };

  return (
    <>
      <List.Item
        title="Backup Database"
        description="Export your database to a file"
        left={(props) => <List.Icon {...props} icon="database-export" />}
        onPress={() => setConfirmDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm Database Export</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will create a backup file of your entire database. Continue?
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
          <Dialog.Title>Exporting Database</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Creating database backup...
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
              Database backup created successfully.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSuccessDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
