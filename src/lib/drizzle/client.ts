import { open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { EnhancedQueryLogger } from "drizzle-query-logger";
import * as schema from "./schema";

const opsqliteDb = open({
  name: "notes",
});
const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";
opsqliteDb.loadExtension(path, entryPoint);
export const db = drizzle(opsqliteDb, {
  logger: __DEV__?new EnhancedQueryLogger():false,
  schema: schema,
});
