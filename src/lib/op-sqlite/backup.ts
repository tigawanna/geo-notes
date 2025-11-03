import { logger } from "@/utils/logger";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { DATABASE_BACKUP_NAME, DATABASE_LOCATION, DATABASE_NAME, opsqliteDb } from "./client";

const APP_FILE_PATH = FileSystem.documentDirectory;
const DB_FILE_PATH = `file://${DATABASE_LOCATION}/${DATABASE_NAME}`;
const DB_BACKUP_NAME = `${APP_FILE_PATH}SQLite/${DATABASE_BACKUP_NAME}`;

export async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
    const backUpNameWithTimestamp = `${DB_BACKUP_NAME.replace(".db", "")}-${timestamp}.db`;
    await FileSystem.copyAsync({
      from: DB_FILE_PATH,
      to: backUpNameWithTimestamp,
    });
    await Sharing.shareAsync(backUpNameWithTimestamp, { mimeType: "application/x-sqlite3" });
    await FileSystem.deleteAsync(backUpNameWithTimestamp, { idempotent: true });
  } catch (error) {
    logger.error("Error during database backup:", error);
    throw error;
  }
}

export async function importDatabase(): Promise<void> {
  try {
    // Open document picker to select backup file
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      logger.log("Import cancelled by user");
      return;
    }

    const backupPath = result.assets[0].uri;
    
    // Verify the backup file exists
    const backupExists = await FileSystem.getInfoAsync(backupPath);
    if (!backupExists.exists) {
      throw new Error("Selected backup file does not exist");
    }

    // Close the current database connection
    opsqliteDb.close();

    // Define paths for database and WAL files
    const databasePath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    const walFilePath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}-wal`;
    const shmFilePath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}-shm`;

    // Delete WAL and SHM files to ensure data doesn't get corrupted
    await FileSystem.deleteAsync(walFilePath, { idempotent: true });
    await FileSystem.deleteAsync(shmFilePath, { idempotent: true });

    logger.log("Restoring database from:", backupPath);

    // Copy the backup file to the database location
    await FileSystem.copyAsync({
      from: backupPath,
      to: databasePath,
    });

    logger.log("Database restored successfully");
  } catch (error) {
    logger.error("Could not restore database:", error);
    throw error;
  }
}
