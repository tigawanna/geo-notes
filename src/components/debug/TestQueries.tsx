import { db } from "@/lib/drizzle/client";
import { useMutation } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { notes } from "@/lib/drizzle/schema";
export function TestQueries() {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = db.select().from(notes);
        return res;
    },
  });

  const data = mutation.data ? JSON.stringify(mutation.data, null, 2) : "No data";
  return (
    <ScrollView style={{ ...styles.container }}>
      <Text variant="bodySmall">{data}</Text>
      <Button
        mode="contained"
        loading={mutation.isPending}
        onPress={() => {
          mutation.mutate();
        }}>
        Trigger Mutation
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingHorizontal: 20,
    // justifyContent: "center",
    // alignItems: "center",
  },
});
