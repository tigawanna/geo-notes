import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  isDeleting: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onExport,
  isDeleting,
}: BulkActionsBarProps) {
  const theme = useTheme();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={[styles.bulkActionsBar, { backgroundColor: theme.colors.surface }]}>
      <Button
        mode="contained"
        onPress={onDelete}
        icon="delete"
        style={styles.bulkActionButton}
        loading={isDeleting}>
        Delete ({selectedCount})
      </Button>
      <Button
        mode="outlined"
        onPress={onExport}
        icon="file-export"
        style={styles.bulkActionButton}>
        Export
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  bulkActionsBar: {
    position: "absolute",
    bottom: 80, // Above the FAB
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  bulkActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
