# SpatiaLite Location & Distance Guide for GeoNotes

Complete guide covering SpatiaLite setup, location data handling, distance calculations, and troubleshooting.

---

## Table of Contents

1. [Native Library Setup](#native-library-setup)
2. [SpatiaLite Configuration](#spatialite-configuration)
3. [Location System Architecture](#location-system-architecture)
4. [Distance Calculation Methods](#distance-calculation-methods)
5. [Recent Bug Fix](#recent-bug-fix)
6. [Testing & Diagnostics](#testing--diagnostics)
7. [Data Migration](#data-migration)
8. [Troubleshooting](#troubleshooting)
9. [References](#references)

---

## Native Library Setup

### Source of Libraries

The SpatiaLite native libraries (`.so` files) come from:
**[tigawanna/spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs)**

Provides pre-built binaries for multiple Android architectures:
- `arm64-v8a` (64-bit ARM)
- `armeabi-v7a` (32-bit ARM)
- `x86` (32-bit Intel)
- `x86_64` (64-bit Intel)

### Expo Config Plugin

**Location**: `plugins/opsqlite-spatialite/with-spatialite.js`

```javascript
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

module.exports = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const pluginDir = module.filename ? path.dirname(module.filename) : process.cwd();
      const sourceBase = path.join(pluginDir, "spatialite-libs", "jni");
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const targetBase = path.join(platformProjectRoot, "app", "src", "main", "jniLibs");

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
              fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
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

---

## SpatiaLite Configuration

SpatiaLite requires two setup levels:

### Level 1: Extension Loading (Required) ✅

**Location**: `src/lib/op-sqlite/client.ts`

```typescript
import { ANDROID_DATABASE_PATH, IOS_LIBRARY_PATH, open } from "@op-engineering/op-sqlite";
import { Platform } from "react-native";

export const DATABASE_NAME = "notes.db";
export const DATABASE_LOCATION = Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;

const db = open({
  name: DATABASE_NAME,
  location: DATABASE_LOCATION,
});

// ⭐ Load SpatiaLite extension - REQUIRED for all spatial operations
db.loadExtension("libspatialite", "sqlite3_modspatialite_init");

export const opsqliteDb = db;
```

**Enables:**
- ✅ Geometry functions: `ST_X()`, `ST_Y()`, `ST_Distance()`
- ✅ Geometry creation: `GeomFromGeoJSON()`, `MakePoint()`, `MakeLine()`
- ✅ Math functions: `RADIANS()`, `SIN()`, `COS()`, `ASIN()`, `SQRT()`, `POWER()`
- ✅ Conversion functions: `AsGeoJSON()`, `AsText()`

**Status**: ✅ Already configured and working!

### Level 2: Metadata Initialization (Optional) ⚙️

**Location**: `src/lib/op-sqlite/init-spatial-metadata.ts`

```typescript
import { opsqliteDb } from "./client";

export function initializeSpatialMetadata() {
  try {
    opsqliteDb.execute("SELECT InitSpatialMetadata(1);");
    console.log("✅ Spatial metadata initialized successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Failed to initialize spatial metadata:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function isSpatialMetadataInitialized(): boolean {
  try {
    const result = opsqliteDb.executeSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='spatial_ref_sys';"
    );
    return result.rows && result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

export function ensureSpatialMetadata() {
  if (!isSpatialMetadataInitialized()) {
    console.log("Spatial metadata not found, initializing...");
    return initializeSpatialMetadata();
  }
  console.log("Spatial metadata already initialized");
  return { success: true, error: null };
}
```

**Enables:**
- ✅ `GeodesicLength()` - Accurate great-circle distances
- ✅ `Transform()` - Coordinate system conversions
- ✅ `ST_Distance()` with geodesic parameter
- ✅ Advanced spatial operations

**Status**: ❌ Not currently initialized (app works fine without it)

---

## Location System Architecture

### Custom Point Type

**Location**: `src/lib/drizzle/drizzlespatialite-types.ts`

```typescript
export const point = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`;
  },
});
```

**How it works:**
- Accepts GeoJSON strings as input
- Converts to SpatiaLite geometry blobs using `GeomFromGeoJSON()`
- Stores as binary blob in database

### GeoJSON Format

**Correct format:**
```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

⚠️ **Important**: GeoJSON uses `[longitude, latitude]` order (X, Y), **NOT** `[latitude, longitude]`!

### Helper Function

**Location**: `src/utils/note-utils.ts`

```typescript
export const createGeoJSONPoint = (latitude: number, longitude: number): string => {
  return JSON.stringify({
    type: "Point",
    coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] order
  });
};
```

**Always use this helper** when creating location data to ensure correct format.

---

## Distance Calculation Methods

### Current Implementation: ST_Distance with Ellipsoid ✅ (Recommended)

**Location**: `src/data-access-layer/notes-api.ts`

```typescript
export async function getNotes({ sortOption, location, tagId }: GetNotesProps) {
  const currLocationGeoJSON = location 
    ? `{"type":"Point","coordinates":[${location.lng},${location.lat}]}`
    : null;
  
  const query = db.select({
    ...notesColumn,
    latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
    longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
    // ST_Distance with ellipsoid flag (1) for accurate geodesic distance
    distance: currLocationGeoJSON
      ? sql`ST_Distance(
          ${notes.location}, 
          GeomFromGeoJSON(${currLocationGeoJSON}),
          1
        )`.as("distance_meters")
      : sql`0`.as("distance_meters"),
  }).from(notes);
  
  // ... rest of query
}
```

**Pros:**
- ✅ Accurate geodesic distance calculations
- ✅ Uses SpatiaLite's optimized built-in functions
- ✅ Simpler and more maintainable code
- ✅ Handles edge cases better than manual Haversine

**Cons:**
- None for current setup!

### Alternative: Manual Haversine Formula (Legacy)

```typescript
// Old implementation (verbose but works)
distance: sql`(
  6371000 * 2 * ASIN(
    SQRT(
      POWER(SIN((RADIANS(ST_Y(${notes.location})) - RADIANS(${location?.lat||0})) / 2), 2) +
      COS(RADIANS(${location?.lat||0})) *
      COS(RADIANS(ST_Y(${notes.location}))) *
      POWER(SIN((RADIANS(ST_X(${notes.location})) - RADIANS(${location?.lng||0})) / 2), 2)
    )
  )
)`.as("distance_meters")
```

**Pros:**
- ✅ Works without any initialization
- ✅ Fast execution
- ✅ Accurate (~0.5% error)

**Cons:**
- ❌ Verbose SQL code
- ❌ Not using SpatiaLite's built-in functions

### Future Option: GeodesicLength (Requires Metadata Init)

```typescript
// Requires running ensureSpatialMetadata() first
distance: sql`GeodesicLength(
  MakeLine(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON}))
)`.as("distance_meters")
```

**Pros:**
- ✅ Even cleaner code
- ✅ Slightly more accurate (uses WGS84 ellipsoid)

**Cons:**
- ❌ Requires metadata initialization (~1-2MB database size increase)

### Performance Comparison

| Method | Speed | Accuracy | Code Complexity | Requires Init |
|--------|-------|----------|-----------------|---------------|
| **ST_Distance (Current)** | Fast | 99.9% | Low | No |
| **Haversine (Legacy)** | Fast | 99.5% | High | No |
| **GeodesicLength** | Fast | 99.9% | Very Low | Yes |

---

## Recent Bug Fix

### Problem Summary

Distance calculation was not working because:

1. **Incorrect location insertion**: Notes were being created with SQL template literals instead of GeoJSON strings
2. **Custom type mismatch**: The `point` custom type expects GeoJSON strings, but code was passing SQL expressions
3. **Distance calculation upgraded**: Now using SpatiaLite's `ST_Distance` with ellipsoid support

### Changes Made

#### 1. Fixed Note Creation (`src/components/notes/Notes.tsx`)

**Before:**
```typescript
newNote.location = sql`ST_GeomFromText('POINT(${coords.longitude} ${coords.latitude})', 4326)`;
```

**After:**
```typescript
newNote.location = createGeoJSONPoint(coords.latitude, coords.longitude);
```

**Why:** The `point` custom type's `toDriver()` function automatically converts GeoJSON strings to `GeomFromGeoJSON()`. Passing an SQL template literal bypassed this conversion and caused invalid data.

#### 2. Improved Distance Calculation (`src/data-access-layer/notes-api.ts`)

**Before:** Manual Haversine formula (verbose)

**After:** SpatiaLite's `ST_Distance` with ellipsoid flag
```typescript
distance: currLocationGeoJSON
  ? sql`ST_Distance(
      ${notes.location}, 
      GeomFromGeoJSON(${currLocationGeoJSON}),
      1
    )`.as("distance_meters")
  : sql`0`.as("distance_meters")
```

**Why:**
- More reliable and efficient
- Better handles edge cases
- Simpler and more maintainable
- The `1` flag enables ellipsoid/geodesic calculation

#### 3. Added Diagnostic Tools

**Function**: `diagnoseLocationData()` in `src/data-access-layer/notes-api.ts`
- Counts total notes
- Counts notes with valid POINT geometries
- Samples location data to show format and validity

**Script**: `scripts/diagnose-locations.ts`
- Standalone diagnostic tool
- Checks database location data health

---

## Testing & Diagnostics

### Run Diagnostic Script

```bash
npx ts-node scripts/diagnose-locations.ts
```

**Output shows:**
- Total notes count
- Notes with valid location geometries
- Sample location data with format details

### Test Creating New Notes

1. Enable location in settings
2. Create a new note
3. Verify distance appears correctly
4. Try sorting by distance (closest/farthest)

### Test Distance Sorting

- **Sort by "Closest"** - nearest notes first
- **Sort by "Farthest"** - distant notes first
- Distance displayed in meters/kilometers

### Verify Individual Note

Open a note and check:
- Location coordinates display correctly
- Distance from current location is accurate
- Map view shows correct position (if applicable)

### Expected Diagnostic Output

After the fix, new notes should have:
- `GeometryType`: `'POINT'`
- `isValid`: `1` (true)
- `WKT`: `POINT(longitude latitude)`
- `GeoJSON`: `{"type":"Point","coordinates":[lng,lat]}`
- `latitude` and `longitude`: valid numbers

---

## Data Migration

### Check If Migration Needed

If diagnostic script shows **0 valid geometries** but you have existing notes, migration is needed.

### Option 1: Fresh Start (Simplest)

```typescript
import { deleteAllNotes } from "@/data-access-layer/notes-api";
await deleteAllNotes();
```

### Option 2: Manual Migration

If you have lat/lng stored separately:

```typescript
import { db } from "@/lib/drizzle/client";
import { notes } from "@/lib/drizzle/schema";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { sql } from "drizzle-orm";

async function migrateLocations() {
  // Adjust column names as needed
  await db.run(sql`
    UPDATE notes 
    SET location = GeomFromGeoJSON(
      '{"type":"Point","coordinates":[' || longitude_column || ',' || latitude_column || ']}'
    )
    WHERE latitude_column IS NOT NULL AND longitude_column IS NOT NULL
  `);
}
```

### Option 3: Incremental Update

Leave existing notes as-is. Location will be added when users edit them with location enabled.

---

## Troubleshooting

### Error: "no such function: ST_X"

**Cause**: SpatiaLite extension not loaded.

**Solution**: Verify `db.loadExtension(path, entryPoint)` is executed in `client.ts`.

### Error: "no such table: spatial_ref_sys"

**Cause**: Trying to use `Transform()` or `GeodesicLength()` without metadata initialization.

**Solution**: 
1. Initialize with `ensureSpatialMetadata()`
2. Or use `ST_Distance()` with ellipsoid flag (current approach)

### Extension Loading Fails

**Cause**: Native libraries not properly installed.

**Solution**: 
1. Verify `.so` files exist in `plugins/opsqlite-spatialite/spatialite-libs/jni/{arch}/`
2. Verify plugin registered in `app.config.ts`:
   ```typescript
   plugins: ["./plugins/opsqlite-spatialite/with-spatialite"]
   ```
3. Clean rebuild:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```
4. Check files copied to `android/app/src/main/jniLibs/{arch}/libspatialite.so`

### Native Library Architecture Mismatch

**Cause**: Device architecture doesn't have corresponding `.so` file.

**Solution**: 
- Emulators: `x86` or `x86_64`
- Physical devices: `arm64-v8a` or `armeabi-v7a`
- Ensure matching `.so` file exists

### Distance Shows as 0 or NULL

**Cause**: Invalid or missing location geometry data.

**Solution**:
1. Run diagnostic script
2. Check if notes have valid POINT geometries
3. Migrate data if needed
4. Ensure new notes use `createGeoJSONPoint()` helper

### Distance Values Seem Wrong

**Cause**: Possible coordinate order confusion (lat/lng vs lng/lat).

**Solution**:
1. Verify GeoJSON uses `[longitude, latitude]` order
2. Check `createGeoJSONPoint()` is used consistently
3. Run diagnostics to see sample data

---

## Key Takeaways

1. ✅ **Always use `createGeoJSONPoint()` helper** when setting location data
2. ✅ **GeoJSON order is `[longitude, latitude]`** not `[latitude, longitude]`
3. ✅ **Custom types handle SQL conversion** - don't use `sql` templates directly
4. ✅ **Use `ST_Distance` with ellipsoid flag (`1`)** for accurate distances
5. ✅ **Run diagnostics** when troubleshooting location issues
6. ✅ **Extension loading is required** - metadata initialization is optional

---

## Related Files

| File | Purpose |
|------|---------|
| `src/data-access-layer/notes-api.ts` | Database operations & queries |
| `src/components/notes/Notes.tsx` | Note creation UI |
| `src/components/notes/details/use-note-actions.ts` | Note updates |
| `src/lib/drizzle/drizzlespatialite-types.ts` | Custom spatial types |
| `src/lib/op-sqlite/client.ts` | Database & extension loading |
| `src/lib/op-sqlite/init-spatial-metadata.ts` | Metadata initialization |
| `src/utils/note-utils.ts` | Location utilities |
| `scripts/diagnose-locations.ts` | Diagnostic tool |
| `plugins/opsqlite-spatialite/with-spatialite.js` | Native library plugin |

---

## References

- [SpatiaLite Documentation](https://www.gaia-gis.it/gaia-sins/)
- [SpatiaLite SQL Functions](https://www.gaia-gis.it/gaia-sins/spatialite-sql-latest.html)
- [GeoJSON Specification](https://datatracker.ietf.org/doc/html/rfc7946)
- [op-sqlite Extension Loading](https://github.com/OP-Engineering/op-sqlite)
- [SpatiaLite Android Binaries](https://github.com/tigawanna/spatialite-for-android-nodejs)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
