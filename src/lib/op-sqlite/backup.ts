import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { logger } from "@/utils/logger";
import { DATABASE_BACKUP_NAME, DATABASE_LOCATION, DATABASE_NAME } from "./client";

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
  }
}

export async function importDatabase() {
    
}
