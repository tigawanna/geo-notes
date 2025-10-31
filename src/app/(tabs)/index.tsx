import { KeyboardControllerExample } from "@/components/keyboard/KeyboardControllerExample";
import { Surface, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: top }}>
      <Text>Home Screen</Text>
      <KeyboardControllerExample />
    </Surface>
  );
}
