import { logger } from "@/utils/logger";
import * as DocumentPicker from 'expo-document-picker';
import { router } from "expo-router";
import { List } from "react-native-paper";

export function NotesJSONImport() {
  const handleImportPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;

      // Navigate to the import screen with the file URI
      router.push({
        pathname: "/(container)/(drawer)/import-notes",
        params: { fileUri }
      });
    } catch (error) {
      logger.error("Error picking file:", error);
    }
  };

  return (
    <List.Item
      title="Import from JSON"
      description="Import notes from a JSON file"
      left={(props) => <List.Icon {...props} icon="file-import" />}
      onPress={handleImportPress}
    />
  );
}
