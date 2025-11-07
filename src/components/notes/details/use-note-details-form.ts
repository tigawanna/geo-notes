import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { extractPhoneNumber, parseGeoJSONLocation } from "@/utils/note-utils";
import { NotNullableFields } from "@/utils/types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UseNoteDetailsFormProps {
  note:
    | TNote & {
        latitude?: string;
        longitude?: string;
        tags?: string[];
      };
}

export type NoteFormData = TNote & {
  location?: {
    lat: string;
    lng: string;
  };
  tags?: string[];
  // quickCopyMode: TNote["quickCopyMode"];
};

export function useNoteDetailsForm({ note }: UseNoteDetailsFormProps) {
  const { quickCopyMode: globalQuickCopyMode } = useSettingsStore();

  const form = useForm<NoteFormData>({
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      quickCopy: note?.quickCopy ?? "",
      // quickCopyMode: note?.quickCopyMode||"phone",
      tags: note?.tags ? JSON.parse(note.tags) : [],
      location: {
        lat: note?.latitude ?? "0",
        lng: note?.longitude ?? "0",
      },
    },
  });

  const { watch, setValue } = form;
  const title = watch("title");
  const content = watch("content");
  const quickCopy = watch("quickCopy");
  const noteQuickCopyMode = watch("quickCopyMode");

  // Use note-specific mode if set, otherwise use global mode
  const effectiveQuickCopyMode = noteQuickCopyMode ?? globalQuickCopyMode;

  // Auto-generate quick copy based on mode
  useEffect(() => {
    if (effectiveQuickCopyMode === "title" && title && !quickCopy) {
      setValue("quickCopy", title);
    } else if (effectiveQuickCopyMode === "phone" && content) {
      const phone = extractPhoneNumber(content);
      if (phone && !quickCopy) {
        setValue("quickCopy", phone);
      }
    }
  }, [title, content, effectiveQuickCopyMode, quickCopy, setValue]);

  return {
    form,
    effectiveQuickCopyMode,
  };
}
