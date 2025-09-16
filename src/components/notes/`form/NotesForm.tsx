import { View,StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export function NotesForm() {
    
  return (
    <View style={styles.container}>
      <Text> NotsForm </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
