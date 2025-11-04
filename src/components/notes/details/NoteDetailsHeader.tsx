import { Appbar, Menu } from "react-native-paper";

interface NoteDetailsHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  onDelete: () => void;
}

export function NoteDetailsHeader({
  onBack,
  onSave,
  isSaving,
  hasUnsavedChanges,
  menuVisible,
  setMenuVisible,
  onDelete,
}: NoteDetailsHeaderProps) {
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={onBack} />
      <Appbar.Content title="" />
      <Appbar.Action icon="check" onPress={onSave} disabled={isSaving || !hasUnsavedChanges} />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item leadingIcon="delete" onPress={onDelete} title="Delete" />
      </Menu>
    </Appbar.Header>
  );
}
