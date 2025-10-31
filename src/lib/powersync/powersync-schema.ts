import { column, Schema, Table } from "@powersync/react-native";

// export const notes = table(
//   "notes",
//   {
//     id: t.text().primaryKey().default(Crypto.randomUUID()),
//     title: t.text("title").default("Untitled"),
//     quickCopy: t.text("quick_copy"),// field that will be copied on long click
//     content: t.text("content"),
//     created: t.text().default(sql`(CURRENT_TIMESTAMP)`),
//     updated: t.text().default(sql`(CURRENT_TIMESTAMP)`),
//     location: point("location"), // ← this is correct for WKB geometry
//     user_id: t.text("user_id"),
//   },
//   (table) => [
//     t.index("idx_notes_id").on(table.id),
//     t.index("idx_notes_created").on(table.created),
//   ]
// );

// const notes = new Table(
//   {
//     id: column.text,
//     title: column.text,
//     quick_copy: column.text,
//     content: column.text,
//     created: column.text,
//     updated: column.text,
//     location: column.text,
//     user_id: column.text,
//   },
//   { indexes: { id: ["id"], created: ["created"] } }
// );



// export const AppSchema = new Schema({
//   notes,
// });

// // For types
// export type Database = (typeof AppSchema)["types"];
// export type NoteRecord = Database["notes"];

