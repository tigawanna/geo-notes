import { opsqliteDb } from "./client";

/**
 * Initialize SpatiaLite spatial metadata tables.
 * This only needs to be run ONCE per database.
 * After initialization, you can use functions like:
 * - GeodesicLength() for accurate distance
 * - Transform() for coordinate system conversions
 * 
 * WARNING: This adds ~1-2MB to your database size
 */
export function initializeSpatialMetadata() {
  try {
    // Initialize spatial metadata (creates spatial_ref_sys and other tables)
    opsqliteDb.execute("SELECT InitSpatialMetadata(1);");
    console.log("✅ Spatial metadata initialized successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Failed to initialize spatial metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if spatial metadata is already initialized
 */
export function isSpatialMetadataInitialized(): boolean {
  try {
    const result = opsqliteDb.executeSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='spatial_ref_sys';"
    );
    return result.rows && result.rows.length > 0;
  } catch (error) {
    console.error("Error checking spatial metadata:", error);
    return false;
  }
}

/**
 * Initialize spatial metadata if not already done
 */
export function ensureSpatialMetadata() {
  if (!isSpatialMetadataInitialized()) {
    console.log("Spatial metadata not found, initializing...");
    return initializeSpatialMetadata();
  }
  console.log("Spatial metadata already initialized");
  return { success: true, error: null };
}
