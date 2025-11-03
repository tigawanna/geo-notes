import {
    deleteBackup,
    exportDatabase,
    formatFileSize,
    getDatabaseInfo,
    listBackups,
    shareDatabase,
    type BackupInfo,
    type BackupResult,
} from "@/lib/drizzle/backup";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

/**
 * Hook for managing database backups
 * Provides backup, share, and management functionality
 */
export function useBackup() {
  const [isLoading, setIsLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState<BackupInfo | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load current database information
   */
  const loadDatabaseInfo = useCallback(async () => {
    try {
      const info = await getDatabaseInfo();
      setDbInfo(info);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load database info");
    }
  }, []);

  /**
   * Load list of available backups
   */
  const loadBackups = useCallback(async () => {
    try {
      const backupList = await listBackups();
      setBackups(backupList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load backups");
    }
  }, []);

  /**
   * Create a new backup
   */
  const backup = useCallback(
    async (options?: { silent?: boolean; showShare?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await exportDatabase();

        if (result.success) {
          await loadBackups(); // Refresh backup list

          if (!options?.silent) {
            const buttons: any[] = [{ text: "OK", style: "default" }];

            if (options?.showShare && result.path) {
              buttons.push({
                text: "Share",
                style: "default",
                onPress: async () => {
                  // Inline share to avoid circular dependency
                  setIsLoading(true);
                  try {
                    await shareDatabase(result.path);
                  } finally {
                    setIsLoading(false);
                  }
                },
              });
            }

            Alert.alert("Backup Created", "Database backed up successfully!", buttons);
          }

          return result;
        } else {
          setError(result.error || "Backup failed");
          if (!options?.silent) {
            Alert.alert("Backup Failed", result.error || "Unknown error occurred");
          }
          return result;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        if (!options?.silent) {
          Alert.alert("Backup Failed", message);
        }
        return { success: false, error: message } as BackupResult;
      } finally {
        setIsLoading(false);
      }
    },
    [loadBackups]
  );

  /**
   * Share a backup file
   */
  const share = useCallback(async (backupPath?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await shareDatabase(backupPath);

      if (!result.success) {
        setError(result.error || "Share failed");
        Alert.alert("Share Failed", result.error || "Unknown error occurred");
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      Alert.alert("Share Failed", message);
      return { success: false, error: message } as BackupResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a backup file with confirmation
   */
  const deleteBackupWithConfirmation = useCallback(
    async (backupPath: string, backupName: string) => {
      return new Promise<BackupResult>((resolve) => {
        Alert.alert(
          "Delete Backup",
          `Are you sure you want to delete "${backupName}"?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve({ success: false, error: "Cancelled" }),
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                setIsLoading(true);
                try {
                  const result = await deleteBackup(backupPath);
                  if (result.success) {
                    await loadBackups(); // Refresh list
                  } else {
                    Alert.alert("Delete Failed", result.error || "Unknown error");
                  }
                  resolve(result);
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Unknown error";
                  Alert.alert("Delete Failed", message);
                  resolve({ success: false, error: message });
                } finally {
                  setIsLoading(false);
                }
              },
            },
          ]
        );
      });
    },
    [loadBackups]
  );

  /**
   * Create backup and immediately share
   */
  const backupAndShare = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const exportResult = await exportDatabase();

      if (!exportResult.success) {
        Alert.alert("Backup Failed", exportResult.error || "Unknown error occurred");
        return exportResult;
      }

      const shareResult = await shareDatabase(exportResult.path);

      if (!shareResult.success) {
        Alert.alert("Share Failed", shareResult.error || "Unknown error occurred");
      }

      await loadBackups(); // Refresh backup list
      return shareResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      Alert.alert("Operation Failed", message);
      return { success: false, error: message } as BackupResult;
    } finally {
      setIsLoading(false);
    }
  }, [loadBackups]);

  /**
   * Get formatted database size
   */
  const databaseSize = dbInfo ? formatFileSize(dbInfo.size) : null;

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    loadDatabaseInfo();
    loadBackups();
  }, [loadDatabaseInfo, loadBackups]);

  return {
    // State
    isLoading,
    error,
    dbInfo,
    backups,
    databaseSize,

    // Actions
    backup,
    share,
    backupAndShare,
    deleteBackup: deleteBackupWithConfirmation,
    refresh: () => {
      loadDatabaseInfo();
      loadBackups();
    },

    // Utilities
    formatFileSize,
  };
}

/**
 * Hook for simple backup with minimal configuration
 * Good for quick implementations
 */
export function useSimpleBackup() {
  const [isLoading, setIsLoading] = useState(false);

  const backup = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await exportDatabase();
      if (result.success) {
        Alert.alert("Success", "Backup created successfully!");
      } else {
        Alert.alert("Failed", result.error || "Backup failed");
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const backupAndShare = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await shareDatabase();
      if (!result.success) {
        Alert.alert("Failed", result.error || "Operation failed");
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    backup,
    backupAndShare,
  };
}
