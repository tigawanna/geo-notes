import { GeoNoteSelect } from "@/lib/drizzle/schema";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { NotesForm } from "./NotesForm";

interface SingleNoteViewProps {
  existingNote?: GeoNoteSelect | null;
}
export function SingleNoteView({ existingNote }: SingleNoteViewProps) {
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", flexDirection: "column", justifyContent: "center" }}
        behavior="padding"
        enabled
        keyboardVerticalOffset={10}>
        <NotesForm existingNote={existingNote} />
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
