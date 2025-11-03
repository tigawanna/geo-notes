# SQLite Database Backup System - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Implementation](#implementation)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [User Interface](#user-interface)
8. [Troubleshooting](#troubleshooting)
9. [Testing](#testing)
10. [Security & Performance](#security--performance)
11. [Future Enhancements](#future-enhancements)

---

## Overview

The GeoNotes app includes a comprehensive SQLite database backup system that allows users to:
- Create local backups of their notes database
- Share backups via any sharing method (email, cloud storage, etc.)
- Import backups to restore data
- View backup history and database information

### Key Features

✅ **Local Backups**: Create timestamped database backups
✅ **Native Sharing**: Share backups via system share dialog
✅ **Database Info**: Display current database size and metadata
✅ **Backup Management**: List, delete, and manage backup files
✅ **Import/Restore**: Restore database from backup files
✅ **Error Handling**: Comprehensive error handling and validation
✅ **Safety Features**: Emergency backups before restore operations
✅ **Cross-Platform**: Works on both iOS and Android

### What's Backed Up?

✅ All notes (titles, content, timestamps)
✅ Location data (coordinates)
✅ QuickCopy fields
✅ User associations

❌ Not included:
- App settings (theme, preferences)
- Temporary data
- Cache

### Dependencies

- `expo-file-system` - File operations and path management
- `expo-sharing` - Native share functionality
- `@op-engineering/op-sqlite` - SQLite database engine
- `react-native-paper` - UI components
- `zustand` - State management

---

## Quick Start

### For Users

#### Creating a Backup

1. Open the app → Go to **Settings** tab (gear icon)
2. Scroll to **Backup & Data** section
3. Tap **"Backup Database"** button
4. A success alert will appear with options:
   - **OK**: Backup saved locally
   - **Share**: Open share dialog to save backup elsewhere

#### Sharing a Backup

1. Go to Settings → Backup & Data
2. Tap **"Backup & Share"** button
3. Choose where to save:
   - Email
   - Cloud storage (Google Drive, iCloud, Dropbox)
   - Messaging apps
   - File manager

#### Backup File Format

- File name: `geo-notes-backup-YYYY-MM-DD-HH-mm-ss.db`
- Type: SQLite database file
- Extension: `.db`

### For Developers

#### Quick Implementation

```typescript
import {
  exportDatabase,
  shareDatabase,
  getDatabaseInfo,
  formatFileSize,
} from "@/lib/drizzle/backup";

// Create backup
const result = await exportDatabase();
if (result.success) {
  console.log("Backup created:", result.path);
}

// Share backup
await shareDatabase();

// Get database info
const info = await getDatabaseInfo();
console.log(`Size: ${formatFileSize(info.size)}`);
```

#### Add Backup Button to Your UI

```tsx
import { Button } from "react-native-paper";
import { shareDatabase } from "@/lib/drizzle/backup";

function MyComponent() {
  const handleBackup = async () => {
    const result = await shareDatabase();
    if (result.success) {
      Alert.alert("Success", "Backup created!");
    }
  };

  return (
    <Button onPress={handleBackup} icon="backup-restore">
      Backup Now
    </Button>
  );
}
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GeoNotes App                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐      ┌──────────────────┐              │
│  │  Settings Screen  │─────▶│  Backup Hooks    │              │
│  │                   │      │  (use-backup.ts) │              │
│  └───────────────────┘      └────────┬─────────┘              │
│           │                           │                         │
│           │                           ▼                         │
│           │                  ┌──────────────────┐              │
│           │                  │  Backup Module   │              │
│           │                  │  (backup.ts)     │              │
│           │                  └────────┬─────────┘              │
│                                       │                         │
│                    ┌──────────────────┼──────────────────┐     │
│                    ▼                  ▼                  ▼     │
│           ┌────────────────┐ ┌──────────────┐ ┌──────────────┐│
│           │ expo-file-     │ │ expo-sharing │ │ Settings     ││
│           │ system         │ │              │ │ Store        ││
│           └────────┬───────┘ └──────┬───────┘ └──────────────┘│
│                    │                │                          │
└────────────────────┼────────────────┼──────────────────────────┘
                     ▼                ▼
            ┌────────────────┐ ┌──────────────┐
            │ File System    │ │ Native Share │
            │                │ │ Dialog       │
            └────────────────┘ └──────────────┘
```

### Data Flow

#### 1. Backup Creation Flow

```
User Taps "Backup Database"
         │
         ▼
┌─────────────────────────┐
│ Settings Component      │
│ handleBackup()          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ exportDatabase()        │
│ - Get DB file path      │
│ - Create backup dir     │
│ - Generate filename     │
│ - Copy file             │
│ - Update store          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Success Alert           │
│ [OK] [Share]            │
└─────────────────────────┘
```

#### 2. Share Flow

```
User Taps "Backup & Share"
         │
         ▼
┌─────────────────────────┐
│ shareDatabase()         │
│ - Export DB (if needed) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ expo-sharing            │
│ - Open native dialog    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Native Share Sheet      │
│ - Email                 │
│ - Cloud Storage         │
│ - Messaging Apps        │
│ - File Manager          │
└─────────────────────────┘
```

### Database Location

The SQLite database is stored at the location specified by op-sqlite's official constants:
- **iOS**: `IOS_LIBRARY_PATH` (Library/LocalDatabase/)
- **Android**: `ANDROID_DATABASE_PATH` (/data/data/<package>/databases/)

#### File System Structure

```
App File System
│
├── SQLite/
│   └── notes                      ← Original database
│
├── backups/
│   ├── geo-notes-backup-2024-01-15-10-30-00.db
│   ├── geo-notes-backup-2024-01-16-14-22-15.db
│   └── geo-notes-backup-2024-01-17-09-45-30.db
│
└── ... other app files
```

### Component Hierarchy

```
App
 └── Settings Screen
      └── Backup & Data Section
           ├── Database Size Display
           │    └── getDatabaseInfo()
           │
           ├── Last Backup Display
           │    └── useSettingsStore.lastBackup
           │
           ├── Backup Button
           │    └── handleBackup()
           │         └── exportDatabase()
           │
           └── Backup & Share Button
                └── handleShareBackup()
                     └── shareDatabase()
```

### State Management

```
┌──────────────────────────────────────────┐
│         Settings Store (Zustand)         │
├──────────────────────────────────────────┤
│                                          │
│  State:                                  │
│  • lastBackup: Date | null               │
│  • localBackupPath: string | null        │
│                                          │
│  Actions:                                │
│  • setLastBackup(date)                   │
│  • setLocalBackupPath(path)              │
│                                          │
└──────────────────────────────────────────┘
          ▲                    │
          │                    │
          │  Update            │  Read
          │                    │
┌─────────┴────────────────────▼───────────┐
│         Backup Module                    │
│  exportDatabase()                        │
│  • Creates backup                        │
│  • Updates store with new backup info    │
└──────────────────────────────────────────┘
```

---

## Implementation

### Core Files

1. **`src/lib/drizzle/backup.ts`** - Main backup utility module
2. **`src/app/(container)/(tabs)/settings.tsx`** - Settings UI with backup controls
3. **`src/store/settings-store.ts`** - Persistent storage for backup metadata
4. **`src/hooks/use-backup.ts`** - React hooks for backup operations

### Backup Module (`backup.ts`)

The backup module provides the following functions:

```typescript
// Export database to a backup file
exportDatabase(): Promise<BackupResult>

// Share database via native share dialog
shareDatabase(backupPath?: string): Promise<BackupResult>

// Import/restore database from backup
importDatabase(backupPath: string): Promise<BackupResult>

// List all available backups
listBackups(): Promise<BackupInfo[]>

// Delete a specific backup
deleteBackup(backupPath: string): Promise<BackupResult>

// Get current database information
getDatabaseInfo(): Promise<BackupInfo | null>

// Format file size for display
formatFileSize(bytes: number): string
```

### Database Location Update (November 2025)

The backup system now uses the **official `@op-engineering/op-sqlite` location constants** instead of manually constructed paths.

#### Before
```typescript
// Manual path construction
const dbPath = Platform.OS === "ios" 
  ? `${Paths.document}/SQLite/notes`
  : `${Paths.document}/SQLite/notes`;
```

#### After
```typescript
// Using official op-sqlite constants
import { IOS_LIBRARY_PATH, ANDROID_DATABASE_PATH } from "@op-engineering/op-sqlite";

const location = Platform.OS === "ios" ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;
const dbPath = `${location}/notes`;
```

#### Why This Matters

1. **Accuracy**: Op-sqlite knows exactly where it stores databases
2. **Reliability**: No guessing about the correct path
3. **Consistency**: Database client and backup system use the same location logic
4. **Future-proof**: If op-sqlite changes locations, we automatically get the update

### Hook Architecture

```
┌────────────────────────────────────────────┐
│           useBackup() Hook                 │
├────────────────────────────────────────────┤
│                                            │
│  State:                                    │
│  • isLoading                               │
│  • error                                   │
│  • dbInfo                                  │
│  • backups[]                               │
│                                            │
│  Functions:                                │
│  • backup()                                │
│  • share()                                 │
│  • backupAndShare()                        │
│  • deleteBackup()                          │
│  • refresh()                               │
│                                            │
│  Effects:                                  │
│  • Load DB info on mount                   │
│  • Load backups list on mount              │
│                                            │
└────────────────────────────────────────────┘
         │
         │ Uses
         ▼
┌────────────────────────────────────────────┐
│         Backup Module Functions            │
│  • exportDatabase()                        │
│  • shareDatabase()                         │
│  • getDatabaseInfo()                       │
│  • listBackups()                           │
│  • deleteBackup()                          │
└────────────────────────────────────────────┘
```

---

## API Reference

### Core Functions

#### exportDatabase()
Creates a local backup of the database.

**Returns**: `Promise<BackupResult>`
```typescript
interface BackupResult {
  success: boolean;
  path?: string;
  error?: string;
}
```

#### shareDatabase(backupPath?)
Creates backup and opens share dialog.

**Parameters**:
- `backupPath` (optional): Path to existing backup to share

**Returns**: `Promise<BackupResult>`

#### getDatabaseInfo()
Gets information about the current database.

**Returns**: `Promise<BackupInfo | null>`
```typescript
interface BackupInfo {
  fileName: string;
  size: number;
  date: Date;
  path: string;
}
```

#### listBackups()
Lists all available backup files.

**Returns**: `Promise<BackupInfo[]>`

#### deleteBackup(backupPath)
Deletes a specific backup file.

**Parameters**:
- `backupPath`: Full path to backup file

**Returns**: `Promise<BackupResult>`

#### importDatabase(backupPath)
Restores database from a backup file.

**Parameters**:
- `backupPath`: Full path to backup file

**Returns**: `Promise<BackupResult>`

#### formatFileSize(bytes)
Formats file size in human-readable format.

**Parameters**:
- `bytes`: File size in bytes

**Returns**: `string` (e.g., "1.2 MB")

### React Hooks

#### useBackup()
Full-featured hook with all backup functionality.

```typescript
const {
  isLoading,
  error,
  dbInfo,
  databaseSize,
  backups,
  backup,
  share,
  backupAndShare,
  deleteBackup,
  refresh,
  formatFileSize,
} = useBackup();
```

#### useSimpleBackup()
Simplified hook for basic backup operations.

```typescript
const {
  isLoading,
  backup,
  backupAndShare,
} = useSimpleBackup();
```

---

## Usage Examples

### Programmatic Backup

```typescript
import { exportDatabase, shareDatabase } from "@/lib/drizzle/backup";

// Create a backup
const result = await exportDatabase();
console.log(result.path); // file:///path/to/backup.db

// Create and share backup
await shareDatabase();

// Share existing backup
await shareDatabase("/path/to/backup.db");
```

### List and Manage Backups

```typescript
import { listBackups, deleteBackup } from "@/lib/drizzle/backup";

// Get all backups
const backups = await listBackups();
backups.forEach(backup => {
  console.log(backup.fileName, backup.size, backup.date);
});

// Delete old backup
await deleteBackup(backups[0].path);
```

### Check Database Info

```typescript
import { getDatabaseInfo, formatFileSize } from "@/lib/drizzle/backup";

const info = await getDatabaseInfo();
if (info) {
  console.log(`Database: ${formatFileSize(info.size)}`);
  console.log(`Modified: ${info.date.toLocaleString()}`);
}
```

### React Component Examples

#### Simple Backup Buttons

```tsx
import { useSimpleBackup } from "@/hooks/use-backup";
import { Button } from "react-native-paper";

export function SimpleBackupExample() {
  const { isLoading, backup, backupAndShare } = useSimpleBackup();

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={backup}
        disabled={isLoading}
        loading={isLoading}
        icon="backup-restore">
        Backup Database
      </Button>

      <Button
        mode="outlined"
        onPress={backupAndShare}
        disabled={isLoading}
        loading={isLoading}
        icon="share-variant"
        style={styles.button}>
        Backup & Share
      </Button>
    </View>
  );
}
```

#### Backup with Database Info

```tsx
import { useBackup } from "@/hooks/use-backup";
import { Card, Text } from "react-native-paper";

export function BackupWithInfoExample() {
  const { isLoading, dbInfo, databaseSize, backup, backupAndShare, error } = useBackup();

  return (
    <Card>
      <Card.Title title="Database Information" />
      <Card.Content>
        {dbInfo ? (
          <>
            <Text variant="bodyMedium">Size: {databaseSize}</Text>
            <Text variant="bodySmall">Path: {dbInfo.path}</Text>
            <Text variant="bodySmall">
              Last Modified: {dbInfo.date.toLocaleString()}
            </Text>
          </>
        ) : (
          <Text>Loading database info...</Text>
        )}

        {error && <Text style={styles.error}>Error: {error}</Text>}
      </Card.Content>

      <Card.Actions>
        <Button onPress={() => backup()} disabled={isLoading} loading={isLoading}>
          Backup
        </Button>
        <Button onPress={() => backupAndShare()} disabled={isLoading} loading={isLoading}>
          Share
        </Button>
      </Card.Actions>
    </Card>
  );
}
```

#### Settings Screen Integration

```tsx
import { useBackup } from "@/hooks/use-backup";
import { List } from "react-native-paper";

export function SettingsBackupSection() {
  const { isLoading, databaseSize, backup, backupAndShare } = useBackup();

  return (
    <List.Section>
      <List.Subheader>Backup & Data</List.Subheader>

      {databaseSize && (
        <List.Item
          title="Database Size"
          description={databaseSize}
          left={(props) => <List.Icon {...props} icon="database" />}
        />
      )}

      <List.Item
        title="Create Backup"
        description="Save a copy of your database"
        left={(props) => <List.Icon {...props} icon="backup-restore" />}
        onPress={() => backup()}
        disabled={isLoading}
      />

      <List.Item
        title="Backup & Share"
        description="Create and share backup file"
        left={(props) => <List.Icon {...props} icon="share-variant" />}
        onPress={() => backupAndShare()}
        disabled={isLoading}
      />
    </List.Section>
  );
}
```

---

## User Interface

### Settings Screen

The backup section in settings includes:

1. **Database Size** - Shows current database file size
2. **Last Backup** - Timestamp of most recent backup
3. **Backup Database** button - Creates a local backup
4. **Backup & Share** button - Creates backup and opens share dialog
5. **Information** - Explains what's included in backups

### User Flow

```
┌─────────────────┐
│  Tap "Backup"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Backup  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Show Success   │────▶│ Tap "Share"  │
│     Alert       │     └──────┬───────┘
└─────────────────┘            │
                               ▼
                    ┌─────────────────┐
                    │  Native Share   │
                    │     Dialog      │
                    └─────────────────┘
```

---

## Troubleshooting

### Common Issues

**Backup fails with "Database file not found"**
- **Cause**: Database hasn't been initialized yet
- **Solution**: Create at least one note first

**Share fails with "Sharing is not available"**
- **Cause**: Device/emulator doesn't support sharing
- **Solution**: Test on physical device

**Large backup file size**
- **Cause**: Database contains many notes/locations, SpatiaLite extension adds overhead
- **Solution**: Normal behavior, consider compression in future

**Can't find backup files**
- **Location**: `{Document Directory}/backups/`
- **Solution**: Check file system permissions

### Debug Tips

1. **Check database path**:
```typescript
import { getDatabaseInfo } from "@/lib/drizzle/backup";
const info = await getDatabaseInfo();
console.log(info?.path);
```

2. **Verify backups directory**:
```typescript
import { listBackups } from "@/lib/drizzle/backup";
const backups = await listBackups();
console.log(backups.length, "backups found");
```

3. **Check file permissions**:
```typescript
import { Paths } from "expo-file-system";
console.log(Paths.document.uri);
```

### Error Handling

All backup operations include comprehensive error handling:

```typescript
try {
  const result = await exportDatabase();
  if (result.success) {
    // Handle success
  } else {
    // Display error message
    Alert.alert("Backup Failed", result.error);
  }
} catch (error) {
  // Handle exceptions
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Create backup successfully
- [ ] Backup file appears in backups directory
- [ ] Share dialog opens and allows sharing
- [ ] Database size displays correctly
- [ ] Last backup timestamp updates
- [ ] Error handling shows appropriate messages
- [ ] Loading indicators work properly
- [ ] Backup survives app restart

### Test Scenarios

1. **First Backup**: No previous backups exist
2. **Subsequent Backups**: Multiple backups in directory
3. **Large Database**: Database with many notes
4. **Empty Database**: Fresh database with no data
5. **Share Cancellation**: User cancels share dialog
6. **Permission Denied**: No file system access

### Automated Testing

```typescript
// Example test for backup functionality
describe("Database Backup", () => {
  it("should create backup successfully", async () => {
    const result = await exportDatabase();
    expect(result.success).toBe(true);
    expect(result.path).toBeDefined();
  });

  it("should list backups", async () => {
    const backups = await listBackups();
    expect(Array.isArray(backups)).toBe(true);
  });

  it("should get database info", async () => {
    const info = await getDatabaseInfo();
    expect(info).toBeDefined();
    expect(info?.size).toBeGreaterThan(0);
  });
});
```

---

## Security & Performance

### Security Considerations

1. **Local Storage**: Backups stored locally, not encrypted
2. **Sharing**: User controls where backup is shared
3. **Access**: Requires file system permissions
4. **Data**: Includes all notes and location data

### Security Layers

```
┌─────────────────────────────────────────┐
│          Security Layers                │
├─────────────────────────────────────────┤
│                                         │
│  1. File System                         │
│     • App sandbox isolation             │
│     • No global access                  │
│                                         │
│  2. Share Permissions                   │
│     • User controls destinations        │
│     • No automatic uploads              │
│                                         │
│  3. Data Validation                     │
│     • File existence checks             │
│     • Path validation                   │
│                                         │
│  4. Emergency Backups                   │
│     • Before restore operations         │
│     • Prevents data loss                │
│                                         │
└──────────────────────────────────────────┘
```

### Performance

- **Backup time**: Depends on database size (typical 1MB database: < 1 second)
- **Larger databases**: May take several seconds
- **Operations**: Non-blocking with loading indicators

#### Performance Characteristics

```
Operation          Time Complexity    Space
─────────────────  ─────────────────  ──────────────
Export DB          O(n)               2x DB size
Share              O(1)               0 (reference)
List Backups       O(k)               k backup info
Delete Backup      O(1)               0
Get DB Info        O(1)               Small

n = database size
k = number of backups
```

---

## Future Enhancements

Potential improvements for the backup system:

### Phase 1: User Experience
- [ ] Backup management screen (view all backups, delete, restore)
- [ ] Backup verification (check integrity before restore)
- [ ] Progress indicators for large backups

### Phase 2: Automation
- [ ] Automatic scheduled backups (daily/weekly)
- [ ] Background backup tasks
- [ ] Low storage warnings

### Phase 3: Advanced Features
- [ ] Cloud storage integration (Google Drive, iCloud)
- [ ] Backup compression (ZIP files)
- [ ] Backup encryption
- [ ] Differential backups (only changes since last backup)

### Phase 4: Enterprise Features
- [ ] Multi-device sync
- [ ] Backup versioning
- [ ] Conflict resolution
- [ ] Backup analytics

### Implementation Priority

1. **High Priority**: Backup management UI, progress indicators
2. **Medium Priority**: Automatic backups, cloud integration
3. **Low Priority**: Compression, encryption, advanced sync

---

## References

- [expo-file-system docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [expo-sharing docs](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [@op-engineering/op-sqlite](https://github.com/OP-Engineering/op-sqlite)
- [SQLite file format](https://www.sqlite.org/fileformat.html)
- [Op-sqlite Configuration](https://op-engineering.github.io/op-sqlite/docs/configuration/)

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Status**: Production Ready</content>
<parameter name="filePath">/home/dennis/Desktop/code/react-native/geo-notes/docs/database-backup-complete.md
