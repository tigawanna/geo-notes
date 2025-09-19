import { GeoNoteSelect } from "@/lib/drizzle/schema";
import { StyleSheet, View } from "react-native";
import { NotesForm } from "./NotesForm";

interface SingleNoteViewProps {
  existingNote?: GeoNoteSelect | null;
}
export function SingleNoteView({ existingNote }: SingleNoteViewProps) {
  return (
    <View style={styles.container}>
      <NotesForm existingNote={existingNote} />
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
