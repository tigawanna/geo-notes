import { useDeviceLocation } from "@/hooks/use-device-location";
import { db } from "@/lib/drizzle/client";
import { notes } from "@/lib/drizzle/schema";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { like, sql } from "drizzle-orm";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

const dummynotes = [
  {
    id: "test-id-1",
    title: "Roysambu",
    location: createGeoJSONPoint({
      latitude: -1.2400852818374801,
      longitude: 36.856269863732166,
    }),
  },
  {
    id: "test-id-2",
    title: "here + 1",
    location: createGeoJSONPoint({
      latitude: -1.1685492689264407,
      longitude: 36.80417940213238,
    }),
  },
  {
    id: "test-id-3",
    title: "here + 2",
    location: createGeoJSONPoint({
      latitude: -1.1621041964008612,
      longitude: 36.80343247716189,
    }),
  },
  {
    id: "test-id-4",
    title: "here",
    location: createGeoJSONPoint({
      latitude: -1.1720269,
      longitude: 36.8053729,
    }),
  },
  {
    id: "test-id-5",
    title: "here + 3",
    location: createGeoJSONPoint({
      latitude: -1.1567809888429963,
      longitude: 36.80348674376367,
    }),
  },
];

export function TestQueries() {
  const { location } = useDeviceLocation();
  const lat = location?.coords.latitude || -1.2921;
  const lng = location?.coords.longitude || 36.8219;
  const nairobiGeoJSON = `{"type":"Point","coordinates":[${lng},${lat}]}`;
  const query = useQuery({
    queryKey: ["test-queries"],
    queryFn: async () => {
      const res = await db
        .select({
          id: notes.id,
          title: notes.title,
          distance_km: sql`ST_Distance(${notes.location}, GeomFromGeoJSON(${nairobiGeoJSON}))`.as(
            "distance_km"
          ),
        })
        .from(notes)
        .where(like(notes.id, "test-id%"))
        .orderBy(sql`distance_km ASC`);
      return res;
    },
  });

  const insertMutation = useMutation({
    mutationFn: async () => {
      const res = db.insert(notes).values(dummynotes);
      return res;
      //   const deleteRes = await db.delete(notes).where(like(notes.id, "test-id%"));
    },
    meta: { invalidates: [["test-queries"]] },
  });
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = db.delete(notes).where(like(notes.id, "test-id%"));
      return res;
    },
    meta: { invalidates: [["test-queries"]] },
  });

  const data = query.data ? JSON.stringify(query.data, null, 2) : "No data";
  return (
    <ScrollView style={{ ...styles.container }}>
      <Text variant="bodySmall">{data}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
        <Button
          mode="contained"
          loading={query.isPending || query.isFetching}
          onPress={() => {
            query.refetch();
          }}>
          reload
        </Button>
        <Button
          mode="contained"
          loading={insertMutation.isPending}
          onPress={() => {
            insertMutation.mutate();
          }}>
          Insert
        </Button>
        <Button
          mode="contained"
          loading={deleteAllMutation.isPending}
          onPress={() => {
            deleteAllMutation.mutate();
          }}>
          Delete All
        </Button>
      </View>
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
