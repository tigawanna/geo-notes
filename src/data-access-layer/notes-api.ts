import { db } from "@/lib/drizzle/client";
import { notes, TInsertNote, TNote } from "@/lib/drizzle/schema";
import { TLocation } from "@/types/location";
import { eq, getTableColumns, sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";
export type SortOption = "recent-desc" | "recent-asc" | "distance-asc" | "distance-desc";

export type GetNotesProps = {
  sortOption?: SortOption;
  location?: TLocation;
};

export async function getNotes({ sortOption, location }: GetNotesProps) {
  try {
    const notesColumn = getTableColumns(notes);
    // Reference point: Nairobi, Kenya coordinates
    // SpatiaLite uses [longitude, latitude] order in GeoJSON (X, Y)
    const currLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng},${location?.lat}]}`;
    const query = db
      .select({
        ...notesColumn,
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // Calculate great-circle distance using SpatiaLite's geodesic functions
        // ST_Distance returns distance in meters by default
        distance: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON}))`.as(
          "distance_meters"
        ),
      })
      .from(notes);

    // Apply sorting based on sortOption
    switch (sortOption) {
      case "recent-desc":
        // Most recent first
        query.orderBy(sql`updated DESC`);
        break;
      case "recent-asc":
        // Oldest first
        query.orderBy(sql`updated ASC`);
        break;
      case "distance-asc":
        // Closest first, then most recent
        query.orderBy(sql`distance_meters ASC`);
        query.orderBy(sql`updated DESC`);
        break;
      case "distance-desc":
        // Farthest first, then most recent
        query.orderBy(sql`distance_meters DESC`);
        query.orderBy(sql`updated DESC`);
        break;
      default:
        // Default to closest first
        query.orderBy(sql`distance_meters ASC`);
        query.orderBy(sql`updated DESC`);
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

export async function getNote(id: string, location?: TLocation) {
  try {
    const notesColumn = getTableColumns(notes);
    const currLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng},${location?.lat}]}`;
    let query = db
      .select({
        ...notesColumn,
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // Calculate great-circle distance using SpatiaLite's geodesic functions
        // ST_Distance returns distance in meters by default
        distance: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON}))`.as(
          "distance_meters"
        ),
      })
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    // if (location) {
    //   // Reference point: Nairobi, Kenya coordinates
    //   // SpatiaLite uses [longitude, latitude] order in GeoJSON (X, Y)
    //   const currLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng},${location?.lat}]}`
    //   query = db
    //     .select({
    //       ...notesColumn,
    //       // Extract Y coordinate (latitude) from point geometry blob
    //       latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
    //       // Extract X coordinate (longitude) from point geometry blob
    //       longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
    //       // Calculate great-circle distance using SpatiaLite's geodesic functions
    //       // ST_Distance returns distance in meters by default
    //       distance: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON}))`.as(
    //         "distance_meters"
    //       ),
    //     })
    //     .from(notes)
    //     .where(eq(notes.id, id))
    //     .limit(1);
    // }

    const res = await query;
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
