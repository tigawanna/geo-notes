import { EditNote } from "@/components/notes/EditNote";
import { Surface } from "react-native-paper";
import { StyleSheet } from "react-native";

export default function EditNoteScreen() {
  return (
    <Surface style={styles.container}>
      <EditNote />
    </Surface>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
