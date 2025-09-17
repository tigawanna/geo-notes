import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View, Modal, Platform } from "react-native";
import { useTheme, AnimatedFAB, FAB, Surface } from "react-native-paper";
import { dummyNotes } from "./data";
import { NoteListItem } from "./NoteListItem";
import { GeoNoteSelect } from "@/lib/drizzle/schema";
import { createNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useSnackbarStore } from "@/lib/react-native-paper/snackbar/global-snackbar-store";

export function GeoNotes() {
  const notes = dummyNotes as any as GeoNoteSelect[];
  const theme = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbarStore();
  const { mutate, isPending, data } = useMutation({
    ...createNoteMutationFunction,
    onSuccess(data, variables, onMutateResult, context) {
      if (data.error) {
        return showSnackbar(data.error, { duration: 5000 });
      }
      if (data.result) {
        router.push(`/notes/${data.result}`);
      }
    },
  });

  return (
    <View style={styles.container}>
      <FlashList
        style={styles.container}
        data={notes}
        masonry
        numColumns={2}
        renderItem={({ item }) => (
          <NoteListItem item={item} theme={theme} onPress={() => console.log("Pressed")} />
        )}
      />
      <FAB
        icon={"plus"}
        onPress={async () => {
          mutate({
            payload: {
              title: "Untitled",
            },
          });
        }}
        style={[
          {
            bottom: 16,
            right: 16,
            position: "absolute",
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
});
