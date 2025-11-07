import { backupDatabase, importDatabase } from "@/lib/op-sqlite/backup";
import { logger } from "@/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Divider, List } from "react-native-paper";



export function BackupSettings() {
  const qc = useQueryClient();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      await backupDatabase();
      Alert.alert("Success", "Database backed up successfully");
    } catch (error) {
      logger.error("Backup failed:", error);
      Alert.alert("Error", "Failed to backup database");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      "Import Database",
      "This will replace your current database. Make sure you have a backup! The app will need to restart after import.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            try {
              setIsImporting(true);
              await importDatabase();
              Alert.alert("Success", "Database imported successfully. Please restart the app.", [
                {
                  text: "Restart Now",
                  onPress: () => {
                    // Force app to reload by navigating to root
                    qc.invalidateQueries({ queryKey: ["notes"] });
                    router.replace("/");
                  },
                },
              ]);
            } catch (error) {
              logger.error("Import failed:", error);
              Alert.alert("Error", "Failed to import database");
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };
  return (
    <List.Section>
      <List.Subheader style={[styles.listSubHeader]}>Backup & Restore</List.Subheader>
      <List.Item
        title="Backup Database"
        description="Export your database to a file"
        left={(props) => <List.Icon {...props} icon="database-export" />}
        onPress={handleBackup}
        disabled={isBackingUp}
      />
      <List.Item
        title="Import Database"
        description="Replace database from backup file"
        left={(props) => <List.Icon {...props} icon="database-import" />}
        onPress={handleImport}
        disabled={isImporting}
      />
      <Divider />
    </List.Section>
  );
}

const styles = StyleSheet.create({
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
