import { SortOption } from "@/data-access-layer/notes-api";
import { Button, ContextMenu } from "@expo/ui/jetpack-compose";
import { useTheme } from "react-native-paper";

interface NotesContextMenuProps {
  isDualColumn: boolean;
  onToggleSelectionMode: () => void;
  onToggleColumnMode: () => void;
  setSortOption: (sort: SortOption) => void;
}

export function NotesContextMenu({
  isDualColumn,
  onToggleSelectionMode,
  onToggleColumnMode,
  setSortOption,
}: NotesContextMenuProps) {
  const theme = useTheme();
  return (
    <ContextMenu style={{}}>
      <ContextMenu.Trigger>
        <Button variant={"borderless"} style={{ minWidth: 30 }}>
          ☰
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Items>
        <Button
          leadingIcon="outlined.CheckCircle"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={onToggleSelectionMode}>
          Select All
        </Button>
        <Button
          leadingIcon="filled.Menu"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={onToggleColumnMode}>
          {isDualColumn ? "Single Column" : "Dual Column"}
        </Button>
        <Button
          leadingIcon="sharp.KeyboardArrowDown"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={() => setSortOption("recent-desc")}>
          Recent (Newest)
        </Button>
        <Button
          leadingIcon="sharp.KeyboardArrowUp"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={() => setSortOption("recent-asc")}>
          Recent (Oldest)
        </Button>
        <Button
          leadingIcon="filled.LocationOn"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={() => setSortOption("distance-asc")}>
          Distance (Closest)
        </Button>
        <Button
          leadingIcon="sharp.LocationOn"
          elementColors={{ contentColor: theme.colors.onSurface }}
          onPress={() => setSortOption("distance-desc")}>
          Distance (Farthest)
        </Button>
      </ContextMenu.Items>
    </ContextMenu>
  );
}
