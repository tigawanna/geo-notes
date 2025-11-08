import type { NoteWithDistance } from "@/components/notes/list/NoteCard";
import { useMemo, useState } from "react";

export function useNoteSearch(notes: NoteWithDistance[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const query = searchQuery.toLowerCase().trim();
    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query) ||
        note.quickCopy?.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredNotes,
  };
}
