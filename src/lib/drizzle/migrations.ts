import { OnInitMethods } from "../expo-spatialite/ExpoSpatialiteProvider";

const system = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);`,
];

const notes = [
  `
CREATE TABLE IF NOT EXISTS notes (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	title text,
	content text,
	quick_copy text,
	type text, 
	status text DEFAULT 'active',
	tags text,
	metadata text,
	image_path text,
	image_blob blob,
	priority integer DEFAULT 0,
	reminder_at text,
	completed_at text,
	due_date text,
	last_viewed text DEFAULT (CURRENT_TIMESTAMP),
	created_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	updated_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,

	latitude integer,
	longitude integer
);`,

  `CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);`,

  `SELECT AddGeometryColumn('notes', 'location_point', 4326, 'POINT', 'XY');`,

  `SELECT CreateSpatialIndex('notes', 'location_point');`,
];

const notesHistory = [
  `
CREATE TABLE IF NOT EXISTS notes_history (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	note_id integer NOT NULL,
	title text,
	content text,
	quick_copy text,
	type text,
	status text,
	tags text,
	metadata text,
	image_path text,
	priority integer,
	reminder_at text,
	completed_at text,
	due_date text,
	latitude integer,
	longitude integer,
	change_type text NOT NULL,
	changed_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
);`,

  `CREATE INDEX IF NOT EXISTS idx_notes_history_note_id ON notes_history(note_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notes_history_changed_at ON notes_history(changed_at);`,
];

const triggers = [
  `CREATE TRIGGER IF NOT EXISTS notes_insert_history
   AFTER INSERT ON notes
   BEGIN
     INSERT INTO notes_history (note_id, title, content, quick_copy, type, status, tags, metadata, image_path, priority, reminder_at, completed_at, due_date, latitude, longitude, change_type)
     VALUES (NEW.id, NEW.title, NEW.content, NEW.quick_copy, NEW.type, NEW.status, NEW.tags, NEW.metadata, NEW.image_path, NEW.priority, NEW.reminder_at, NEW.completed_at, NEW.due_date, NEW.latitude, NEW.longitude, 'INSERT');
   END;`,

  `CREATE TRIGGER IF NOT EXISTS notes_update_history
   AFTER UPDATE ON notes
   WHEN 
       OLD.title IS NOT NEW.title OR
       OLD.content IS NOT NEW.content OR
       OLD.quick_copy IS NOT NEW.quick_copy OR
       OLD.type IS NOT NEW.type OR
       OLD.status IS NOT NEW.status OR
       OLD.tags IS NOT NEW.tags OR
       OLD.metadata IS NOT NEW.metadata OR
       OLD.image_path IS NOT NEW.image_path OR
       OLD.priority IS NOT NEW.priority OR
       OLD.reminder_at IS NOT NEW.reminder_at OR
       OLD.completed_at IS NOT NEW.completed_at OR
       OLD.due_date IS NOT NEW.due_date OR
       OLD.latitude IS NOT NEW.latitude OR
       OLD.longitude IS NOT NEW.longitude
   BEGIN
     INSERT INTO notes_history (note_id, title, content, quick_copy, type, status, tags, metadata, image_path, priority, reminder_at, completed_at, due_date, latitude, longitude, change_type)
     VALUES (NEW.id, NEW.title, NEW.content, NEW.quick_copy, NEW.type, NEW.status, NEW.tags, NEW.metadata, NEW.image_path, NEW.priority, NEW.reminder_at, NEW.completed_at, NEW.due_date, NEW.latitude, NEW.longitude, 'UPDATE');
   END;`,

  `CREATE TRIGGER IF NOT EXISTS notes_delete_history
   BEFORE DELETE ON notes
   BEGIN
     INSERT INTO notes_history (note_id, title, content, quick_copy, type, status, tags, metadata, image_path, priority, reminder_at, completed_at, due_date, latitude, longitude, change_type)
     VALUES (OLD.id, OLD.title, OLD.content, OLD.quick_copy, OLD.type, OLD.status, OLD.tags, OLD.metadata, OLD.image_path, OLD.priority, OLD.reminder_at, OLD.completed_at, OLD.due_date, OLD.latitude, OLD.longitude, 'DELETE');
   END;`,
];

export const migrations = {
  operations: [...notes, ...notesHistory, ...triggers],
  version: 1,
};

export async function checkVersion(db: OnInitMethods) {
  try {
    await db
      .executeQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
      )
      .catch((e) => {
        console.log(" mgrations table not foun createing one ");
        db.executeStatement(system[0]);
      });
    const currentVersion = await db.executeQuery(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1"
    );
    return (currentVersion.data[0]?.version as number) || 0;
  } catch (e: any) {
    console.log(" error getting migration version  == ", e.message);
    if (e.message.includes("no such table: schema_migrations")) {
      console.log(" mgrations table not foun createing one ");
      db.executeTransaction([
        {
          sql: `CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL);`,
        },
        {
          sql: `INSERT INTO schema_migrations (version) VALUES (1);`,
        },
      ]);
    }
    const currentVersion = await db.executeQuery(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1"
    );
    return (currentVersion.data[0]?.version as number) || 0;
  }
}
export async function runMigrations(db: OnInitMethods) {
  const currentVersion = await checkVersion(db);
  console.log("currentVersion", currentVersion);
  if (currentVersion >= migrations.version) return;
  const migrationPromises = migrations.operations.map((operation) => {
    return db.executeRawQuery(operation);
  });
  await Promise.all(migrationPromises);

  try {
  } catch (e) {
    console.log("error running migrations", e);
  }
}
