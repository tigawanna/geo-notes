# Scaffold Pattern for List Components

This example demonstrates the **scaffold pattern** for building list components with consistent UI elements across all states (loading, error, empty, and success).

## Why Use This Approach?

The scaffold pattern ensures that **search bars, filters, and navigation controls remain visible at all times**, providing a better user experience by:

1. **Consistent UX**: Users can search and filter even when data is loading or if there's an error
2. **Reduced Layout Shift**: No jarring transitions between different states
3. **Always Accessible**: Critical UI controls are never hidden behind loading states
4. **Better Performance Perception**: Users can interact with the interface while waiting for data
5. **Error Recovery**: Users can modify their search/filters even when an error occurs

## Implementation Pattern

- Create a `{ComponentName}Scaffold` wrapper that renders persistent UI elements
- Pass state management (search, filters) through props to the scaffold
- Wrap all conditional rendering (loading/error/empty/success) inside the scaffold
- The scaffold always renders first, with conditional content as children

```tsx
import { EmptyRoadSVG } from "@/components/shared/svg/empty";
import { LoadingIndicatorDots } from "@/components/state-screens/LoadingIndicatorDots";
import { pb } from "@/lib/pb/client";
import { getUserWatchlistQueryOptions } from "@/lib/tanstack/operations/watchlist/operations-options";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Searchbar, Text, useTheme } from "react-native-paper";
import { useWatchlistSearch } from "./hooks";
import { WatchlistGrid } from "./WatchListgrid";
import { useResponsiveListView } from "@/hooks/useWebCompatibleListView";

interface WatchlistProps {
  community?: boolean;
}
export function Watchlist({ community }: WatchlistProps) {
  const userId = community ? undefined : pb.authStore?.record?.id;
  const { searchQuery } = useWatchlistSearch();
  const { columns, orientation, setOrientation, isLoadingOrientation } = useResponsiveListView({
    key: "user-watchlist",
    minItemWidth: 380, // Wider cards for watchlist info
    maxColumns: 5, // Max 3 columns for readability
    padding: 32,
  });
  
  const { data, isLoading, error, isRefetching, refetch } = useQuery(
    getUserWatchlistQueryOptions({ keyword: searchQuery, userId })
  );
  const { colors } = useTheme();
  // console.log("watchlist data", data);
  if (isLoading || isLoadingOrientation) {
    return (
      <WatchlistlistScaffold>
        <View style={styles.statesContainer}>
          <LoadingIndicatorDots />
        </View>
      </WatchlistlistScaffold>
    );
  }
  if (error) {
    return (
      <WatchlistlistScaffold>
        <View style={styles.statesContainer}>
          {__DEV__ ? (
            <View>
              <Text variant="titleMedium" style={{ color: colors.error }}>
                Failed to load
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: colors.onSurfaceVariant, marginTop: 8 }}
              >
                {error instanceof Error ? error.message : "Unknown error"}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <EmptyRoadSVG />
              </View>
              <Text
                variant="headlineSmall"
                style={[styles.emptyTitle, { color: colors.onSurface }]}
              >
                Something went wrong
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.emptySubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Try adjusting your filters or search terms to discover more
                content
              </Text>
            </View>
          )}
        </View>
      </WatchlistlistScaffold>
    );
  }
  if (!data) {
    return (
      <WatchlistlistScaffold>
        <View style={styles.statesContainer}>
          {__DEV__ ? (
            <View>
              <Text variant="titleMedium" style={{ color: colors.error }}>
                No watchlist found
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <EmptyRoadSVG />
              </View>
              <Text
                variant="headlineSmall"
                style={[styles.emptyTitle, { color: colors.onSurface }]}
              >
                No watchlist found
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.emptySubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Try adjusting your filters or search terms to discover more
                content
              </Text>
            </View>
          )}
        </View>
      </WatchlistlistScaffold>
    );
  }
  return (
    <WatchlistlistScaffold>
      <WatchlistGrid
        watchListResult={data}
        refetch={refetch}
        isRefetching={isRefetching}
        columns={columns}
        orientation={orientation}
        setOrientation={setOrientation}
      />
    </WatchlistlistScaffold>
  );
}

interface WatchlistlistScaffoldProps {
  children: React.ReactNode;
}

// this should wrap the list loading and error states to ensure the search bar and/or filters totte is displayed at all times
export function WatchlistlistScaffold({
  children,
}: WatchlistlistScaffoldProps) {
  const { colors } = useTheme();
  const { searchQuery, setSearchQuery } = useWatchlistSearch();
  const { width } = useWindowDimensions();
  return (
    <View style={{ ...styles.scaffoldContainer }}>
      <Searchbar
        placeholder="Search Watchlist"
        onChangeText={(term) => setSearchQuery(term)}
        value={searchQuery}
        style={[styles.searchBar, { width: width * 0.95 }]}
        inputStyle={styles.searchInput}
        iconColor={colors.onSurfaceVariant}
        placeholderTextColor={colors.onSurfaceVariant}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scaffoldContainer: {
    flex: 1,
    width: "100%",
  },
  statesContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
    width: "100%",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  emptyIconContainer: {
    opacity: 0.6,
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  emptySubtitle: {
    textAlign: "center",
    opacity: 0.8,
    maxWidth: 280,
    lineHeight: 20,
  },
});
```
