import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import { ExpoSpatialiteProvider } from "@/lib/expo-spatialite/ExpoSpatialiteProvider";
import { Suspense } from "react";
import { runMigrations } from "../drizzle/migrations";

export function ExpoSpatialiteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExpoSpatialiteProvider
        databaseName="geo_noted.db"
        // databaseName="tpp.db"
        // checkTableName="kenya_wards"
        // assetSource={{ assetId: require("@/assets/kenya_wards.db"), forceOverwrite: true }}
        // location="test"

        onInit={async (db) => {
          await runMigrations(db);
          // const tables = await db.executeRawQuery("SELECT name FROM sqlite_master WHERE type='table';");
          // console.log("tables", tables);
        }}
        onError={(error) => {
          console.error("\n ❌ Spatialite database error:", error);
          // Log to crash reporting service
          // Show user-friendly error message
        }}>
        {children}
      </ExpoSpatialiteProvider>
    </Suspense>
  );
}
