import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { extractPhoneNumber, parseGeoJSONLocation } from "@/utils/note-utils";
import { useEffect, useState } from "react";

interface UseNoteDetailsFormProps {
  note: TNote | null | undefined;
}

export function useNoteDetailsForm({ note }: UseNoteDetailsFormProps) {
  const { quickCopyMode } = useSettingsStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [quickCopy, setQuickCopy] = useState("");
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setQuickCopy(note.quickCopy || "");

      // Parse saved location from GeoJSON if it exists
      if (note.location) {
        const location = parseGeoJSONLocation(note.location);
        if (location) {
          setSavedLocation(location);
        }
      }
    }
  }, [note]);

  // Auto-generate quick copy based on mode
  useEffect(() => {
    if (quickCopyMode === "title" && title && !quickCopy) {
      setQuickCopy(title);
    } else if (quickCopyMode === "phone" && content) {
      const phone = extractPhoneNumber(content);
      if (phone && !quickCopy) {
        setQuickCopy(phone);
      }
    }
  }, [title, content, quickCopyMode, quickCopy]);

  return {
    title,
    setTitle,
    content,
    setContent,
    quickCopy,
    setQuickCopy,
    savedLocation,
    setSavedLocation,
  };
}
