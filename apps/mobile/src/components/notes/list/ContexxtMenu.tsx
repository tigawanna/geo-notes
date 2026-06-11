import { SortOption } from "@/data-access-layer/notes-api";
import menuIcon from "@expo/material-symbols/menu.xml";
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Icon,
  IconButton,
  Text,
} from "@expo/ui/jetpack-compose";
import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const contentColor = theme.colors.onSurface;

  const dismiss = () => setIsExpanded(false);

  return (
    <Host matchContents>
      <DropdownMenu expanded={isExpanded} onDismissRequest={dismiss}>
        <DropdownMenu.Trigger>
          <IconButton onClick={() => setIsExpanded(true)}>
            <Icon
              source={menuIcon}
              size={24}
              tint={contentColor}
              contentDescription="Notes menu"
            />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              onToggleSelectionMode();
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>Select All</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              onToggleColumnMode();
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>
                {isDualColumn ? "Single Column" : "Dual Column"}
              </Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              setSortOption("recent-desc");
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>Recent (Newest)</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              setSortOption("recent-asc");
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>Recent (Oldest)</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              setSortOption("distance-asc");
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>Distance (Closest)</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              dismiss();
              setSortOption("distance-desc");
            }}>
            <DropdownMenuItem.Text>
              <Text color={contentColor}>Distance (Farthest)</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
