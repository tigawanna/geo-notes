import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { extractPhoneNumber, parseGeoJSONLocation } from "@/utils/note-utils";
import { useEffect, useState } from "react";

interface UseNoteDetailsFormProps {
  note: TNote | null | undefined;
}

export function useNoteDetailsForm({ note }: UseNoteDetailsFormProps) {
  const { quickCopyMode: globalQuickCopyMode } = useSettingsStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [quickCopy, setQuickCopy] = useState("");
  const [noteQuickCopyMode, setNoteQuickCopyMode] = useState<"title" | "phone" | "manual" | null>(null);
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // Use note-specific mode if set, otherwise use global mode
  const effectiveQuickCopyMode = noteQuickCopyMode ?? globalQuickCopyMode;

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setQuickCopy(note.quickCopy || "");
      setNoteQuickCopyMode(note.quickCopyMode as "title" | "phone" | "manual" | null);

      // Parse saved location from GeoJSON if it exists
      if (note.location) {
        const location = parseGeoJSONLocation(note.location);
        if (location) {
          setSavedLocation(location);
        }
      }

      // Parse tags from JSON string if it exists
      if (note.tags) {
        try {
          const parsedTags = JSON.parse(note.tags);
          if (Array.isArray(parsedTags)) {
            setTags(parsedTags);
          }
        } catch (error) {
          console.warn("Failed to parse note tags:", error);
          setTags([]);
        }
      } else {
        setTags([]);
      }
    }
  }, [note]);

  // Auto-generate quick copy based on mode
  useEffect(() => {
    if (effectiveQuickCopyMode === "title" && title && !quickCopy) {
      setQuickCopy(title);
    } else if (effectiveQuickCopyMode === "phone" && content) {
      const phone = extractPhoneNumber(content);
      if (phone && !quickCopy) {
        setQuickCopy(phone);
      }
    }
  }, [title, content, effectiveQuickCopyMode, quickCopy]);

  return {
    title,
    setTitle,
    content,
    setContent,
    quickCopy,
    setQuickCopy,
    noteQuickCopyMode,
    setNoteQuickCopyMode,
    savedLocation,
    setSavedLocation,
    tags,
    setTags,
  };
}
