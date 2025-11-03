import { drizzle } from "drizzle-orm/op-sqlite";
import { opsqliteDb } from "../op-sqlite/client";
import * as schema from "./schema";

export const db = drizzle(opsqliteDb, {
  // logger: __DEV__ ? new EnhancedQueryLogger() : false,
  schema: schema,
});
