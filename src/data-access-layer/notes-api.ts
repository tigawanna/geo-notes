import { db } from "@/lib/drizzle/client";
import { notes, TInsertNote } from "@/lib/drizzle/schema";
import { getTableColumns, sql } from "drizzle-orm";

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
    const res = await db.insert(notes).values(newNote);
    console.log("Created note:", res);
    return {
      result: res,
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
