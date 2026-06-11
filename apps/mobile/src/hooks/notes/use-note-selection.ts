import { useState } from "react";

export function useNoteSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNoteIds(new Set());
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNoteIds);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNoteIds(newSelected);
  };

  const selectAll = (noteIds: string[]) => {
    const allIds = new Set(noteIds);
    setSelectedNoteIds(allIds);
  };

  const clearSelection = () => {
    setSelectedNoteIds(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNoteIds(new Set());
  };

  return {
    isSelectionMode,
    selectedNoteIds,
    toggleSelectionMode,
    toggleNoteSelection,
    selectAll,
    clearSelection,
    exitSelectionMode,
  };
}
