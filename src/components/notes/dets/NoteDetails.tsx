import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function NoteDetails() {
  const { bottom, top } = useSafeAreaInsets();
  return (
    <View style={{ ...styles.container, paddingBottom: bottom, paddingTop: top }}>
      <Text variant="titleLarge">NoteDetails</Text>
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
