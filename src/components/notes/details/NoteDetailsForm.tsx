import { useSettingsStore } from "@/store/settings-store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, IconButton, Portal, RadioButton, Text, TextInput, useTheme } from "react-native-paper";

interface NoteDetailsFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  quickCopy: string;
  setQuickCopy: (quickCopy: string) => void;
  updatedAt?: string | null;
  noteQuickCopyMode?: "title" | "phone" | "manual" | null;
  onQuickCopyModeChange: (mode: "title" | "phone" | "manual" | null) => void;
}

export function NoteDetailsForm({
  title,
  setTitle,
  content,
  setContent,
  quickCopy,
  setQuickCopy,
  updatedAt,
  noteQuickCopyMode,
  onQuickCopyModeChange,
}: NoteDetailsFormProps) {
  const theme = useTheme();
  const { quickCopyMode: globalQuickCopyMode } = useSettingsStore();
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);
  const [tempQuickCopyMode, setTempQuickCopyMode] = useState<string>(noteQuickCopyMode ?? "");

  // Use note-specific mode if set, otherwise use global mode
  const effectiveQuickCopyMode = noteQuickCopyMode ?? globalQuickCopyMode;

  const handleCopyQuickCopy = async () => {
    if (quickCopy.trim()) {
      await Clipboard.setStringAsync(quickCopy);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleOpenSettings = () => {
    setTempQuickCopyMode(noteQuickCopyMode ?? "");
    setSettingsDialogVisible(true);
  };

  const handleSaveSettings = () => {
    const mode = tempQuickCopyMode === "" ? null : (tempQuickCopyMode as "title" | "phone" | "manual");
    onQuickCopyModeChange(mode);
    setSettingsDialogVisible(false);
  };

  const handleCancelSettings = () => {
    setTempQuickCopyMode(noteQuickCopyMode ?? "");
    setSettingsDialogVisible(false);
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
        cursorColor={theme.colors.primary}
        selectionColor={theme.colors.inversePrimary}
      />

      {updatedAt && (
        <Text variant="labelSmall" style={[styles.updatedText, { color: theme.colors.onSurfaceVariant }]}>
          Last updated {new Date(updatedAt).toLocaleString()}
        </Text>
      )}

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
        cursorColor={theme.colors.primary}
        selectionColor={theme.colors.inversePrimary}
      />

      <View style={[styles.sectionDivider, { backgroundColor: theme.colors.outlineVariant }]} />

      <View style={styles.quickCopyContainer}>
        <View style={styles.quickCopyHeader}>
          <Text variant="titleSmall" style={styles.quickCopyLabel}>
            ⚡ Quick Copy
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="cog"
              size={16}
              onPress={handleOpenSettings}
              style={styles.settingsButton}
            />
            <Text
              variant="bodySmall"
              style={[styles.quickCopyHint, { color: theme.colors.onSurfaceVariant }]}>
              {effectiveQuickCopyMode === "title"
                ? "Auto-fills with title"
                : effectiveQuickCopyMode === "phone"
                ? "Auto-detects phone numbers"
                : "Manual input"}
              {noteQuickCopyMode && " (Note-specific)"}
            </Text>
          </View>
        </View>
        <TextInput
          mode="outlined"
          placeholder="Enter quick copy text..."
          value={quickCopy}
          onChangeText={setQuickCopy}
          style={styles.quickCopyInput}
          cursorColor={theme.colors.primary}
          selectionColor={theme.colors.primary}
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

      <Portal>
        <Dialog visible={settingsDialogVisible} onDismiss={handleCancelSettings}>
          <Dialog.Title>Quick Copy Settings</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogDescription}>
              Choose how Quick Copy should work for this note:
            </Text>
            <RadioButton.Group onValueChange={setTempQuickCopyMode} value={tempQuickCopyMode}>
              <View style={styles.radioOption}>
                <RadioButton value="" />
                <View style={styles.radioContent}>
                  <Text variant="bodyLarge" style={styles.radioTitle}>Use Global Setting</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Follow the app-wide quick copy preference
                  </Text>
                </View>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="manual" />
                <View style={styles.radioContent}>
                  <Text variant="bodyLarge" style={styles.radioTitle}>Manual Input</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Enter custom text to copy
                  </Text>
                </View>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="title" />
                <View style={styles.radioContent}>
                  <Text variant="bodyLarge" style={styles.radioTitle}>Auto-fill with Title</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Automatically uses the note title
                  </Text>
                </View>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="phone" />
                <View style={styles.radioContent}>
                  <Text variant="bodyLarge" style={styles.radioTitle}>Auto-detect Phone Numbers</Text>
                  <Text variant="bodySmall" style={styles.radioDescription}>
                    Finds and copies phone numbers from content
                  </Text>
                </View>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelSettings}>Cancel</Button>
            <Button onPress={handleSaveSettings}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  updatedText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
    fontStyle: "italic",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickCopyLabel: {
    fontWeight: "600",
  },
  settingsButton: {
    margin: 0,
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
  dialogDescription: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 12,
  },
  radioContent: {
    flex: 1,
    gap: 4,
  },
  radioTitle: {
    fontWeight: "500",
  },
  radioDescription: {
    opacity: 0.7,
  },
});
