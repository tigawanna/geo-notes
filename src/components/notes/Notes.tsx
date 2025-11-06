import { SortOption } from "@/data-access-layer/notes-api";
import {
  createNotesMutationOptions,
  getNotesQueryOptions,
} from "@/data-access-layer/notes-query-optons";
import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { useFilterStore } from "@/store/filter-store";
import { useSettingsStore } from "@/store/settings-store";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import {
  ActivityIndicator,
  Card,
  FAB,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcon } from "../default/ui/icon-symbol";

const CARD_SPACING = 8;
const CONTAINER_PADDING = 8;

interface NoteWithDistance extends TNote {
  latitude: string;
  longitude: string;
  distance: number;
}

interface NotesScaffoldProps {
  children: React.ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  selectedTagId: string | null;
}

function NotesScaffold({
  children,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  selectedTagId,
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
  const { location } = useDeviceLocation();
  const { locationEnabled } = useSettingsStore();
  const { selectedTagId } = useFilterStore();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const {
    data,
    isPending,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery(
    getNotesQueryOptions({
      sortOption,
      location: {
        lat: location?.coords.latitude || 0,
        lng: location?.coords.longitude || 0,
      },
      tagId: selectedTagId,
    })
  );

  const createNoteMutation = useMutation({
    ...createNotesMutationOptions,
    onSuccess: (result) => {
      if (result.result) {
        router.push(`/note/edit?id=${result.result}` as any);
      }
    },
    meta: {
      invalidates: [["notes"]],
    },
  });

  const handleCreateNote = () => {
    const newNote: any = {
      title: "Untitled",
      content: "",
      quickCopy: null,
    };

    // Add location if enabled and available
    if (locationEnabled && location && typeof location === "object" && "coords" in location) {
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        const geoJSON = JSON.stringify({
          type: "Point",
          coordinates: [coords.longitude, coords.latitude],
        });
        newNote.location = geoJSON;
      }
    } else {
      newNote.location = null;
    }

    createNoteMutation.mutate(newNote);
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

  const renderNoteCard = ({ item, index }: { item: NoteWithDistance, index: number }) => {
    const handleLongPress = async () => {
      if (item.quickCopy) {
        await Clipboard.setStringAsync(item.quickCopy);
        showSnackbar(`"${item.quickCopy}" has been copied to clipboard.`);
      }
    };

    return (
      <Pressable
        onPress={() => router.push(`/note/details?id=${item.id}` as any)}
        onLongPress={handleLongPress}
        style={{ marginHorizontal: CARD_SPACING / 2 }}
        >
        <Card
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}
          mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" numberOfLines={2}>
              {item.title || "Untitled"}
            </Text>
            {item.content && (
              <Text variant="bodyMedium" numberOfLines={4} style={styles.content}>
                {item.content}
              </Text>
            )}
            {/* {item.quickCopy && (
              <Chip icon="content-copy" style={styles.chip} compact>
                {item.quickCopy}
              </Chip>
            )} */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.distance}>
                📍{" "}
                {(item.distance as number) < 1000
                  ? `${Math.round(item.distance as number)} m`
                  : `${((item.distance as number) / 1000).toFixed(1)} km`}
              </Text>
              <Text variant="bodySmall" style={styles.coordinates}>
                {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
              </Text>
              {/* {item.updated && (
                <Text variant="bodySmall" style={styles.updatedAt}>
                  Updated: {new Date(item.updated).toLocaleDateString()}{" "}
                  {new Date(item.updated).toLocaleTimeString()}
                </Text>
              )} */}
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
        selectedTagId={selectedTagId}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading notes...
          </Text>
        </View>
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
        selectedTagId={selectedTagId}>
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
        selectedTagId={selectedTagId}>
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
      selectedTagId={selectedTagId}>
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
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

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
  coordinates: {
    opacity: 0.5,
    fontSize: 10,
  },
  loadingText: {
    marginTop: 16,
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
});
