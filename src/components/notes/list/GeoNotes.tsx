import { getNotesByLocationQueryOptions } from "@/data-access-layer/query.-notes";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { NewGeoNoteTrigger } from "./NewGeoNoteTrigger";
import { NoteListItem } from "./NoteListItem";

export function GeoNotes() {
  const theme = useTheme();
  const router = useRouter();
  const { location } = useDeviceLocation();
  const { data } = useInfiniteQuery(
    getNotesByLocationQueryOptions({
      location: {
        lat: location?.coords.latitude ?? 0,
        lng: location?.coords.longitude ?? 0,
      },
    })
  );
  const notes = data?.pages?.flatMap((page) => page.result) ?? [];
  return (
    <View style={styles.container}>
      <FlashList
        style={styles.container}
        data={notes}
        masonry
        numColumns={2}
        renderItem={({ item }) => (
          <NoteListItem
            item={item}
            theme={theme}
            onPress={() => {
              router.push(`/notes/${item.id}`);
            }}
          />
        )}
      />
      <NewGeoNoteTrigger />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
});
