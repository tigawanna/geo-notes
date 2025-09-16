import { sqliteTable, integer, text, blob } from "drizzle-orm/sqlite-core";
import { InferSelectModel, InferInsertModel, sql } from "drizzle-orm";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  content: text("content").notNull(),
  quickCopy: text("quick_copy"),
  type: text("type").default("note").notNull(),
  status: text("status").default("active"),
  tags: text("tags"),
  meta: text("metadata", { mode: "json" }),
  imagePath: text("image_path"),
  imageBlob: blob("image_blob"), // BLOB for storing images directly
  priority: integer("priority").default(0),
  reminderAt: text("reminder_at"),
  completedAt: text("completed_at"),
  dueDate: text("due_date"),
  lastViewed: text("last_viewed").default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  // Spatial column (will be populated by Spatialite)
  locationPoint: text("location_point"), // Added by AddGeometryColumn
});

// Infer the select type for the users table
export type GeoNoteSelect = InferSelectModel<typeof notes>;
export type GeoNoteInsert = InferInsertModel<typeof notes>;
