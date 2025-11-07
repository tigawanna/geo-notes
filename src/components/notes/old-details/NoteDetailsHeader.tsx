import { Appbar, Menu, Tooltip } from "react-native-paper";

interface NoteDetailsHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  onDelete: () => void;
  onQuickCopy: () => void;
  hasQuickCopy: boolean;
}

export function NoteDetailsHeader({
  onBack,
  onSave,
  isSaving,
  hasUnsavedChanges,
  menuVisible,
  setMenuVisible,
  onDelete,
  onQuickCopy,
  hasQuickCopy,
}: NoteDetailsHeaderProps) {
  return (
    <Appbar.Header elevated>
      <Appbar.BackAction onPress={onBack} />
      <Appbar.Content title="" />
      {hasUnsavedChanges && (
        <Tooltip title="You have unsaved changes">
          <Appbar.Action icon="circle" size={8} color="orange" disabled />
        </Tooltip>
      )}
      <Tooltip title="Quick copy">
        <Appbar.Action 
          icon="content-copy" 
          onPress={onQuickCopy} 
          disabled={!hasQuickCopy}
        />
      </Tooltip>
      <Tooltip title={hasUnsavedChanges ? "Save changes" : "No changes to save"}>
        <Appbar.Action 
          icon="check" 
          onPress={onSave} 
          disabled={isSaving || !hasUnsavedChanges}
          animated
        />
      </Tooltip>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item leadingIcon="delete" onPress={onDelete} title="Delete Note" />
      </Menu>
    </Appbar.Header>
  );
}
