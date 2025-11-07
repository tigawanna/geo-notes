import { importDatabase } from "@/lib/op-sqlite/backup";
import { logger } from "@/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Dialog, List, Portal, ProgressBar, Text } from "react-native-paper";

export function DatabaseImport() {
  const qc = useQueryClient();
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [progressDialogVisible, setProgressDialogVisible] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  const handleImport = async () => {
    setConfirmDialogVisible(false);
    setProgressDialogVisible(true);
    try {
      await importDatabase();
      setProgressDialogVisible(false);
      setSuccessDialogVisible(true);
    } catch (error) {
      logger.error("Import failed:", error);
      setProgressDialogVisible(false);
      // Could add error dialog here
    }
  };

  const handleRestart = () => {
    setSuccessDialogVisible(false);
    qc.invalidateQueries({ queryKey: ["notes"] });
    router.replace("/");
  };

  return (
    <>
      <List.Item
        title="Import Database"
        description="Replace database from backup file"
        left={(props) => <List.Icon {...props} icon="database-import" />}
        onPress={() => setConfirmDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm Database Import</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will replace your current database with the backup file. Make sure you have a backup of your current data! The app will need to restart after import.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleImport}>Import</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={progressDialogVisible} dismissable={false}>
          <Dialog.Title>Importing Database</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Restoring database from backup...
            </Text>
            <ProgressBar indeterminate />
          </Dialog.Content>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={successDialogVisible} dismissable={false}>
          <Dialog.Title>Import Complete</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Database imported successfully. The app needs to restart to apply the changes.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleRestart}>Restart Now</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
