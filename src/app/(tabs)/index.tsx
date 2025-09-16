import { GeoNotes } from "@/components/notes/list/GeoNotes";
import { Surface } from "react-native-paper";

export default function HomeScreen() {
  return (
    <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <GeoNotes />
    </Surface>
  );
}
