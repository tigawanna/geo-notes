import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View, Modal, Platform } from "react-native";
import { useTheme, AnimatedFAB, FAB, Surface } from "react-native-paper";
import { dummyNotes } from "./data";
import { NoteListItem } from "./NoteListItem";
import { GeoNoteSelect } from "@/lib/drizzle/schema";
import { useState } from "react";
import { CreateNotes } from "../form/CreateNotes";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";

export function GeoNotes() {
  const notes = dummyNotes as any as GeoNoteSelect[];
  const theme = useTheme();
  const [createModalOpen, setCreateNodalOpen] = useState(false);
  const { bottom, left, right, top } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Modal
        visible={createModalOpen}
        onRequestClose={() => setCreateNodalOpen(false)}
        presentationStyle="pageSheet"
        animationType="slide"
        style={{ maxHeight: "90%", width: "100%" }}>
        <Surface
          style={{
            maxHeight: "100%",
            flex: 1,
            width: "100%",
            paddingTop: top,
            paddingBottom: bottom,
            paddingLeft: left,
            paddingRight: right,
          }}>
          <CreateNotes />
        </Surface>
      </Modal>
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
        onPress={() => {
          setCreateNodalOpen(true);
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
