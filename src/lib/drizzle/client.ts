import { ANDROID_DATABASE_PATH, IOS_LIBRARY_PATH, open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { EnhancedQueryLogger } from "drizzle-query-logger";
import { Platform } from "react-native";
import * as schema from "./schema";

const opsqliteDb = open({
  name: "notes",
  location: Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH,
});
const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";

opsqliteDb.loadExtension(path, entryPoint);
export const db = drizzle(opsqliteDb, {
  logger: __DEV__?new EnhancedQueryLogger():false,
  schema: schema,
});
