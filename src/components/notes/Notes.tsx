import { getNotesQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export function Notes() {
  const [sortBy, setSortBy] = useState<"distance" | "title">("distance");
  const {
    data,
    isPending,
    error: queryError,
  } = useQuery(getNotesQueryOptions(sortBy === "distance"));
  return (
    <View style={{ ...styles.container }}>
      <Text variant="titleLarge">Notes</Text>
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
