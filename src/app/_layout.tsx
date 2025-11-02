import { useThemeSetup } from "@/hooks/theme/use-theme-setup";
import { InitDatabase } from "@/lib/drizzle/InitDatabase";
import { GlobalSnackbar } from "@/lib/react-native-paper/snackbar/GlobalSnackbar";
import { queryClient } from "@/lib/tanstack/query/client";
import {
  onAppStateChange,
  useAppState,
  useOnlineManager,
} from "@/lib/tanstack/query/react-native-setup-hooks";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

// let resolver: (() => void) | null;
// let initilializerPromise = new Promise<void>((resolve) => {
//   resolver = () => {
//     console.log("Initializer promise resolved");
//     resolve();
//   };
// });
// initializePushEventsBackgroundTask(initilializerPromise);
// initializePullEventsBackgroundTask(initilializerPromise);

// useEffect(() => {
// resolver?.();
// comment out during dev because we're not setupfor a dev profile on firebase
// registerCrashalytics();
// }, []);
// useRegisterCrashalytics();

export default function RootLayout() {
  useOnlineManager();
  useAppState(onAppStateChange);
  const { colorScheme, paperTheme } = useThemeSetup();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PaperProvider theme={paperTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
              <InitDatabase>
                <Stack>
                  <Stack.Screen name="(container)/(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(container)/(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </InitDatabase>
              <GlobalSnackbar />
            </ThemeProvider>
          </GestureHandlerRootView>
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
