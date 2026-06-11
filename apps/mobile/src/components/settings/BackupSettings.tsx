import { StyleSheet } from "react-native";
import { Divider, List } from "react-native-paper";
import { DatabaseExport } from "./backup/DatabaseExport";
import { DatabaseImport } from "./backup/DatabaseImport";
import { NotesJSONExport } from "./backup/NotesJSONExport";

export function BackupSettings() {
  return (
    <List.Section>
      <List.Subheader style={[styles.listSubHeader]}>Backup & Restore</List.Subheader>
      <DatabaseExport />
      <DatabaseImport />
      <Divider />
      <NotesJSONExport />
    </List.Section>
  );
}

const styles = StyleSheet.create({
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
