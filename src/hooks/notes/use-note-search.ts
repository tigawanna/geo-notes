import { useState } from "react";

/**
 * Hook to manage search query state
 * Note: Filtering is now done at the database level, not in JavaScript
 */
export function useNoteSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  return {
    searchQuery,
    setSearchQuery,
  };
}
