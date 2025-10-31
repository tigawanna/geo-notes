import "@azure/core-asynciterator-polyfill";
import * as DrizzleSchema from "@/lib/drizzle/schema";
import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import {
  createBaseLogger,
  GlobalLogger,
  LogLevel,
  PowerSyncDatabase,
  SyncClientImplementation,
} from "@powersync/react-native";

import React from "react";
import { configureFts } from "@/lib/fts/fts-setup";
import { SupabaseConnector } from "../supabase/powersync-connector";
import { SupabaseStorageAdapter } from "@/lib/supabase/storage";
import { KVStorage } from "@/lib/expo-secure-store/kv-store";

const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";

// adapt Drizzle schema to PowerSync
export const AppSchema = new DrizzleAppSchema(DrizzleSchema);

const factory = new OPSqliteOpenFactory({
  dbFilename: "sqlite.db",
  sqliteOptions: {
    extensions: [{ path, entryPoint }],
  },
});

// const logger = createBaseLogger();
// logger.useDefaults();
// logger.setLevel(LogLevel.DEBUG);

export class System {
  kvStorage: KVStorage;
  storage: SupabaseStorageAdapter;
  supabaseConnector: SupabaseConnector;
  powersync: PowerSyncDatabase;
  logger: GlobalLogger;
  // attachmentQueue: PhotoAttachmentQueue | undefined = undefined;

  constructor() {
    this.kvStorage = new KVStorage();
    this.supabaseConnector = new SupabaseConnector(this);
    this.storage = this.supabaseConnector.storage;
    this.powersync = new PowerSyncDatabase({ database: factory, schema: AppSchema });
    this.logger = createBaseLogger();
    /**
     * The snippet below uses OP-SQLite as the default database adapter.
     * You will have to uninstall `@journeyapps/react-native-quick-sqlite` and
     * install both `@powersync/op-sqlite` and `@op-engineering/op-sqlite` to use this.
     *
     * ```typescript
     * import { OPSqliteOpenFactory } from '@powersync/op-sqlite'; // Add this import
     *
     * const factory = new OPSqliteOpenFactory({
     *  dbFilename: 'sqlite.db'
     * });
     * this.powersync = new PowerSyncDatabase({ database: factory, schema: AppSchema });
     * ```
     */

    // if (envVariables.EXPO_PUBLIC_SUPABASE_BUCKET) {
    //   this.attachmentQueue = new PhotoAttachmentQueue({
    //     powersync: this.powersync,
    //     storage: this.storage,
    //     // Use this to handle download errors where you can use the attachment
    //     // and/or the exception to decide if you want to retry the download
    //     onDownloadError: async (attachment: AttachmentRecord, exception: any) => {
    //       if (exception.toString() === "StorageApiError: Object not found") {
    //         return { retry: false };
    //       }

    //       return { retry: true };
    //     },
    //   });
    // }
  }

  async init() {
    await this.powersync.init();
    await this.powersync.connect(this.supabaseConnector, {
      clientImplementation: SyncClientImplementation.RUST,
    });
    this.logger.useDefaults();
    this.logger.setLevel(LogLevel.DEBUG);

    // if (this.attachmentQueue) {
    //   await this.attachmentQueue.init();
    // }

    // Demo using SQLite Full-Text Search with PowerSync.
    // See https://docs.powersync.com/usage-examples/full-text-search for more details
    await configureFts(this.powersync);
  }
}

export const system = new System();

export const SystemContext = React.createContext(system);
export const useSystem = () => React.useContext(SystemContext);
