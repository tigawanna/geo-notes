import { db } from "@/lib/drizzle/client";
import { notes, TNote } from "@/lib/drizzle/schema";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { logger } from "@/utils/logger";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Appbar, Menu, Tooltip } from "react-native-paper";
import { TNoteForm } from "../dets/NoteDetails";
import { NoteDeletionDialog } from "./NoteDeletionDialog";

interface NoteDetailsHeaderProps {
  note: TNote;
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
  isFormDirty: boolean;
}

export function NoteDetailsHeader({ note, form, isFormDirty }: NoteDetailsHeaderProps) {
  // const { watch } = form;
  const { showSnackbar } = useSnackbar();
  const hasUnsavedChanges = isFormDirty;
  const { quickCopy } = useWatch({ control: form.control });

  const hasQuickCopy = !!quickCopy;

  const handleQuickCopy = async () => {
    if (note?.quickCopy?.trim()) {
      await Clipboard.setStringAsync(note.quickCopy);
    }
  };
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const saveMuatation = useMutation({
    mutationFn: async () => {
      const payload = form.getValues();
      const { location, tags, ...rest } = payload;
      const res = await db
        .update(notes)
        .set({
          ...rest,
          tags: JSON.stringify(tags || []),
          location: createGeoJSONPoint({
            latitude: parseFloat(payload.location?.lat || "0"),
            longitude: parseFloat(payload.location?.lng || "0"),
          }),
        })
        .where(eq(notes.id, note.id));
      return res;
    },
    onSuccess: (data, variables) => {
      form.reset(form.getValues());
      logger.info("Note saved successfully", data);
      showSnackbar("Note saved successfully", { duration: 3000 });
    },
    onError: (error) => {
      console.log("Error saving note", error);
      showSnackbar(`Error saving note: ${error.message}`, { duration: 5000 });
    },
    meta: {
      invalidates: [["notes"]],
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await db.delete(notes).where(eq(notes.id, note.id));
    },
    onSuccess: () => {
      router.back();
    },
    meta: {
      invalidates: [["notes"]],
    },
  });

  const onDelete = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };
  return (
    <>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="" />
        {hasUnsavedChanges && (
          <Tooltip title="You have unsaved changes">
            <Appbar.Action icon="circle" size={8} color="orange" disabled />
          </Tooltip>
        )}
        <Tooltip title="Quick copy">
          <Appbar.Action icon="content-copy" onPress={handleQuickCopy} disabled={!hasQuickCopy} />
        </Tooltip>
        <Tooltip title={hasUnsavedChanges ? "Save changes" : "No changes to save"}>
          <Appbar.Action
            icon="check"
            onPress={async () => {
              await saveMuatation.mutate();
            }}
            disabled={saveMuatation.isPending || !hasUnsavedChanges}
            animated
          />
        </Tooltip>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
          <Menu.Item leadingIcon="delete" onPress={onDelete} title="Delete Note" />
        </Menu>
      </Appbar.Header>
      <NoteDeletionDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirmDelete={deleteMutation.mutate}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
