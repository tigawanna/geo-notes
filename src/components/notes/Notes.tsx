import { SortOption } from "@/data-access-layer/notes-api";
import {
  createNotesMutationOptions,
  deleteNotesMutationOptions,
  getNotesQueryOptions,
} from "@/data-access-layer/notes-query-optons";
import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { useFilterStore } from "@/store/filter-store";
import { useSettingsStore } from "@/store/settings-store";
import { createGeoJSONPoint, formatKillometers } from "@/utils/note-utils";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import { LocationObject } from "expo-location";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import {
  Button,
  Card,
  Checkbox,
  FAB,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcon } from "../default/ui/icon-symbol";
import { LoadingFallback } from "../state-screens/LoadingFallback";

const CARD_SPACING = 8;
const CONTAINER_PADDING = 8;

interface NoteWithDistance extends TNote {
  latitude: string;
  longitude: string;
  distance_km: number;
}

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
}

function NotesScaffold({
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
}: NotesScaffoldProps) {
  const { colors } = useTheme();
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { data: tags } = useQuery(tagsQueryOptions);

  const openMenu = () => {
    setSortMenuVisible(true);
  };
  const closeMenu = () => setSortMenuVisible(false);

  const handleSortSelect = (newSort: SortOption) => {
    setSortOption(newSort);
    closeMenu();
  };

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
          <View style={{ flexDirection: "row" }}>
            <IconButton icon="select-all" onPress={onToggleSelectionMode} size={24} />
            <Menu
              visible={sortMenuVisible}
              onRequestClose={closeMenu}
              style={{
                top: "10%",
                backgroundColor: colors.surface,
              }}
              anchor={<IconButton icon="sort" onPress={openMenu} size={24} />}>
              <MenuItem
                onPress={() => handleSortSelect("recent-desc")}
                textStyle={
                  sortOption === "recent-desc"
                    ? { fontWeight: "bold", color: colors.primary }
                    : { color: colors.onSurface }
                }
                pressColor={colors.primaryContainer}>
                {sortOption === "recent-desc" && (
                  <MaterialCommunityIcon
                    name="check"
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                    size={18}
                  />
                )}
                Recent (Newest)
              </MenuItem>
              <MenuItem
                onPress={() => handleSortSelect("recent-asc")}
                textStyle={
                  sortOption === "recent-asc"
                    ? { fontWeight: "bold", color: colors.primary }
                    : { color: colors.onSurface }
                }
                pressColor={colors.primaryContainer}>
                {sortOption === "recent-asc" && (
                  <MaterialCommunityIcon
                    name="check"
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                    size={18}
                  />
                )}
                Recent (Oldest)
              </MenuItem>
              <MenuDivider />
              <MenuItem
                onPress={() => handleSortSelect("distance-asc")}
                textStyle={
                  sortOption === "distance-asc"
                    ? { fontWeight: "bold", color: colors.primary }
                    : { color: colors.onSurface }
                }
                pressColor={colors.primaryContainer}>
                {sortOption === "distance-asc" && (
                  <MaterialCommunityIcon
                    name="check"
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                    size={18}
                  />
                )}
                Distance (Closest)
              </MenuItem>
              <MenuItem
                onPress={() => handleSortSelect("distance-desc")}
                textStyle={
                  sortOption === "distance-desc"
                    ? { fontWeight: "bold", color: colors.primary }
                    : { color: colors.onSurface }
                }
                pressColor={colors.primaryContainer}>
                {sortOption === "distance-desc" && (
                  <MaterialCommunityIcon
                    name="check"
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                    size={18}
                  />
                )}
                Distance (Farthest)
              </MenuItem>
            </Menu>
          </View>
        )}
      </View>
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
              // Clear filter - we'll need to pass a clear function or use the store directly
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

export function Notes() {
  const [sortOption, setSortOption] = useState<SortOption>("distance-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [showRefreshControl, setShowRefreshControl] = useState(false);
  const { location, isLoading: isLocationLoading } = useDeviceLocation();
  const lat = location?.coords.latitude || 0;
  const lng = location?.coords.longitude || 0;
  const { locationEnabled } = useSettingsStore();
  const { selectedTagId } = useFilterStore();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const {
    data,
    isPending,
    error: queryError,
    refetch,
  } = useQuery(
    getNotesQueryOptions({
      sortOption,
      location: {
        lat,
        lng,
      },
      tagId: selectedTagId,
    })
  );

  const createNoteMutation = useMutation({
    ...createNotesMutationOptions,
    onSuccess: (result) => {
      if (result.result) {
        router.push(`/note/details?id=${result.result}` as any);
      }
    },
    meta: {
      invalidates: [["notes"]],
    },
  });

  const deleteNoteMutation = useMutation(deleteNotesMutationOptions);

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNoteIds(new Set());
  };

  const handleSelectAll = () => {
    const allIds = new Set(notes.map((note) => note.id));
    setSelectedNoteIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedNoteIds(new Set());
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedNoteIds);
    await deleteNoteMutation.mutateAsync(selectedIds);
    setIsSelectionMode(false);
    setSelectedNoteIds(new Set());
    showSnackbar(`Deleted ${selectedIds.length} notes`);
  };

  const handleBulkExport = async () => {
    try {
      const selectedNotes = notes.filter((note) => selectedNoteIds.has(note.id));
      // Convert notes to export format (similar to the export function)
      const notesToExport = selectedNotes.map((note) => ({
        ...note,
        location:
          note.latitude && note.longitude
            ? `{"type":"Point","coordinates":[${note.longitude},${note.latitude}]}`
            : null,
      }));

      const jsonData = JSON.stringify(notesToExport, null, 2);
      const fileName = `notes_export_${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonData);

      // Share the file
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(fileUri);
      }

      setIsSelectionMode(false);
      setSelectedNoteIds(new Set());
      showSnackbar(`Exported ${selectedNotes.length} notes`);
    } catch (error) {
      showSnackbar(
        `Failed to export notes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCreateNote = () => {
    const newNote: any = {
      title: "Untitled",
      content: "",
      quickCopy: null,
    };

    // Add location if enabled and available
    if (locationEnabled && location) {
      if (lng && lat) {
        newNote.location = createGeoJSONPoint({
          latitude: lat,
          longitude: lng,
        });
      }
    } else {
      newNote.location = null;
    }

    createNoteMutation.mutate(newNote);
  };

  const handleRefresh = () => {
    setShowRefreshControl(true);
    refetch().finally(() => setShowRefreshControl(false));
  };

  const notes = useMemo(() => {
    let filteredNotes = (data?.result || []) as NoteWithDistance[];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.quickCopy?.toLowerCase().includes(query)
      );
    }

    return filteredNotes;
  }, [data?.result, searchQuery]);

  const renderNoteCard = ({ item, index }: { item: NoteWithDistance; index: number }) => {
    const handleLongPress = async () => {
      if (item.quickCopy) {
        await Clipboard.setStringAsync(item.quickCopy);
        showSnackbar(`"${item.quickCopy}" has been copied to clipboard.`);
      }
    };

    const handlePress = () => {
      if (isSelectionMode) {
        const newSelected = new Set(selectedNoteIds);
        if (newSelected.has(item.id)) {
          newSelected.delete(item.id);
        } else {
          newSelected.add(item.id);
        }
        setSelectedNoteIds(newSelected);
      } else {
        router.push(`/note/details?id=${item.id}` as any);
      }
    };

    const isSelected = selectedNoteIds.has(item.id);

    return (
      <Pressable
        onPress={handlePress}
        onLongPress={isSelectionMode ? undefined : handleLongPress}
        style={{ marginHorizontal: CARD_SPACING / 2 }}>
        <Card
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
            },
            isSelectionMode &&
              isSelected && {
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
          ]}
          mode="elevated">
          {isSelectionMode && (
            <View style={styles.checkboxContainer}>
              <Checkbox status={isSelected ? "checked" : "unchecked"} onPress={handlePress} />
            </View>
          )}
          <Card.Content>
            <Text variant="titleMedium" numberOfLines={2}>
              {item.title || "Untitled"}
            </Text>
            {item.content && (
              <Text variant="bodyMedium" numberOfLines={4} style={styles.content}>
                {item.content}
              </Text>
            )}
            <View style={styles.footer}>
              {isLocationLoading ? (
                <Text variant="bodySmall" style={styles.distance}>
                  📍 ...
                </Text>
              ) : (
                <Text variant="bodySmall" style={styles.distance}>
                  📍 {formatKillometers(item.distance_km)}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  if (isPending) {
    return (
      <NotesScaffold
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        selectedTagId={selectedTagId}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedCount={selectedNoteIds.size}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        location={location}
        isLocationLoading={isLocationLoading}>
        <LoadingFallback />
      </NotesScaffold>
    );
  }

  if (queryError) {
    return (
      <NotesScaffold
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        selectedTagId={selectedTagId}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedCount={selectedNoteIds.size}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        location={location}
        isLocationLoading={isLocationLoading}>
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={styles.errorText}>
            Error loading notes
          </Text>
          <Text variant="bodyMedium">{queryError.message}</Text>
        </View>
      </NotesScaffold>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <NotesScaffold
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        selectedTagId={selectedTagId}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedCount={selectedNoteIds.size}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        location={location}
        isLocationLoading={isLocationLoading}>
        <View style={styles.centerContainer}>
          <Text variant="titleLarge">No notes yet</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your first geo-note!
          </Text>
        </View>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateNote}
          loading={createNoteMutation.isPending}
          label="New Note"
        />
      </NotesScaffold>
    );
  }

  return (
    <NotesScaffold
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortOption={sortOption}
      setSortOption={setSortOption}
      selectedTagId={selectedTagId}
      isSelectionMode={isSelectionMode}
      onToggleSelectionMode={handleToggleSelectionMode}
      selectedCount={selectedNoteIds.size}
      onSelectAll={handleSelectAll}
      onClearSelection={handleClearSelection}
      location={location}
      isLocationLoading={isLocationLoading}>
      <FlashList
        data={notes}
        renderItem={renderNoteCard}
        keyExtractor={(item: NoteWithDistance) => item.id}
        masonry
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.masonryContainer}
        refreshControl={
          <RefreshControl
            refreshing={showRefreshControl}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {isSelectionMode && selectedNoteIds.size > 0 && (
        <View style={[styles.bulkActionsBar, { backgroundColor: theme.colors.surface }]}>
          <Button
            mode="contained"
            onPress={handleBulkDelete}
            icon="delete"
            style={styles.bulkActionButton}
            loading={deleteNoteMutation.isPending}>
            Delete ({selectedNoteIds.size})
          </Button>
          <Button
            mode="outlined"
            onPress={handleBulkExport}
            icon="file-export"
            style={styles.bulkActionButton}>
            Export
          </Button>
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateNote}
        loading={createNoteMutation.isPending}
        label="New Note"
      />
    </NotesScaffold>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
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
  masonryContainer: {
    padding: CONTAINER_PADDING,
    gap: CARD_SPACING,
    paddingBottom: "25%",
  },
  card: {
    marginBottom: CARD_SPACING,
    width: "100%",
  },
  content: {
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    gap: 4,
  },
  distance: {
    opacity: 0.7,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  scaffoldContainer: {
    flex: 1,
    width: "100%",
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
  checkboxContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
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
