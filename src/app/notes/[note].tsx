import { SingleNoteView } from "@/components/notes/form/SingleNoteView";
import { getNoteByIdQueryOptions } from "@/data-access-layer/query.-notes";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { Surface } from "react-native-paper";

export default function SingleNote() {
  const { note } = useLocalSearchParams();
  const { data } = useQuery(getNoteByIdQueryOptions({ id: Number(note) }));
  return (
    <Surface style={{ ...styles.container }}>
      <SingleNoteView existingNote={data?.result} />
    </Surface>
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
