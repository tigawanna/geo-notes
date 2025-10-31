import React from "react";
import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Text, useTheme, TextInput } from "react-native-paper";

export function KeyboardControllerExample() {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView style={{ flex: 1, width: "100%", height: "100%" }} behavior="padding">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text> KeyboardControllerExample </Text>
        <TextInput label="Type here" style={{ width: "100%", marginTop: 20 }} />
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
