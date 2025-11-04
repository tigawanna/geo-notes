import { MaterialCommunityIcon, MaterialIcon } from "@/components/default/ui/icon-symbol";
import { AppLogoSvg } from "@/components/shared/svg/AppLogoSvg";
import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
import { useFilterStore } from "@/store/filter-store";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useQuery } from "@tanstack/react-query";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Divider, Text, useTheme } from "react-native-paper";
// import { useDeviceLocation } from "@/hooks/use-device-location";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { data: tags } = useQuery(tagsQueryOptions);
  const { selectedTagId, setSelectedTagId } = useFilterStore();

  const handleTagPress = (tagId: string) => {
    // Toggle tag filter - if already selected, clear it; otherwise select it
    if (selectedTagId === tagId) {
      setSelectedTagId(null);
    } else {
      setSelectedTagId(tagId);
    }
    // Close drawer after selection
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingTop: 30, // Extra top padding for status bar
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.outline,
          marginBottom: 20,
        }}>
        <AppLogoSvg width={40} height={40} />
        <Text
          variant="titleLarge"
          style={{
            marginLeft: 12,
            color: colors.onSurface,
            fontWeight: "bold",
          }}>
          Geo Notes
        </Text>
      </View>
      <DrawerItemList {...props} />

      {/* Tags Section */}
      <Divider style={[styles.divider, { backgroundColor: colors.primary }]} />
      <View style={styles.tagsSection}>
        <Text variant="titleSmall" style={styles.tagsSectionTitle}>
          Quick Tags
        </Text>
        {selectedTagId && (
          <View style={[styles.clearFilterContainer, { backgroundColor: colors.primaryContainer }]}>
            <Text
              variant="bodySmall"
              style={[styles.filteringText, { color: colors.onPrimaryContainer }]}>
              Filtering by: {tags?.find((t) => t.id === selectedTagId)?.name || "Unknown"}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.clearFilterText, { color: colors.primary }]}
              onPress={() => {
                setSelectedTagId(null);
                props.navigation.closeDrawer();
              }}>
              Clear Filter
            </Text>
          </View>
        )}
        {tags && tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 8).map((tag, index) => (
              <View
                key={tag.id}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: colors.elevation.level3,
                    borderColor: selectedTagId === tag.id ? colors.primary : "transparent",
                  },
                ]}
                onTouchEnd={() => handleTagPress(tag.id)}>
                <View style={[styles.colorDot, { backgroundColor: tag.color || colors.primary }]} />
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTagId === tag.id && { color: colors.primary },
                  ]}>
                  {tag.name}
                </Text>
                {selectedTagId === tag.id && (
                  <MaterialCommunityIcon
                    name="check"
                    size={14}
                    color={colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text variant="bodySmall" style={styles.noTagsText}>
            No tags yet. Create tags to organize your notes.
          </Text>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { colors } = useTheme();
  // useDeviceLocation();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: colors.primary,
          headerStyle: {
            backgroundColor: colors.surface,
            borderBottomWidth: 0,
          },
          drawerStyle: {
            backgroundColor: colors.surface,
          },

          headerTintColor: colors.onSurface,
        }}>
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcon size={size} name="home-map-marker" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: true,
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialIcon size={size} name="settings" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="tags"
          options={{
            title: "Manage Tags",
            headerShown: true,
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcon size={size} name="tag-multiple" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: 12,
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagsSectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.7,
  },
  tagsContainer: {
    width: "100%",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  tagChipText: {
    fontSize: 12,
  },
  clearFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filteringText: {
    fontSize: 12,
    flex: 1,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  checkIcon: {
    marginLeft: 6,
  },
  tagDivider: {
    width: "100%",
    marginVertical: 2,
    height: 1,
  },
  noTagsText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
});
