import {
  createNotesMutationOptions,
  getNotesQueryOptions,
} from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { useSettingsStore } from "@/store/settings-store";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import {
  ActivityIndicator,
  Card,
  Chip,
  FAB,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcon } from "../default/ui/icon-symbol";
import { DebugDbPath } from "./DebugDbPath";

const CARD_SPACING = 8;
const CONTAINER_PADDING = 8;

type SortOption = "recent-desc" | "recent-asc" | "distance-asc" | "distance-desc";

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
}

function NotesScaffold({
  children,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
}: NotesScaffoldProps) {
  const { colors } = useTheme();
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const openMenu = () => {
    setSortMenuVisible(true);
  };
  const closeMenu = () => setSortMenuVisible(false);

  const handleSortSelect = (newSort: SortOption) => {
    setSortOption(newSort);
    closeMenu();
  };

  return (
    <View style={styles.scaffoldContainer}>
      <View style={styles.searchRow}>
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
      {children}
    </View>
  );
}

export function Notes() {
  const [sortOption, setSortOption] = useState<SortOption>("distance-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const { location } = useDeviceLocation();
  const { locationEnabled } = useSettingsStore();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const {
    data,
    isPending,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery(getNotesQueryOptions(sortOption));

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

  const masonryColumns = useMemo(() => {
    if (!notes || notes.length === 0) return [[], []];

    const columns: [NoteWithDistance[], NoteWithDistance[]] = [[], []];

    notes.forEach((note, index) => {
      // Alternate between columns for balanced distribution
      const columnIndex = index % 2;
      columns[columnIndex].push(note);
    });

    return columns;
  }, [notes]);

  const renderNoteCard = (item: NoteWithDistance) => {
    const handleLongPress = async () => {
      if (item.quickCopy) {
        await Clipboard.setStringAsync(item.quickCopy);
        showSnackbar(`"${item.quickCopy}" has been copied to clipboard.`);
      }
    };

    return (
      <Pressable
        onPress={() => router.push(`/note/edit?id=${item.id}` as any)}
        onLongPress={handleLongPress}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" numberOfLines={2}>
              {item.title || "Untitled"}
            </Text>
            {item.content && (
              <Text variant="bodyMedium" numberOfLines={4} style={styles.content}>
                {item.content}
              </Text>
            )}
            {item.quickCopy && (
              <Chip icon="content-copy" style={styles.chip} compact>
                {item.quickCopy}
              </Chip>
            )}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.distance}>
                📍 {((item.distance as number) / 1000).toFixed(2)} km
              </Text>
              <Text variant="bodySmall" style={styles.coordinates}>
                {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
              </Text>
              {item.updated && (
                <Text variant="bodySmall" style={styles.updatedAt}>
                  Updated: {new Date(item.updated).toLocaleDateString()}{" "}
                  {new Date(item.updated).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  const renderColumn = (columnData: NoteWithDistance[], columnIndex: number) => {
    if (columnData.length === 0) {
      return <View style={styles.column} key={columnIndex} />;
    }

    return (
      <View style={styles.column} key={columnIndex}>
        <FlashList
          data={columnData}
          renderItem={({ item }) => renderNoteCard(item)}
          keyExtractor={(item: NoteWithDistance) => `${item.id}-${columnIndex}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (isPending) {
    return (
      <NotesScaffold
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}>
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
        setSortOption={setSortOption}>
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
        setSortOption={setSortOption}>
        <View style={styles.centerContainer}>
          <Text variant="titleLarge">No notes yet</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your first geo-note!
          </Text>
          <DebugDbPath />
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
      setSortOption={setSortOption}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        <View style={styles.masonryContainer}>
          {renderColumn(masonryColumns[0], 0)}
          {renderColumn(masonryColumns[1], 1)}
        </View>
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
  },
  masonryContainer: {
    flexDirection: "row",
    padding: CONTAINER_PADDING,
    gap: CARD_SPACING,
  },
  column: {
    flex: 1,
  },
  card: {
    marginBottom: CARD_SPACING,
    width: "100%",
  },
  content: {
    marginTop: 8,
  },
  chip: {
    marginTop: 8,
    alignSelf: "flex-start",
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
  updatedAt: {
    opacity: 0.6,
    fontSize: 9,
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
