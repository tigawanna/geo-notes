import React from "react";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

interface NoteDeletionDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function NoteDeletionDialog({
  visible,
  onDismiss,
  onConfirmDelete,
  isDeleting,
}: NoteDeletionDialogProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Delete Note</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to delete this note? This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirmDelete} loading={isDeleting} textColor={theme.colors.error}>
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
