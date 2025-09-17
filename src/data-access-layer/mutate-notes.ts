import { db } from "@/lib/drizzle/client";
import { GeoNoteInsert, notes } from "@/lib/drizzle/schema";
import { mutationOptions } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export const createNoteMutationFunction = mutationOptions({
  mutationFn: ({ payload }: { payload: GeoNoteInsert }) => {
    return db.insert(notes).values(payload);
  },
  meta: {
    invalidates: [["notes"]],
  },
});

export const updateNoteMutationFunction = mutationOptions({
  mutationFn: ({ id, payload }: { id: number; payload: Partial<GeoNoteInsert> }) => {
    return db.update(notes).set(payload).where(eq(notes.id, id));
  },
  meta: {
    invalidates: [["notes"]],
  },
});
