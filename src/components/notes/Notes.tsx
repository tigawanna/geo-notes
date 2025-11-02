import { createNotesMutationOptions, getNotesQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import type { TNote } from "@/lib/drizzle/schema";
import { useSettingsStore } from "@/store/settings-store";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, FAB, Text, useTheme } from "react-native-paper";

const CARD_SPACING = 8;
const CONTAINER_PADDING = 8;

interface NoteWithDistance extends TNote {
  latitude: string;
  longitude: string;
  distance: number;
}

export function Notes() {
  const [sortBy, setSortBy] = useState<"distance" | "title">("distance");
  const queryClient = useQueryClient();
  const { location } = useDeviceLocation();
  const { locationEnabled } = useSettingsStore();
  const theme = useTheme();

  const {
    data,
    isPending,
    error: queryError,
  } = useQuery(getNotesQueryOptions(sortBy === "distance"));

  const createNoteMutation = useMutation({
    ...createNotesMutationOptions,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Navigate to edit screen with the newly created note ID
      if (result.result) {
        router.push(`/note/edit?id=${result.result}` as any);
      }
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
    return (data?.result || []) as NoteWithDistance[];
  }, [data?.result]);

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
    return (
      <Pressable onPress={() => router.push(`/note/edit?id=${item.id}` as any)}>
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading notes...
        </Text>
      </View>
    );
  }

  if (queryError) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleMedium" style={styles.errorText}>
          Error loading notes
        </Text>
        <Text variant="bodyMedium">{queryError.message}</Text>
      </View>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge">Notes ({notes.length})</Text>
        <Button
          mode={sortBy === "distance" ? "contained" : "outlined"}
          onPress={() => setSortBy(sortBy === "distance" ? "title" : "distance")}
          compact
        >
          Sort by {sortBy === "distance" ? "Distance" : "Title"}
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  centerContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
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
});
