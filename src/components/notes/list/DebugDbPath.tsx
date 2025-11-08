import { backupDatabase } from "@/lib/op-sqlite/backup";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export function DebugDbPath() {
  const hnadleClicked = () => {
    backupDatabase()
  };
  return (
    <View style={{ ...styles.container }}>
      <Text variant="titleLarge">DebugDbPath</Text>
      <Button onPress={() => hnadleClicked()} mode="contained">
        tap
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
