import { AboutSettings } from "@/components/settings/AboutSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { BackupSettings } from "@/components/settings/BackupSettings";
import { NotesSettings } from "@/components/settings/NotesSettings";
import { ScrollView, StyleSheet } from "react-native";
import { Surface } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Surface style={{ flex: 1, paddingBottom: bottom }}>
      <ScrollView style={[styles.container]}>
        <AppearanceSettings />
        <NotesSettings />
        <BackupSettings />
        <AboutSettings />
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
