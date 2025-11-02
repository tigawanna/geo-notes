import { db } from "@/lib/drizzle/client";
import { notes, TInsertNote, TNote } from "@/lib/drizzle/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";

export async function getNotes(sortByDistance = true) {
  try {
    const notesColumn = getTableColumns(notes);
    // Reference point: Nairobi, Kenya coordinates
    // SpatiaLite uses [longitude, latitude] order in GeoJSON (X, Y)
    const nairobiGeoJSON = '{"type":"Point","coordinates":[36.8219,-1.2921]}';
    const query = db
      .select({
        ...notesColumn,
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // Calculate great-circle distance using SpatiaLite's geodesic functions
        // ST_Distance returns distance in meters by default, converted to kilometers
        distance: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${nairobiGeoJSON}))`.as(
          "distance_km"
        ),
      })
      .from(notes);
    if (sortByDistance) {
      // Sort by distance ascending (closest to Nairobi first)
      // .orderBy(sql`distance_km ASC`);
      query.orderBy(sql`distance_km ASC`);
    }
    // Execute spatial query to fetch notes with distance calculations
    const res = await query;

    // Uncomment for debugging spatial query results:
    // console.log("Fetched notes:", res);

    return {
      result: res,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function createNote(newNote: TInsertNote) {
  try {
    const noteWithId = {
      ...newNote,
      id: newNote.id || Crypto.randomUUID(),
    };
    const res = await db.insert(notes).values(noteWithId);
    console.log("Created note:", res);
    return {
      result: noteWithId.id, // Return the ID of the created note
      error: null,
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function deleteAllNotes() {
  try {
    const res = await db.delete(notes);
    console.log("Deleted all notes:", res);
    return {
      result: res,
      error: null,
    };
  } catch (error) {
    console.error("Error deleting all notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function deleteNote(id: number) {
  try {
    const res = await db.delete(notes).where(sql`id = ${id}`);
    console.log("Deleted note with id:", id);
    return { result: res, error: null };
  } catch (error) {
    console.error("Error deleting note with id:", id, error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function getNote(id: string) {
  try {
    const res = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    console.log("Fetched note with id:", id);
    return {
      result: res[0] || null,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching note with id:", id, error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function updateNote(id: string, updates: Partial<TNote>) {
  try {
    const res = await db
      .update(notes)
      .set({
        ...updates,
        updated: new Date().toISOString(),
      })
      .where(eq(notes.id, id));
    console.log("Updated note with id:", id);
    return {
      result: res,
      error: null,
    };
  } catch (error) {
    console.error("Error updating note with id:", id, error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}
