import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import { PowerSyncDatabase } from "@powersync/react-native";

const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";
const factory = new OPSqliteOpenFactory({
  dbFilename: "sqlite.db",
  sqliteOptions: {
    extensions: [{ path, entryPoint }],
  },
});

export const powersync = new PowerSyncDatabase({ database: factory, schema: AppSchema });
