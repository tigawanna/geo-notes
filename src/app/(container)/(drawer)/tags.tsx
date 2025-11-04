import {
    tagsQueryOptions,
    useCreateTagMutation,
    useDeleteTagMutation,
    useUpdateTagMutation,
} from "@/data-access-layer/tags-query-options";
import type { TTag } from "@/lib/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Dialog,
    FAB,
    IconButton,
    Menu,
    Portal,
    Surface,
    Text,
    TextInput,
    useTheme
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B400",
  "#52B788",
];

export default function TagsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: tags, isPending, error } = useQuery(tagsQueryOptions);
  const deleteMutation = useDeleteTagMutation();

  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setMenuVisible(null);
    await deleteMutation.mutateAsync(id);
  };

  const { scaffold, handleOpenDialog } = useTagsScaffold(insets);

  if (isPending) {
    return scaffold(
      <View style={styles.statesContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return scaffold(
      <View style={styles.statesContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>
          Failed to load tags
        </Text>
      </View>
    );
  }

  return scaffold(
    tags && tags.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Text variant="titleLarge" style={styles.emptyTitle}>
          No tags yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Create tags to organize your notes
        </Text>
      </View>
    ) : (
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={[styles.tagCard,{backgroundColor:theme.colors.surface}]} elevation={1}>
            <Card.Content style={styles.tagCardContent}>
              <View style={styles.tagInfo}>
                <View style={styles.tagChip}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: item.color || theme.colors.primary },
                    ]}
                  />
                  <Text variant="bodyMedium">{item.name}</Text>
                </View>
                <Text variant="bodySmall" style={styles.tagDate}>
                  Created {new Date(item.created || "").toLocaleDateString()}
                </Text>
              </View>
              <Menu
                visible={menuVisible === item.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton icon="dots-vertical" onPress={() => setMenuVisible(item.id)} />
                }>
                <Menu.Item
                  leadingIcon="pencil"
                  onPress={() => {
                    setMenuVisible(null);
                    handleOpenDialog(item);
                  }}
                  title="Edit"
                />
                <Menu.Item
                  leadingIcon="delete"
                  onPress={() => handleDelete(item.id)}
                  title="Delete"
                />
              </Menu>
            </Card.Content>
          </Card>
        )}
      />
    )
  );
}

function useTagsScaffold(insets: { top: number; bottom: number; left: number; right: number }) {
  const createMutation = useCreateTagMutation();
  const updateMutation = useUpdateTagMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TTag | null>(null);
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleOpenDialog = (tag?: TTag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setSelectedColor(tag.color || PRESET_COLORS[0]);
    } else {
      setEditingTag(null);
      setTagName("");
      setSelectedColor(PRESET_COLORS[0]);
    }
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
    setEditingTag(null);
    setTagName("");
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleSave = async () => {
    if (!tagName.trim()) return;

    if (editingTag) {
      await updateMutation.mutateAsync({
        id: editingTag.id,
        updates: { name: tagName.trim(), color: selectedColor },
      });
    } else {
      await createMutation.mutateAsync({
        name: tagName.trim(),
        color: selectedColor,
        user_id: null,
      });
    }
    handleCloseDialog();
  };

  const scaffold = (children: React.ReactNode) => (
    <Surface style={[styles.scaffoldContainer]}>
      <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>{children}</View>

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => handleOpenDialog()}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={handleCloseDialog}>
          <Dialog.Title>{editingTag ? "Edit Tag" : "Create Tag"}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tag Name"
              value={tagName}
              onChangeText={setTagName}
              mode="outlined"
              style={styles.input}
            />
            <Text variant="labelLarge" style={styles.colorLabel}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <IconButton
                  key={color}
                  icon={selectedColor === color ? "check-circle" : "circle"}
                  iconColor={color}
                  size={32}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    selectedColor === color && styles.selectedColorButton,
                  ]}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseDialog}>Cancel</Button>
            <Button
              onPress={handleSave}
              disabled={!tagName.trim() || createMutation.isPending || updateMutation.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );

  return { scaffold, handleOpenDialog };
}

const styles = StyleSheet.create({
  scaffoldContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  statesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontWeight: "600",
  },
  emptyText: {
    opacity: 0.7,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  tagCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  tagCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagInfo: {
    flex: 1,
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  tagDate: {
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
  },
  input: {
    marginBottom: 16,
  },
  colorLabel: {
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  colorButton: {
    margin: 0,
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: "currentColor",
    borderRadius: 20,
  },
});
