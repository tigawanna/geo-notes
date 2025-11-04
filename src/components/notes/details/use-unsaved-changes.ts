import type { TNote } from "@/lib/drizzle/schema";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";

interface UseUnsavedChangesProps {
  note: TNote | null | undefined;
  title: string;
  content: string;
  quickCopy: string;
}

export function useUnsavedChanges({ note, title, content, quickCopy }: UseUnsavedChangesProps) {
  const navigation = useNavigation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);
  const [navigationAction, setNavigationAction] = useState<any>(null);

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== (note.title || "");
      const contentChanged = content !== (note.content || "");
      const quickCopyChanged = quickCopy !== (note.quickCopy || "");
      setHasUnsavedChanges(titleChanged || contentChanged || quickCopyChanged);
    }
  }, [title, content, quickCopy, note]);

  // Prevent navigation when there are unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If no unsaved changes, allow navigation
      if (!hasUnsavedChanges) {
        return;
      }

      // Prevent default navigation behavior
      e.preventDefault();

      // Store the navigation action for later
      setNavigationAction(e.data.action);

      // Show the unsaved changes dialog
      setUnsavedDialogVisible(true);
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setUnsavedDialogVisible(true);
    } else {
      router.back();
    }
  };

  const discardChanges = () => {
    setUnsavedDialogVisible(false);
    setHasUnsavedChanges(false);
    // Dispatch the stored navigation action if it exists
    if (navigationAction) {
      navigation.dispatch(navigationAction);
      setNavigationAction(null);
    } else {
      router.back();
    }
  };

  const cancelNavigation = () => {
    setUnsavedDialogVisible(false);
    setNavigationAction(null);
  };

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    unsavedDialogVisible,
    setUnsavedDialogVisible,
    handleBack,
    discardChanges,
    cancelNavigation,
  };
}
