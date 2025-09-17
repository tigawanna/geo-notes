import { createNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useMutation } from "@tanstack/react-query";
import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Text } from "react-native-paper";
import { NotesForm } from "./NotesForm";

export function CreateNotes() {
  const { mutate, isPending } = useMutation(createNoteMutationFunction);
  return (
    <View style={styles.container}>
      <Text> Create Notes </Text>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", flexDirection: "column", justifyContent: "center" }}
        behavior="padding"
        enabled
        keyboardVerticalOffset={10}
        >
        <NotesForm
          mutator={(payload) => {
            mutate({ payload });
          }}
          isSubmitting={isPending}
        />
      </KeyboardAvoidingView>
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
