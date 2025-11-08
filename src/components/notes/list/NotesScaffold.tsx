import { SortOption } from "@/data-access-layer/notes-api";
import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { useFilterStore } from "@/store/filter-store";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { LocationObject } from "expo-location";
import { StyleSheet, View } from "react-native";
import { Button, IconButton, Searchbar, Text, useTheme } from "react-native-paper";
import { LoadingIndicatorDots } from "../../state-screens/LoadingIndicatorDots";
import { NotesContextMenu } from "./ContexxtMenu";

interface NotesScaffoldProps {
  children: React.ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  selectedTagId: string | null;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  location: LocationObject | null | undefined;
  isLocationLoading: boolean;
  isDualColumn: boolean;
  onToggleColumnMode: () => void;
}

export function NotesScaffold({
  children,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  selectedTagId,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onSelectAll,
  onClearSelection,
  location,
  isLocationLoading,
  isDualColumn,
  onToggleColumnMode,
}: NotesScaffoldProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { data: tags } = useQuery(tagsQueryOptions);

  const selectedTag = tags?.find((tag) => tag.id === selectedTagId);

  return (
    <View style={styles.scaffoldContainer}>
      <View style={styles.searchRow}>
        <IconButton icon="menu" onPress={() => navigation.openDrawer()} size={24} />
        <Searchbar
          placeholder="Search notes"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.onSurfaceVariant}
          placeholderTextColor={colors.onSurfaceVariant}
        />
        {isSelectionMode ? (
          <IconButton icon="close" onPress={onToggleSelectionMode} size={24} />
        ) : (
          <NotesContextMenu
            isDualColumn={isDualColumn}
            onToggleSelectionMode={onToggleSelectionMode}
            onToggleColumnMode={onToggleColumnMode}
            setSortOption={setSortOption}
          />
        )}
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          gap: 2,
        }}>
        {location && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 1,
              width: "100%",
            }}>
            <Text variant="bodySmall" style={{ fontSize: 12, opacity: 0.5 }}>
              Lat: {location.coords.latitude.toFixed(4)} Lng: {location.coords.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        {isLocationLoading && <LoadingIndicatorDots />}
      </View>
      {isSelectionMode && (
        <View style={[styles.selectionHeader, { backgroundColor: colors.primaryContainer }]}>
          <View style={styles.selectionInfo}>
            <Text variant="bodyMedium" style={{ color: colors.onPrimaryContainer }}>
              {selectedCount} selected
            </Text>
          </View>
          <View style={styles.selectionActions}>
            <Button
              mode="text"
              onPress={selectedCount === 0 ? onSelectAll : onClearSelection}
              textColor={colors.primary}
              compact>
              {selectedCount === 0 ? "Select All" : "Clear"}
            </Button>
          </View>
        </View>
      )}
      {selectedTag && (
        <View style={[styles.filterIndicator, { backgroundColor: colors.primaryContainer }]}>
          <View
            style={[styles.filterDot, { backgroundColor: selectedTag.color || colors.primary }]}
          />
          <Text style={[styles.filterText, { color: colors.onPrimaryContainer }]}>
            Filtering by tag: {selectedTag.name}
          </Text>
          <IconButton
            icon="close"
            size={16}
            onPress={() => {
              const { setSelectedTagId } = useFilterStore.getState();
              setSelectedTagId(null);
            }}
            style={styles.clearButton}
          />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scaffoldContainer: {
    flex: 1,
    width: "100%",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 0,
    flex: 1,
  },
  searchInput: {
    fontSize: 16,
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionActions: {
    flexDirection: "row",
  },
  filterIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    margin: 0,
  },
});
