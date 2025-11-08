import { SortOption } from "@/data-access-layer/notes-api";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { IconButton, useTheme } from "react-native-paper";
import { MaterialCommunityIcon } from "../../default/ui/icon-symbol";

interface SortMenuProps {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  sortOption: SortOption;
  onSortSelect: (sort: SortOption) => void;
}

export function SortMenu({ visible, onOpen, onClose, sortOption, onSortSelect }: SortMenuProps) {
  const { colors } = useTheme();

  const menuItems = [
    { value: "recent-desc" as SortOption, label: "Recent (Newest)" },
    { value: "recent-asc" as SortOption, label: "Recent (Oldest)" },
    { value: "distance-asc" as SortOption, label: "Distance (Closest)", hasDivider: true },
    { value: "distance-desc" as SortOption, label: "Distance (Farthest)" },
  ];

  return (
    <Menu
      visible={visible}
      onRequestClose={onClose}
      style={{
        top: "10%",
        backgroundColor: colors.surface,
      }}
      anchor={<IconButton icon="sort" onPress={onOpen} size={24} />}>
      {menuItems.map((item, index) => (
        <div key={item.value}>
          {item.hasDivider && <MenuDivider />}
          <MenuItem
            onPress={() => onSortSelect(item.value)}
            textStyle={
              sortOption === item.value
                ? { fontWeight: "bold", color: colors.primary }
                : { color: colors.onSurface }
            }
            pressColor={colors.primaryContainer}>
            {sortOption === item.value && (
              <MaterialCommunityIcon
                name="check"
                color={colors.primary}
                style={{ marginRight: 8 }}
                size={18}
              />
            )}
            {item.label}
          </MenuItem>
        </div>
      ))}
    </Menu>
  );
}
