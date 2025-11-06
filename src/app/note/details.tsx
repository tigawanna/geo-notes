import { NoteDetails } from "@/components/notes/details/NoteDetails";
import { StyleSheet } from "react-native";
import { Surface } from "react-native-paper";

export default function NoteDetailsScreen() {
  return (
    <Surface style={styles.container}>
      <NoteDetails />
    </Surface>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
