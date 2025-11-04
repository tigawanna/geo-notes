import type { TNote } from "@/lib/drizzle/schema";
import type { TLocation } from "@/types/location";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
    createNote,
    deleteAllNotes,
    deleteNote,
    getNote,
    getNotes,
    GetNotesProps,
    updateNote,
} from "./notes-api";

export const getNotesQueryOptions = ({ sortOption, location }: GetNotesProps) =>
  queryOptions({
    queryKey: ["notes", sortOption],
    queryFn: () => getNotes({ sortOption, location }),
  });

export const getNoteQueryOptions = (id: string, location?: TLocation) =>
  queryOptions({
    queryKey: ["notes", "detail", id, location] as const,
    queryFn: () => getNote(id, location),
    enabled: !!id,
  });

export const createNotesMutationOptions = mutationOptions({
  mutationFn: createNote,
  meta: {
    invalidates: [["notes"]],
  },
});

export const updateNoteMutationOptions = mutationOptions({
  mutationFn: ({ id, updates }: { id: string; updates: Partial<TNote> }) => updateNote(id, updates),
  meta: {
    invalidates: [["notes"]],
  },
});

export const deleteAllNotesMutationOptions = mutationOptions({
  mutationFn: deleteAllNotes,
  meta: {
    invalidates: [["notes"]],
  },
});

export const deleteNoteMutationOptions = mutationOptions({
  mutationFn: (id: number) => deleteNote(id),
  meta: {
    invalidates: [["notes"]],
  },
});
