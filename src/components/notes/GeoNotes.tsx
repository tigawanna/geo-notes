import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { dummyNotes } from "./data";
import { NoteListItem } from "./NoteListItem";
import { GeoNoteSelect } from "@/lib/drizzle/schema";

export function GeoNotes() {
  const notes = dummyNotes as any as GeoNoteSelect[]
  const theme = useTheme();
  return (
    <FlashList
      style={styles.container}
      data={notes}
      masonry
      numColumns={2}
      renderItem={({ item }) => <NoteListItem item={item} theme={theme} />}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    // justifyContent:"flex-start",
    // marginBottom:50
    // backgroundColor: "#fff",
    // justifyContent: "center",
    // alignItems: "center",
  },
});
