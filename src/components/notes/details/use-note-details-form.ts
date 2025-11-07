import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { extractPhoneNumber, parseGeoJSONLocation } from "@/utils/note-utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UseNoteDetailsFormProps {
  note: TNote | null | undefined;
}

export interface NoteFormData {
  title: string;
  content: string;
  quickCopy: string;
  quickCopyMode: "title" | "phone" | "manual" | null;
  location: { lat: number; lng: number } | null;
  tags: string[];
}

export function useNoteDetailsForm({ note }: UseNoteDetailsFormProps) {
  const { quickCopyMode: globalQuickCopyMode } = useSettingsStore();
  
  const form = useForm<NoteFormData>({
    defaultValues: {
      title: "",
      content: "",
      quickCopy: "",
      quickCopyMode: null,
      location: null,
      tags: [],
    },
  });

  const { watch, setValue, reset } = form;
  const title = watch("title");
  const content = watch("content");
  const quickCopy = watch("quickCopy");
  const noteQuickCopyMode = watch("quickCopyMode");

  // Use note-specific mode if set, otherwise use global mode
  const effectiveQuickCopyMode = noteQuickCopyMode ?? globalQuickCopyMode;

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      const formData: NoteFormData = {
        title: note.title || "",
        content: note.content || "",
        quickCopy: note.quickCopy || "",
        quickCopyMode: note.quickCopyMode as "title" | "phone" | "manual" | null,
        location: null,
        tags: [],
      };

      // Parse saved location from GeoJSON if it exists
      if (note.location) {
        const location = parseGeoJSONLocation(note.location);
        if (location) {
          formData.location = location;
        }
      }

      // Parse tags from JSON string if it exists
      if (note.tags) {
        try {
          const parsedTags = JSON.parse(note.tags);
          if (Array.isArray(parsedTags)) {
            formData.tags = parsedTags;
          }
        } catch (error) {
          console.warn("Failed to parse note tags:", error);
          formData.tags = [];
        }
      }

      reset(formData);
    }
  }, [note, reset]);

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
