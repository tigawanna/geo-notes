import { drizzle } from "drizzle-orm/op-sqlite";
import * as schema from "./schema/tables";
import { open } from "@op-engineering/op-sqlite";

const opsqliteDb = open({
  name: "myDB",
});
const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";
opsqliteDb.loadExtension(path, entryPoint);
export const db = drizzle(opsqliteDb, {
  logger: true,
  schema: schema,
});
