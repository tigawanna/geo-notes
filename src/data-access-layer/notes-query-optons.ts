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

export const getNotesQueryOptions = ({ sortOption, location, tagId }: GetNotesProps) =>
  queryOptions({
    queryKey: ["notes", sortOption, tagId, location] as const,
    queryFn: () => getNotes({ sortOption, location, tagId }),
    placeholderData: (prev) => prev
  });

export const getNoteQueryOptions = (id: string, location?: TLocation) =>
  queryOptions({
    queryKey: ["notes", "detail", id, location] as const,
    queryFn: () => getNote(id, location),
    placeholderData: (prev) => prev,
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



