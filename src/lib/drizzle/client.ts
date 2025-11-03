import { drizzle } from "drizzle-orm/op-sqlite";
import { EnhancedQueryLogger } from "drizzle-query-logger";
import { opsqliteDb } from "../op-sqlite/client";
import * as schema from "./schema";

export const db = drizzle(opsqliteDb, {
  // logger: __DEV__ ? new EnhancedQueryLogger() : false,
  schema: schema,
});
