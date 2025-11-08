import { router } from "expo-router";
import { useEffect, useState } from "react";
import { UseFormReturn, useFormState } from "react-hook-form";
import { BackHandler } from "react-native";
import { TNoteForm } from "./NoteDetails";

interface UseUnsavedChangesProps {
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
}

export function useUnsavedChanges({ form }: UseUnsavedChangesProps) {
  const { isDirty } = useFormState({ control: form.control });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(isDirty);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);
  console.log("useUnsavedChanges - isDirty:", isDirty, "hasUnsavedChanges:", hasUnsavedChanges);
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (hasUnsavedChanges) {
        setUnsavedDialogVisible(true);
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    });

    return () => backHandler.remove();
  }, [hasUnsavedChanges]);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setUnsavedDialogVisible(true);
      return false; // Prevent navigation
    } else {
      router.back();
      return true; // Allow navigation
    }
  };

  const discardChanges = () => {
    setUnsavedDialogVisible(false);
    setHasUnsavedChanges(false);
    router.back();
  };

  const cancelNavigation = () => {
    setUnsavedDialogVisible(false);
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
