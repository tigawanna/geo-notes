import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";

export default function LoginScreeen() {
  return (
    <Surface style={{ ...styles.container }}>
      <Text variant="titleLarge">login</Text>
      <Link href={{ pathname: "/(container)/(auth)/sign-up" }}>
        <Text variant="bodyMedium" style={{ marginTop: 20, color: "blue" }}>
          Go to Sign Up
        </Text>
      </Link>
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
