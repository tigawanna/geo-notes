import { db } from "@/lib/drizzle/client";
import { notes, TInsertNote, TNote } from "@/lib/drizzle/schema";
import { TLocation } from "@/types/location";
import { logger } from "@/utils/logger";
import { eq, getTableColumns, sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";
export type SortOption = "recent-desc" | "recent-asc" | "distance-asc" | "distance-desc";

export type GetNotesProps = {
  sortOption?: SortOption;
  location?: TLocation;
  tagId?: string | null;
};

export async function getNotes({ sortOption, location, tagId }: GetNotesProps) {
  try {
    logger.log("Fetching notes with params:", { sortOption, location, tagId });
    const notesColumn = getTableColumns(notes);
    // Create reference point using ST_GeomFromText (confirmed working)
    const currentLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng},${location?.lat}]}`;


    const query = db
      .select({
        ...notesColumn,
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // distance_km: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currentLocationGeoJSON}))`.as(
        //   "distance_km"
        // ),
        distance_km: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currentLocationGeoJSON})) * 111.325`.as("distance_km")
      })
      .from(notes);

    // Apply tag filter if specified
    if (tagId) {
      query.where(sql`json_extract(${notes.tags}, '$') LIKE '%' || ${tagId} || '%'`);
    }

    // Apply sorting with better handling for NULL distances
    switch (sortOption) {
      case "recent-desc":
        query.orderBy(sql`${notes.updated} DESC`);
        break;
      case "recent-asc":
        query.orderBy(sql`${notes.updated} ASC`);
        break;
      case "distance-asc":
        // Handle NULL distances by putting them at the end
        if (location) {
          query.orderBy(sql`
            CASE WHEN distance_km IS NULL THEN 1 ELSE 0 END,
            distance_km ASC, 
            ${notes.updated} DESC
          `);
        } else {
          query.orderBy(sql`${notes.updated} DESC`);
        }
        break;
      case "distance-desc":
        if (location) {
          query.orderBy(sql`
            CASE WHEN distance_km IS NULL THEN 1 ELSE 0 END,
            distance_km DESC, 
            ${notes.updated} DESC
          `);
        } else {
          query.orderBy(sql`${notes.updated} DESC`);
        }
        break;
      default:
        if (location) {
          query.orderBy(sql`
            CASE WHEN distance_km IS NULL THEN 1 ELSE 0 END,
            distance_km ASC, 
            ${notes.updated} DESC
          `);
        } else {
          query.orderBy(sql`${notes.updated} DESC`);
        }
    }

    const res = await query;
   // logger.log("Fetched notes:", res.slice(0, 3)); // Log only first 5 notes for brevity

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
    const { location: _location, ...otherColumns } = notesColumn; // Exclude location from spread
    const currLocationGeoJSON = `{"type":"Point","coordinates":[${location?.lng},${location?.lat}]}`;
    
    const query = db
      .select({
        ...otherColumns, // Spread other columns without location
        // Convert location blob back to GeoJSON for parsing
        location: sql<string>`AsGeoJSON(${notes.location})`.as("location"),
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.location})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.location})`.as("longitude"),
        // Calculate great-circle distance using SpatiaLite's geodesic functions
        // ST_Distance returns distance in meters by default
        distance_km: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${currLocationGeoJSON})) * 111.325`.as(
          "distance_km"
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
    //         "distance_km"
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
