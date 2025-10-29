import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/default/haptic-tab";
import { MaterialCommunityIcon, MaterialIcon } from "@/components/default/ui/icon-symbol";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { useDeviceLocation } from "@/hooks/use-device-location";

export default function TabLayout() {
  const { colors } = useTheme();
  useDeviceLocation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 0,
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {
            backgroundColor: colors.surface,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcon size={28} name="home-map-marker" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcon size={28} name="view-list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: true,
          tabBarIcon: ({ color }) => <MaterialIcon size={28} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
