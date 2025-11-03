import { ANDROID_DATABASE_PATH, IOS_LIBRARY_PATH, open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { EnhancedQueryLogger } from "drizzle-query-logger";
import { Platform } from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import { logger } from "@/utils/logger";

export const DATABASE_NAME = "notes.db";
export const DATABASE_BACKUP_NAME = "notes-backup.db";
export const DATABASE_LOCATION = Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;

const db = open({
  name: DATABASE_NAME,
  location: DATABASE_LOCATION,
});
const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";

db.loadExtension(path, entryPoint);

export const opsqliteDb = db;



