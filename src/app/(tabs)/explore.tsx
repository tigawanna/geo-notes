import { Surface, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();
  return (
    <Surface style={{ flex: 1, paddingTop: top, justifyContent: "center", alignItems: "center" }}>
      <Text>Explore</Text>
    </Surface>
  );
}
