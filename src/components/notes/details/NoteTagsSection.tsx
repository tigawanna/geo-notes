import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Dialog, Portal, Text, useTheme } from "react-native-paper";

interface NoteTagsSectionProps {
  noteTags: string[] | null; // Array of tag IDs
  onTagsChange: (tags: string[]) => void;
}

export function NoteTagsSection({ noteTags, onTagsChange }: NoteTagsSectionProps) {
  const theme = useTheme();
  const { data: allTags } = useQuery(tagsQueryOptions);
  const [dialogVisible, setDialogVisible] = useState(false);

  const currentTagIds = noteTags || [];
  const currentTags = allTags?.filter(tag => currentTagIds.includes(tag.id)) || [];
  const availableTags = allTags?.filter(tag => !currentTagIds.includes(tag.id)) || [];

  const handleAddTag = (tagId: string) => {
    const newTags = [...currentTagIds, tagId];
    onTagsChange(newTags);
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = currentTagIds.filter(id => id !== tagId);
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
          style={styles.manageButton}>
          Manage
        </Button>
      </View>

      {currentTags.length > 0 ? (
        <View style={styles.tagsList}>
          {currentTags.map((tag) => (
            <Chip
              key={tag.id}
              style={[
                styles.tagChip,
                { backgroundColor:theme.colors.primaryContainer },
              ]}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
              onClose={() => handleRemoveTag(tag.id)}
              compact>
              {tag.name}
            </Chip>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyTags, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No tags added yet
          </Text>
        </View>
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
});
