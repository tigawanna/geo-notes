import { open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import * as schema from "./schema";

const opsqliteDb = open({
  name: "notes",
});
const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";
opsqliteDb.loadExtension(path, entryPoint);
export const db = drizzle(opsqliteDb, {
  logger: true,
  schema: schema,
});
