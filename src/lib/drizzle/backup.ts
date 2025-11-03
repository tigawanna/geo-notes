import { useSettingsStore } from "@/store/settings-store";
import {
  ANDROID_DATABASE_PATH,
  IOS_LIBRARY_PATH,
} from "@op-engineering/op-sqlite";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * Database backup utility for SQLite database
 * Handles exporting, sharing, and importing database backups
 * Uses official @op-engineering/op-sqlite location constants
 */

export interface BackupResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface BackupInfo {
  fileName: string;
  size: number;
  date: Date;
  path: string;
}

/**
 * Get the database file path using op-sqlite's location constants
 * This matches exactly where op-sqlite stores the database
 */
function getDatabaseFilePath(): string {
  const dbName = "notes";
  const location = Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;
  
  // Remove trailing slash from location if present to avoid double slashes
  const cleanLocation = location.endsWith('/') ? location.slice(0, -1) : location;
  
  // Construct the full path to the database file
  return `${cleanLocation}/${dbName}`;
}

/**
 * Get the database file as an expo-file-system File object
 */
function getDatabaseFile(): File {
  const dbPath = getDatabaseFilePath();
  return new File(dbPath);
}

/**
 * Get the backup directory
 * Creates the directory if it doesn't exist
 */
async function getBackupDirectory(): Promise<Directory> {
  const backupDir = new Directory(Paths.document, "backups");
  
  if (!backupDir.exists) {
    await backupDir.create();
  }
  
  return backupDir;
}

/**
 * Generate a timestamped backup filename
 */
function generateBackupFileName(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T");
  return `geo-notes-backup-${timestamp[0]}-${timestamp[1].split("Z")[0]}.db`;
}

/**
 * Export/backup the SQLite database to a file
 * Uses op-sqlite location constants to find the exact database location
 * @returns Promise with backup result including the path to the backup file
 */
export async function exportDatabase(): Promise<BackupResult> {
  try {
    const sourceFile = getDatabaseFile();
    const backupDir = await getBackupDirectory();
    const backupFileName = generateBackupFileName();
    const backupFile = new File(backupDir, backupFileName);

    // Check if source database exists
    if (!sourceFile.exists) {
      // Log the path we're looking for to help with debugging
      console.log("Database not found at:", getDatabaseFilePath());
      return {
        success: false,
        error: "Database file not found. The database may not be initialized yet.",
      };
    }

    // Copy the database file to backup location
    await sourceFile.copy(backupFile);

    // Update settings store with backup info
    useSettingsStore.getState().setLocalBackupPath(backupFile.uri);
    useSettingsStore.getState().setLastBackup(new Date());

    return {
      success: true,
      path: backupFile.uri,
    };
  } catch (error) {
    console.error("Error exporting database:", error);
    console.error("Database path:", getDatabaseFilePath());
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Share the database backup file
 * This allows users to save the backup to their preferred location
 * @param backupPath - Optional path to an existing backup. If not provided, creates a new backup
 */
export async function shareDatabase(backupPath?: string): Promise<BackupResult> {
  try {
    let pathToShare = backupPath;

    // If no path provided, create a new backup first
    if (!pathToShare) {
      const exportResult = await exportDatabase();
      if (!exportResult.success || !exportResult.path) {
        return exportResult;
      }
      pathToShare = exportResult.path;
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: "Sharing is not available on this device",
      };
    }

    // Share the file
    await Sharing.shareAsync(pathToShare, {
      mimeType: "application/x-sqlite3",
      dialogTitle: "Save GeoNotes Database Backup",
      UTI: "public.database", // iOS Universal Type Identifier
    });

    return {
      success: true,
      path: pathToShare,
    };
  } catch (error) {
    console.error("Error sharing database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Import/restore a database from a backup file
 * @param backupPath - Path to the backup file to restore
 * @returns Promise with import result
 */
export async function importDatabase(backupPath: string): Promise<BackupResult> {
  try {
    const targetFile = getDatabaseFile();
    const backupFile = new File(backupPath);

    // Check if backup file exists
    if (!backupFile.exists) {
      return {
        success: false,
        error: "Backup file not found",
      };
    }

    // Create a backup of current database before replacing (just in case)
    if (targetFile.exists) {
      const emergencyBackupFile = new File(`${targetFile.uri}.emergency-backup`);
      await targetFile.copy(emergencyBackupFile);
    }

    // Copy backup file to database location
    await backupFile.copy(targetFile);

    return {
      success: true,
      path: targetFile.uri,
    };
  } catch (error) {
    console.error("Error importing database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * List all available backups in the backup directory
 * @returns Promise with array of backup information
 */
export async function listBackups(): Promise<BackupInfo[]> {
  try {
    const backupDir = await getBackupDirectory();
    const items = backupDir.list();

    const backupInfos: BackupInfo[] = [];

    for (const item of items) {
      if (item instanceof File && item.uri.endsWith(".db")) {
        const size = await item.size;
        const modifiedTime = item.modificationTime;

        backupInfos.push({
          fileName: item.name,
          size: size || 0,
          date: new Date(modifiedTime || 0),
          path: item.uri,
        });
      }
    }

    // Sort by date, newest first
    return backupInfos.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error listing backups:", error);
    return [];
  }
}

/**
 * Delete a backup file
 * @param backupPath - Path to the backup file to delete
 */
export async function deleteBackup(backupPath: string): Promise<BackupResult> {
  try {
    const backupFile = new File(backupPath);
    
    if (!backupFile.exists) {
      return {
        success: false,
        error: "Backup file not found",
      };
    }

    await backupFile.delete();

    return {
      success: true,
      path: backupPath,
    };
  } catch (error) {
    console.error("Error deleting backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get information about the current database
 * Uses op-sqlite location constants for accurate path
 */
export async function getDatabaseInfo(): Promise<BackupInfo | null> {
  try {
    const dbFile = getDatabaseFile();
    const dbPath = getDatabaseFilePath();

    if (!dbFile.exists) {
      console.log("Database not found at:", dbPath);
      return null;
    }

    const size = await dbFile.size;
    const modifiedTime = dbFile.modificationTime;

    return {
      fileName: dbFile.name,
      size: size || 0,
      date: new Date(modifiedTime || 0),
      path: dbPath,
    };
  } catch (error) {
    console.error("Error getting database info:", error);
    console.error("Database path:", getDatabaseFilePath());
    return null;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
