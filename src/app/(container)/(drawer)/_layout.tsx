import { MaterialCommunityIcon, MaterialIcon } from "@/components/default/ui/icon-symbol";
import { AppLogoSvg } from "@/components/shared/svg/AppLogoSvg";
import { tagsQueryOptions } from "@/data-access-layer/tags-query-options";
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
import { Chip, Divider, Text, useTheme } from "react-native-paper";
// import { useDeviceLocation } from "@/hooks/use-device-location";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { data: tags } = useQuery(tagsQueryOptions);

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
      <Divider style={styles.divider} />
      <View style={styles.tagsSection}>
        <Text variant="titleSmall" style={styles.tagsSectionTitle}>
          Quick Tags
        </Text>
        {tags && tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 8).map((tag) => (
              <Chip
                key={tag.id}
                style={[
                  styles.tagChip,
                  { backgroundColor: tag.color || colors.primaryContainer },
                ]}
                textStyle={styles.tagChipText}
                compact
                onPress={() => {
                  // Navigate to notes filtered by this tag (implement later)
                  console.log("Filter by tag:", tag.name);
                }}>
                {tag.name}
              </Chip>
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    marginBottom: 4,
  },
  tagChipText: {
    fontSize: 12,
  },
  noTagsText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
});
