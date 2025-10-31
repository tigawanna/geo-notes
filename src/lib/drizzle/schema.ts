import { sql } from "drizzle-orm/sql";
import * as t from "drizzle-orm/sqlite-core";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import { point } from "./drizzlespatialite-types";
import * as Crypto from "expo-crypto";

export const notes = table(
  "notes",
  {
    id: t.text().primaryKey().default(Crypto.randomUUID()),
    title: t.text("title").default("Untitled"),
    quickCopy: t.text("quick_copy"),// field that will be copied on long click
    content: t.text("content"),
    created: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    updated: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    location: point("location"), // ← this is correct for WKB geometry
    user_id: t.text("user_id"),
  },
  (table) => [
    t.index("idx_notes_id").on(table.id),
    t.index("idx_notes_created").on(table.created),
  ]
);

