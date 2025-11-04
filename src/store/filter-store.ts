import { create } from "zustand";

type FilterStoreType = {
  selectedTagId: string | null;

  // Actions
  setSelectedTagId: (tagId: string | null) => void;
  clearFilter: () => void;
};

export const useFilterStore = create<FilterStoreType>((set) => ({
  // State
  selectedTagId: null,

  // Actions
  setSelectedTagId: (tagId) => set({ selectedTagId: tagId }),
  clearFilter: () => set({ selectedTagId: null }),
}));
