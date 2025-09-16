import { GeoNotes } from "@/components/notes/GeoNotes";
import { Surface,Text } from "react-native-paper";

export default function HomeScreen() {
  return (
    <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <GeoNotes />
    </Surface>
  );
}
