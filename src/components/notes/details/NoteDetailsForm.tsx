import { useSettingsStore } from "@/store/settings-store";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

interface NoteDetailsFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  quickCopy: string;
  setQuickCopy: (quickCopy: string) => void;
}

export function NoteDetailsForm({
  title,
  setTitle,
  content,
  setContent,
  quickCopy,
  setQuickCopy,
}: NoteDetailsFormProps) {
  const theme = useTheme();
  const { quickCopyMode } = useSettingsStore();

  return (
    <>
      <TextInput
        mode="flat"
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
        placeholderTextColor={theme.colors.onSurfaceDisabled}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
      />

      <TextInput
        mode="flat"
        placeholder="Note content..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={20}
        style={styles.contentInput}
        placeholderTextColor={theme.colors.onSurfaceDisabled}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
      />

      <View style={styles.quickCopyContainer}>
        <Text variant="labelLarge" style={styles.quickCopyLabel}>
          Quick Copy
        </Text>
        <TextInput
          mode="outlined"
          placeholder={
            quickCopyMode === "title"
              ? "Auto: Uses title"
              : quickCopyMode === "phone"
                ? "Auto: Detects phone numbers"
                : "Manual input"
          }
          value={quickCopy}
          onChangeText={setQuickCopy}
          style={styles.quickCopyInput}
          right={
            quickCopy ? <TextInput.Icon icon="close" onPress={() => setQuickCopy("")} /> : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  contentInput: {
    fontSize: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    minHeight: 200,
    textAlignVertical: "top",
  },
  quickCopyContainer: {
    marginTop: 24,
    gap: 8,
  },
  quickCopyLabel: {
    marginBottom: 4,
  },
  quickCopyInput: {
    backgroundColor: "transparent",
  },
});
