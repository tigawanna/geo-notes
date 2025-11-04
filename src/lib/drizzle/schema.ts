import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import * as t from "drizzle-orm/sqlite-core";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { point } from "./drizzlespatialite-types";

export const notes = table(
  "notes",
  {
    id: t.text().primaryKey().notNull(),
    title: t.text("title").default("Untitled"),
    quickCopy: t.text("quick_copy"), // field that will be copied on long click
    quickCopyMode: t.text("quick_copy_mode", { enum: ["title", "phone", "manual"] }), // note-specific quick copy mode, null means use global setting
    tags: t.text("tags"), // JSON array of tag IDs stored as text
    content: t.text("content"),
    created: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    updated: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    location: point("location"), // ← this is correct for WKB geometry
    user_id: t.text("user_id"),
  },
  (table) => [t.index("idx_notes_id").on(table.id), t.index("idx_notes_created").on(table.created)]
);

export const tags = table(
  "tags",
  {
    id: t.text().primaryKey().notNull(),
    name: t.text("name").notNull(),
    color: t.text("color"), // Hex color code for tag
    created: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    user_id: t.text("user_id"),
  },
  (table) => [t.index("idx_tags_name").on(table.name)]
);

export type TNote = InferSelectModel<typeof notes>;
export type TInsertNote = InferInsertModel<typeof notes>;
export const InsertNoteZodSchema = createInsertSchema(notes);

export type TTag = InferSelectModel<typeof tags>;
export type TInsertTag = InferInsertModel<typeof tags>;
export const InsertTagZodSchema = createInsertSchema(tags);
