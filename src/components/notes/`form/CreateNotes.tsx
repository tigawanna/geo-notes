import { createNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useMutation } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { NotesForm } from "./NotesForm";

export function CreateNotes() {
  const { mutate,isPending } = useMutation(createNoteMutationFunction);
  return (
    <View style={styles.container}>
      <Text> Create Notes </Text>
      <NotesForm
        mutator={(payload) => {
          mutate({ payload });
        }}
        isSubmitting={isPending}
      />
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
