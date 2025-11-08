import { SortOption } from "@/data-access-layer/notes-api";
import { useState } from "react";

export function useNoteSort(defaultSort: SortOption = "distance-asc") {
  const [sortOption, setSortOption] = useState<SortOption>(defaultSort);

  return {
    sortOption,
    setSortOption,
  };
}
