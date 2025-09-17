import { sqliteTable, integer, text, blob } from "drizzle-orm/sqlite-core";
import { InferSelectModel, InferInsertModel, sql } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  content: text("content"),
  quickCopy: text("quick_copy"),
  type: text("type").default("note"),
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
  latitude:integer("latitude"),
  longitude:integer("longitude"),
  // Spatial column (will be populated by Spatialite)
  locationPoint: text("location_point"), // Added by AddGeometryColumn
});

// Infer the select type for the users table
export type GeoNoteSelect = InferSelectModel<typeof notes>;
export type GeoNoteInsert = InferInsertModel<typeof notes>;

export const insertNoteSchema = createInsertSchema(notes);
export type InsertNoteSchemaType = typeof insertNoteSchema;

export const updateNoteSchema = createUpdateSchema(notes);
export type UpdateNoteSchemaType = typeof updateNoteSchema;
