import { useRegisterCrashalytics } from "@/lib/react-native-firebase/crashalytics/use-register-crashalytics";
import { useThemeSetup } from "@/hooks/theme/use-theme-setup";
import { InitDatabase } from "@/lib/drizzle/InitDatabase";
import { GlobalSnackbar } from "@/lib/react-native-paper/snackbar/GlobalSnackbar";
import { queryClient } from "@/lib/tanstack/query/client";
import {
  onAppStateChange,
  useAppState,
  useOnlineManager,
} from "@/lib/tanstack/query/react-native-setup-hooks";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(container)",
};

export default function RootLayout() {
  useOnlineManager();
  useAppState(onAppStateChange);
  useRegisterCrashalytics();
  const { colorScheme, paperTheme } = useThemeSetup();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PaperProvider theme={paperTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <InitDatabase>
              <Stack>
                <Stack.Screen name="(container)" options={{ headerShown: false }} />
                <Stack.Screen name="note/details" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
            </InitDatabase>
            <GlobalSnackbar />
          </GestureHandlerRootView>
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
