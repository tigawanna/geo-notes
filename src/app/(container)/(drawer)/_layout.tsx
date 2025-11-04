import { MaterialCommunityIcon, MaterialIcon } from "@/components/default/ui/icon-symbol";
import { AppLogoSvg } from "@/components/shared/svg/AppLogoSvg";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, useTheme } from "react-native-paper";
// import { useDeviceLocation } from "@/hooks/use-device-location";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();

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
          marginBottom:20
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
      <DrawerItemList {...props}  />
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
      </Drawer>
    </GestureHandlerRootView>
  );
}
