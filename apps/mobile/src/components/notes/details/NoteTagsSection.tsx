import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { TNote, TTag } from "@/lib/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { TNoteForm } from "./NoteDetails";

interface NoteTagsSectionProps {
  note: TNote;
  form: UseFormReturn<TNoteForm, any, TNoteForm>;
  onNavigateToTags?: () => void;
}

export function NoteTagsSection({ form, note, onNavigateToTags }: NoteTagsSectionProps) {
  const theme = useTheme();
  const { data: allTags } = useQuery(tagsQueryOptions);
  const [dialogVisible, setDialogVisible] = useState(false);
  const { tags } = useWatch({ control: form.control });

  const currentTagIds = tags || [];
  const currentTags = allTags?.filter((tag) => currentTagIds.includes(tag.id)) || [];
  const availableTags: TTag[] = allTags?.filter((tag) => !currentTagIds.includes(tag.id)) || [];

  const onTagsChange = (newTags: string[]) => {
    form.setValue("tags", newTags);
  };

  const handleAddTag = (tagId: string) => {
    const newTags = [...currentTagIds, tagId];
    onTagsChange(newTags);
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = currentTagIds.filter((id) => id !== tagId);
    onTagsChange(newTags);
  };

  return (
    <View style={styles.tagsContainer}>
      <View style={styles.tagsHeader}>
        <Text variant="titleSmall" style={styles.headerTitle}>
          🏷️ Tags
        </Text>
        <Button
          mode="text"
          onPress={() => setDialogVisible(true)}
          style={styles.manageButton}
          disabled={allTags?.length === 0}>
          Manage
        </Button>
      </View>

      {currentTags.length > 0 ? (
        <View style={styles.tagsList}>
          {currentTags.map((tag) => (
            <Chip
              key={tag.id}
              style={[styles.tagChip, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
              onClose={() => handleRemoveTag(tag.id)}
              compact>
              {tag.name}
            </Chip>
          ))}
        </View>
      ) : (
        <Pressable
          style={[styles.emptyTags, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={onNavigateToTags}>
          <Text
            variant="bodySmall"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No tags yet. Create and manage tags.
          </Text>
        </Pressable>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Tags</Dialog.Title>
          <Dialog.Content>
            {availableTags.length > 0 ? (
              <ScrollView style={styles.dialogScroll}>
                <View style={styles.availableTags}>
                  {availableTags.map((tag) => (
                    <Chip
                      key={tag.id}
                      style={[
                        styles.availableTagChip,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                      textStyle={{ color: theme.colors.onPrimaryContainer }}
                      onPress={() => handleAddTag(tag.id)}
                      compact>
                      {tag.name}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            ) : allTags?.length === 0 ? (
              <View style={styles.noTagsContainer}>
                <Text variant="bodyMedium" style={[styles.noTagsText]}>
                  No tags yet. Create and manage tags.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setDialogVisible(false);
                    onNavigateToTags?.();
                  }}>
                  Go to Tags
                </Button>
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.noTagsText}>
                All available tags have been added to this note.
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    gap: 16,
  },
  tagsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: "600",
  },
  manageButton: {
    margin: 0,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    marginBottom: 4,
  },
  emptyTags: {
    padding: 16,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: "center",
  },
  dialogScroll: {
    maxHeight: 300,
  },
  availableTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availableTagChip: {
    marginBottom: 4,
  },
  noTagsText: {
    textAlign: "center",
    opacity: 0.7,
  },
  noTagsContainer: {
    alignItems: "center",
    gap: 26,
  },
});
