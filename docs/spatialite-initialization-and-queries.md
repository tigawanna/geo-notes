# SpatiaLite Initialization and Queries

This document explains how SpatiaLite is configured in GeoNotes and what's required for different types of spatial queries.

---

## Native Library Setup: Spatialite .so Files

Before SpatiaLite can be used, the native libraries must be bundled with the Android app.

### Source of Libraries
The Spatialite native libraries (`.so` files) come from:
**[tigawanna/spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs)**

This repo provides pre-built Spatialite binaries for multiple Android architectures:
- `arm64-v8a` (64-bit ARM)
- `armeabi-v7a` (32-bit ARM)
- `x86` (32-bit Intel)
- `x86_64` (64-bit Intel)

### Expo Config Plugin
The `.so` files are copied into the Android build during Expo prebuild using a custom config plugin.

**Location**: `plugins/opsqlite-spatialite/with-spatialite.js`

```javascript
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

/**
 * Expo plugin for copying Spatialite native libraries (.so files)
 * during the Android prebuild process
 */
module.exports = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const pluginDir = module.filename ? path.dirname(module.filename) : process.cwd();
      const sourceBase = path.join(pluginDir, "spatialite-libs", "jni");
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const targetBase = path.join(platformProjectRoot, "app", "src", "main", "jniLibs");

      // Copy .so files for each architecture
      const architectures = ["arm64-v8a", "armeabi-v7a", "x86", "x86_64"];

      for (const arch of architectures) {
        const sourceDir = path.join(sourceBase, arch);
        const targetDir = path.join(targetBase, arch);

        if (fs.existsSync(sourceDir)) {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const files = fs.readdirSync(sourceDir);
          for (const file of files) {
            if (file.endsWith(".so")) {
              const sourceFile = path.join(sourceDir, file);
              const targetFile = path.join(targetDir, file);
              fs.copyFileSync(sourceFile, targetFile);
              console.log(`✓ Copied Spatialite library: ${arch}/${file}`);
            }
          }
        }
      }

      console.log("✅ Spatialite native libraries installed successfully!");
      return config;
    },
  ]);
};
```

### How It Works

1. **Libraries stored in**: `plugins/opsqlite-spatialite/spatialite-libs/jni/{arch}/`
2. **Plugin registered in**: `app.config.ts`
3. **During `npx expo prebuild`**: Plugin copies `.so` files to `android/app/src/main/jniLibs/{arch}/`
4. **At runtime**: Android loads the native libraries, making them available to `op-sqlite`

### Directory Structure
```
plugins/opsqlite-spatialite/
├── with-spatialite.js           # Expo config plugin
├── spatialite-libs/
│   └── jni/
│       ├── arm64-v8a/
│       │   └── libspatialite.so
│       ├── armeabi-v7a/
│       │   └── libspatialite.so
│       ├── x86/
│       │   └── libspatialite.so
│       └── x86_64/
│           └── libspatialite.so
```

### Registering the Plugin

In `app.config.ts`:

```typescript
plugins: [
  // ... other plugins
  "./plugins/opsqlite-spatialite/with-spatialite",
],
```

---

## Overview: Two-Level Setup

SpatiaLite functionality requires two distinct setup steps:

1. **Extension Loading** (Required) - Adds spatial functions to SQLite
2. **Metadata Initialization** (Optional) - Adds spatial reference system tables

---

## 1. Extension Loading (Required) ✅

### Location
`src/lib/op-sqlite/client.ts`

### Code
```typescript
import { ANDROID_DATABASE_PATH, IOS_LIBRARY_PATH, open } from "@op-engineering/op-sqlite";
import { Platform } from "react-native";

export const DATABASE_NAME = "notes.db";
export const DATABASE_BACKUP_NAME = "notes-backup.db";
export const DATABASE_LOCATION = Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;

const db = open({
  name: DATABASE_NAME,
  location: DATABASE_LOCATION,
});

const path = "libspatialite";
const entryPoint = "sqlite3_modspatialite_init";

// ⭐ This loads the Spatialite extension - REQUIRED for all spatial operations
db.loadExtension(path, entryPoint);

export const opsqliteDb = db;
```

### What It Enables

This extension loading is **essential** and enables:

- ✅ **Geometry Functions**: `ST_X()`, `ST_Y()`, `ST_Distance()`
- ✅ **Geometry Creation**: `GeomFromGeoJSON()`, `MakePoint()`, `MakeLine()`
- ✅ **Math Functions**: `RADIANS()`, `SIN()`, `COS()`, `ASIN()`, `SQRT()`, `POWER()`
- ✅ **Conversion Functions**: `AsGeoJSON()`, `AsText()`

### Status
✅ **Already configured and working** - No changes needed!

---

## 2. Metadata Initialization (Optional) ⚙️

### Purpose
Creates the `spatial_ref_sys` table and related spatial metadata tables that are required for:
- Coordinate system transformations
- Geodesic distance calculations using built-in functions
- More advanced spatial operations

### Location
`src/lib/op-sqlite/init-spatial-metadata.ts`

### Code
```typescript
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
```

### What It Enables

When initialized, you can use:

- ✅ **GeodesicLength()** - Calculate accurate great-circle distances
- ✅ **Transform()** - Convert between coordinate systems (e.g., SRID 4326 for WGS84)
- ✅ **ST_Distance() with geodesic parameter** - More accurate distance calculations
- ✅ **Advanced spatial operations** - Projections, transformations, etc.

### Status
❌ **Not currently initialized** - The app works fine without it using Haversine formula

---

## Current Query Approach: Haversine Formula

### Location
`src/data-access-layer/notes-api.ts`

### Code
```typescript
export async function getNotes({ sortOption, location, tagId }: GetNotesProps) {
  try {
    const notesColumn = getTableColumns(notes);

    const query = db
      .select({
        ...notesColumn,
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // Calculate great-circle distance using Haversine formula
        // Result is in meters (Earth's radius * 1000 for meters)
        distance: sql`(
          6371000 * 2 * ASIN(
            SQRT(
              POWER(SIN((RADIANS(ST_Y(${notes.location})) - RADIANS(${location?.lat||0})) / 2), 2) +
              COS(RADIANS(${location?.lat||0})) * 
              COS(RADIANS(ST_Y(${notes.location}))) *
              POWER(SIN((RADIANS(ST_X(${notes.location})) - RADIANS(${location?.lng||0})) / 2), 2)
            )
          )
        )`.as("distance_meters"),
      })
      .from(notes);

    // ... rest of query
  }
}
```

### Why This Works

This approach **only requires Extension Loading** (Level 1) because it:
- Uses basic geometry functions: `ST_X()`, `ST_Y()`
- Uses math functions: `RADIANS()`, `SIN()`, `COS()`, `ASIN()`, `SQRT()`, `POWER()`
- Implements the Haversine formula manually in SQL
- Doesn't need `spatial_ref_sys` or coordinate transformations

### Pros
- ✅ Works without metadata initialization
- ✅ Fast execution
- ✅ Accurate (~0.5% error)
- ✅ No database size overhead

### Cons
- ❌ Verbose SQL code
- ❌ Not using SpatiaLite's built-in geodesic functions

---

## Alternative Approach: GeodesicLength (Requires Metadata)

### If You Initialize Metadata

After running `ensureSpatialMetadata()`, you could simplify the query:

```typescript
const currLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng||0},${location?.lat||0}]}`;

const query = db
  .select({
    ...notesColumn,
    latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
    longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
    // Much simpler distance calculation!
    distance: sql`GeodesicLength(
      MakeLine(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON}))
    )`.as("distance_meters"),
  })
  .from(notes);
```

### Pros
- ✅ Much cleaner, more readable code
- ✅ Slightly more accurate (uses WGS84 ellipsoid)
- ✅ Uses SpatiaLite's optimized built-in functions

### Cons
- ❌ Requires one-time metadata initialization
- ❌ Adds ~1-2MB to database size

---

## How to Initialize Metadata (Optional)

If you want to use `GeodesicLength()` and other advanced functions:

### Option 1: Initialize During App Startup

Add to `src/lib/drizzle/InitDatabase.tsx`:

```typescript
import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import migrations from "@/drizzle/migrations";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { Button, Card, Surface, Text, useTheme } from "react-native-paper";
import { db } from "./client";
import { ensureSpatialMetadata } from "@/lib/op-sqlite/init-spatial-metadata";
import React from "react";

export function InitDatabase({ children }: InitDatabaseProps) {
  const { success, error } = useMigrations(db, migrations);
  const theme = useTheme();

  // Initialize spatial metadata after successful migrations
  React.useEffect(() => {
    if (success) {
      const result = ensureSpatialMetadata();
      if (result.success) {
        console.log("✅ Spatial metadata ready");
      } else {
        console.warn("⚠️ Could not initialize spatial metadata:", result.error);
      }
    }
  }, [success]);

  // ... rest of component
}
```

### Option 2: Initialize Manually

Run once in your app (e.g., in a settings screen):

```typescript
import { ensureSpatialMetadata } from "@/lib/op-sqlite/init-spatial-metadata";

function AdvancedSettings() {
  const handleInitSpatialMetadata = async () => {
    const result = ensureSpatialMetadata();
    if (result.success) {
      Alert.alert("Success", "Spatial metadata initialized!");
    } else {
      Alert.alert("Error", result.error || "Failed to initialize");
    }
  };

  return (
    <Button onPress={handleInitSpatialMetadata}>
      Initialize Spatial Metadata
    </Button>
  );
}
```

---

## Summary: What You Need

| Requirement | Status | Purpose | Action |
|-------------|--------|---------|--------|
| **Extension Loading** | ✅ Done | Enable all spatial functions | None - already configured |
| **Metadata Initialization** | ❌ Not done | Enable advanced functions (GeodesicLength, Transform) | Optional - only if you want simpler queries |

### Current Setup Works Great! ✅

Your current implementation:
- Has extension loaded ✅
- Uses Haversine formula ✅
- Works perfectly without metadata initialization ✅

### Optional Enhancement

If you want cleaner code:
1. Run `ensureSpatialMetadata()` once
2. Replace Haversine with `GeodesicLength(MakeLine(...))`
3. Enjoy simpler, more maintainable queries

**But there's no urgency to change** - your current approach is solid and production-ready! 🎯

---

## Troubleshooting

### Error: "unknown SRID: -1" or "no such table: spatial_ref_sys"

**Cause**: Trying to use `Transform()`, `GeodesicLength()`, or `ST_Distance()` with geodesic parameter without initializing metadata.

**Solution**: Either:
1. Initialize metadata with `ensureSpatialMetadata()`
2. Or stick with the Haversine formula (current approach)

### Error: "no such function: ST_X"

**Cause**: Spatialite extension not loaded.

**Solution**: Check that `db.loadExtension(path, entryPoint)` is executed in `client.ts`.

### Extension Loading Fails

**Cause**: Spatialite native libraries not properly installed.

**Solution**: 
1. Verify the `.so` files exist in `plugins/opsqlite-spatialite/spatialite-libs/jni/`
   - If missing, clone or download from [tigawanna/spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs)
2. Verify the config plugin is registered in `app.config.ts`:
   ```typescript
   plugins: [
     "./plugins/opsqlite-spatialite/with-spatialite",
   ]
   ```
3. Clean rebuild the app:
   ```bash
   # Clean old build artifacts
   npx expo prebuild --clean
   
   # Rebuild for Android (this will copy the .so files)
   npx expo run:android
   ```
4. Check that `.so` files were copied to `android/app/src/main/jniLibs/{arch}/libspatialite.so`

### Native Library Architecture Mismatch

**Cause**: Testing on a device/emulator with an architecture that doesn't have the corresponding `.so` file.

**Solution**: 
- Emulators typically use `x86` or `x86_64`
- Physical devices typically use `arm64-v8a` or `armeabi-v7a`
- Ensure the matching `.so` file exists in `plugins/opsqlite-spatialite/spatialite-libs/jni/{arch}/`

---

## References

- [SpatiaLite Documentation](https://www.gaia-gis.it/gaia-sins/)
- [op-sqlite Extension Loading](https://github.com/OP-Engineering/op-sqlite)
- [Spatialite Android Binaries](https://github.com/tigawanna/spatialite-for-android-nodejs)
- [Distance Calculation Options](./distance-calculation-options.md)
