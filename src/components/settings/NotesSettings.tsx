import { useSettingsStore } from "@/store/settings-store";
import { StyleSheet } from "react-native";
import { Divider, List, Switch } from "react-native-paper";

export function NotesSettings() {
  const { locationEnabled, toggleLocationEnabled, quickCopyMode, setQuickCopyMode } =
    useSettingsStore();
  return (
    <List.Section>
      <List.Subheader style={[styles.listSubHeader]}>Notes Settings</List.Subheader>
      <List.Item
        title="Location Tracking"
        description="Automatically save location with notes"
        left={(props) => <List.Icon {...props} icon="map-marker" />}
        right={() => <Switch value={locationEnabled} onValueChange={toggleLocationEnabled} />}
      />
      <List.Item
        title="Quick Copy Mode"
        description={
          quickCopyMode === "title"
            ? "Auto-copy note title"
            : quickCopyMode === "phone"
            ? "Auto-detect phone numbers"
            : "Manual input"
        }
        left={(props) => <List.Icon {...props} icon="content-copy" />}
        onPress={() => {
          const modes: ("title" | "phone" | "manual")[] = ["manual", "title", "phone"];
          const currentIndex = modes.indexOf(quickCopyMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          setQuickCopyMode(nextMode);
        }}
      />
      <Divider />
    </List.Section>
  );
}

const styles = StyleSheet.create({
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
