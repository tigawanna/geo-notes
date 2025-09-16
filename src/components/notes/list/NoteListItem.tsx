import { GeoNoteSelect } from "@/lib/drizzle/schema";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, MD3Theme, Text } from "react-native-paper";
import { CustomChip } from "../../shared/ui/CustomChip";

interface NoteListItemProps {
  item: GeoNoteSelect;
  theme: MD3Theme;
  onPress?: () => void;
}

export function NoteListItem({ item, onPress, theme }: NoteListItemProps) {
  const { colors } = theme;
  const tags = item.tags?.split(",").filter(Boolean) || [];

  return (
    <Pressable style={[styles.container, { }]} onPress={onPress}>
      <Card
        style={{ height: "100%", backgroundColor: colors.surface }}
        elevation={4}>
        <Card.Content style={styles.content}>
          {item.title && (
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={2}>
              {item.title}
            </Text>
          )}

          <Text style={[styles.content, { color: colors.onSurfaceVariant }]} numberOfLines={4}>
            {item.content}
          </Text>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 2).map((tag, index) => (
                <CustomChip key={index} theme={theme}>
                  {tag.trim()}
                </CustomChip>
              ))}
              {tags.length > 2 && (
                <Text style={[styles.moreText, { color: colors.outline }]}>+{tags.length - 2}</Text>
              )}
            </View>
          )}

          {item?.priority && item?.priority > 0 && (
            <View style={[styles.priorityBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.priorityText, { color: colors.onPrimary }]}>!</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 4,
    height: "auto",
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
  },
  tag: {
    padding:0,
    fontSize: 10,
  },
  moreText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  priorityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
