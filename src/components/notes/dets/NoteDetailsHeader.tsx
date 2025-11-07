import { notes, TNote } from "@/lib/drizzle/schema";
import { Appbar, Menu, Tooltip } from "react-native-paper";
import { TNoteForm } from "../dets/NoteDetails";
import { UseFormReturn } from "react-hook-form";
import { router } from "expo-router";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useMutation } from "@tanstack/react-query";
import { db } from "@/lib/drizzle/client";
import { eq } from "drizzle-orm";
import { createGeoJSONPoint } from "@/utils/note-utils";

interface NoteDetailsHeaderProps {
  note: TNote;
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
}

export function NoteDetailsHeader({ note, form }: NoteDetailsHeaderProps) {
  const { watch } = form;
  const hasUnsavedChanges = form.formState.isDirty;
  const quickCopy = watch("quickCopy");
  const hasQuickCopy = !!quickCopy;

  const handleQuickCopy = async () => {
    if (note?.quickCopy?.trim()) {
      await Clipboard.setStringAsync(note.quickCopy);
    }
  };
  const [menuVisible, setMenuVisible] = useState(false);
  const saveMuatation = useMutation({
    mutationFn: async () => {
      const payload = form.getValues();
      await db
        .update(notes)
        .set({
          ...payload,
          location: createGeoJSONPoint({
            latitude: parseFloat(payload.location?.lat || "0"),
            longitude: parseFloat(payload.location?.lng || "0"),
          }),
        })
        .where(eq(notes.id, note.id));
    },
    onSuccess: () => {
      form.reset(form.getValues());
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
    deleteMutation.mutate();
  };
  return (
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
  );
}
