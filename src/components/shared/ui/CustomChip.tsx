import { View, StyleSheet } from "react-native";
import { MD3Theme, Text } from "react-native-paper";

interface CustomChipProps {
  theme: MD3Theme;
  children: string;
}
export function CustomChip({ theme, children }: CustomChipProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.elevation.level5 }]}>
      <Text style={styles.label}> {children} </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding:2
  },
  label: {
    fontSize: 10,
  },
});
