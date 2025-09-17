import { db } from "@/lib/drizzle/client";
import { GeoNoteInsert, notes } from "@/lib/drizzle/schema";
import { mutationOptions } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export const createNoteMutationFunction = mutationOptions({
  mutationFn: async ({ payload }: { payload: GeoNoteInsert }) => {
    try {
      const result = await db.insert(notes).values(payload).returning({ insertedId: notes.id });
      return {
        result:result[0].insertedId,
        error: null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        result: null,
      };
    }
  },
  meta: {
    invalidates: [["notes"]],
  },
});

export const updateNoteMutationFunction = mutationOptions({
  mutationFn: async ({ id, payload }: { id: number; payload: Partial<GeoNoteInsert> }) => {
    try {
      const result = await db.update(notes).set(payload).where(eq(notes.id, id)).returning();
      return {
        result,
        error: null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        result: null,
      };
    }
  },
  meta: {
    invalidates: [["notes"]],
  },
});
