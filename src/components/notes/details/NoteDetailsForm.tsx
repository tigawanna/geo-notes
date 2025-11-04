import { useSettingsStore } from "@/store/settings-store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";

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
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyQuickCopy = async () => {
    if (quickCopy.trim()) {
      await Clipboard.setStringAsync(quickCopy);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

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

      <View style={[styles.sectionDivider, { backgroundColor: theme.colors.outlineVariant }]} />

      <View style={styles.quickCopyContainer}>
        <View style={styles.quickCopyHeader}>
          <Text variant="titleSmall" style={styles.quickCopyLabel}>
            ⚡ Quick Copy
          </Text>
          <Text variant="bodySmall" style={[styles.quickCopyHint, { color: theme.colors.onSurfaceVariant }]}>
            {quickCopyMode === "title"
              ? "Auto-fills with title"
              : quickCopyMode === "phone"
                ? "Auto-detects phone numbers"
                : "Manual input"}
          </Text>
        </View>
        <TextInput
          mode="outlined"
          placeholder="Enter quick copy text..."
          value={quickCopy}
          onChangeText={setQuickCopy}
          style={styles.quickCopyInput}
          right={
            <View style={styles.iconContainer}>
              {quickCopy ? (
                <>
                  <IconButton
                    icon={copyFeedback ? "check" : "content-copy"}
                    size={20}
                    onPress={handleCopyQuickCopy}
                    style={styles.iconButton}
                    iconColor={copyFeedback ? theme.colors.primary : undefined}
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setQuickCopy("")}
                    style={styles.iconButton}
                  />
                </>
              ) : null}
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  contentInput: {
    fontSize: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    minHeight: 200,
    textAlignVertical: "top",
  },
  sectionDivider: {
    height: 1,
    marginVertical: 16,
  },
  quickCopyContainer: {
    marginTop: 8,
    gap: 12,
  },
  quickCopyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  quickCopyLabel: {
    fontWeight: "600",
  },
  quickCopyHint: {
    fontStyle: "italic",
    fontSize: 12,
  },
  quickCopyInput: {
    backgroundColor: "transparent",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    margin: 0,
  },
});
