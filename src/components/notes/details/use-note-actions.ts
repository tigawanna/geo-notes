import {
  deleteNoteMutationOptions,
  updateNoteMutationOptions,
} from "@/data-access-layer/notes-query-optons";
import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

interface UseNoteActionsProps {
  id: string | undefined;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function useNoteActions({ id, setHasUnsavedChanges }: UseNoteActionsProps) {
  const queryClient = useQueryClient();
  const { locationEnabled } = useSettingsStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const updateMutation = useMutation({
    ...updateNoteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setHasUnsavedChanges(false);
      router.back();
    },
  });

  const deleteMutation = useMutation({
    ...deleteNoteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    },
  });

  const handleSave = (
    title: string,
    content: string,
    quickCopy: string,
    savedLocation: { lat: number; lng: number } | null,
    quickCopyMode: "title" | "phone" | "manual" | null,
    tags: string[]
  ) => {
    if (!id) return;

    const updates: Partial<TNote> = {
      title: title || "Untitled",
      content,
      quickCopy,
      quickCopyMode: quickCopyMode as any,
      tags: JSON.stringify(tags),
    };

    // Add location if we have a saved location (either from note or manually set)
    if (locationEnabled && savedLocation) {
      updates.location = createGeoJSONPoint(savedLocation.lat, savedLocation.lng) as any;
    }

    updateMutation.mutate({ id, updates });
  };

  const handleDelete = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    deleteMutation.mutate(Number(id));
  };

  return {
    menuVisible,
    setMenuVisible,
    deleteDialogVisible,
    setDeleteDialogVisible,
    updateMutation,
    deleteMutation,
    handleSave,
    handleDelete,
    confirmDelete,
  };
}
