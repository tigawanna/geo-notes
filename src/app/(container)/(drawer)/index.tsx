import { TestQueries } from "@/components/debug/TestQueries";
import { Notes } from "@/components/notes/Notes";
import { Surface } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <Surface
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: top + 10,
        paddingBottom: bottom,
      }}>
        {/* <TestQueries/> */}
      <Notes />
    </Surface>
  );
}
