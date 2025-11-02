import type { TNote } from "@/lib/drizzle/schema";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createNote, deleteAllNotes, deleteNote, getNote, getNotes, updateNote } from "./notes-api";

export const getNotesQueryOptions = (sortByLocation: boolean) =>
  queryOptions({
    queryKey: ["notes", sortByLocation],
    queryFn: () => getNotes(sortByLocation),
  });

export const getNoteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["notes", "detail", id] as const,
    queryFn: () => getNote(id),
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
