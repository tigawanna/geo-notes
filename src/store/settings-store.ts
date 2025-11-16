// import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CustomThemeKey } from "@/constants/Colors";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const mmkvStorage = createMMKV();

type SettingsStoreType = {
  theme: "dark" | "light" | null;
  colorScheme: CustomThemeKey | null;
  localBackupPath: string | null;
  dynamicColors: boolean;
  lastBackup: Date | null;
  locationEnabled: boolean;
  quickCopyMode: "title" | "phone" | "manual";
  hapticsEnabled: boolean;
  handedness: "left" | "right";

  // Actions
  toggleDynamicColors: () => void;
  toggleTheme: () => void;
  toggleLocationEnabled: () => void;
  toggleHapticsEnabled: () => void;
  toggleHandedness: () => void;
  setTheme: (theme: "dark" | "light" | null) => void;
  setColorScheme: (scheme: CustomThemeKey | null) => void;
  setLocalBackupPath: (path: string | null) => void;
  setLastBackup: (date: Date | null) => void;
  setQuickCopyMode: (mode: "title" | "phone" | "manual") => void;
  updateSettings: (
    settings: Partial<
      Omit<
        SettingsStoreType,
        | "toggleDynamicColors"
        | "toggleTheme"
        | "toggleLocationEnabled"
        | "toggleHapticsEnabled"
        | "setTheme"
        | "setColorScheme"
        | "setLocalBackupPath"
        | "setLastBackup"
        | "setQuickCopyMode"
        | "updateSettings"
      >
    >
  ) => void;
};

export const useSettingsStore = create<SettingsStoreType>()(
  persist(
    (set, get) => ({
      // State
      theme: null,
      colorScheme: null,
      localBackupPath: null,
      dynamicColors: true,
      lastBackup: null,
      locationEnabled: true,
      quickCopyMode: "manual",
      hapticsEnabled: true,
      handedness: "right",

      // Actions
      toggleDynamicColors: () =>
        set((state) => ({
          dynamicColors: !state.dynamicColors,
          colorScheme: !state.dynamicColors ? null : state.colorScheme, // Set to null when enabling dynamic colors
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleLocationEnabled: () =>
        set((state) => ({
          locationEnabled: !state.locationEnabled,
        })),

      toggleHapticsEnabled: () =>
        set((state) => ({
          hapticsEnabled: !state.hapticsEnabled,
        })),

      toggleHandedness: () =>
        set((state) => ({
          handedness: state.handedness === "right" ? "left" : "right",
        })),

      setTheme: (theme) => set({ theme }),

      setColorScheme: (scheme) =>
        set({
          colorScheme: scheme,
          dynamicColors: scheme === null, // Enable dynamic colors only when System Default
        }),

      setLocalBackupPath: (path) => set({ localBackupPath: path }),

      setLastBackup: (date) => set({ lastBackup: date }),

      setQuickCopyMode: (mode) => set({ quickCopyMode: mode }),

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => {
        return {
          setItem: (name, value) => {
            mmkvStorage.set(name, value);
            return Promise.resolve();
          },
          getItem: (name) => {
            const value = mmkvStorage.getString(name);
            return Promise.resolve(value ?? null);
          },
          removeItem: (name: string): Promise<void> => {
            mmkvStorage.remove(name);
            return Promise.resolve();
          },
          
        };
      }),
      // Only persist the state, not the actions
      partialize: (state) => ({
        theme: state.theme,
        colorScheme: state.colorScheme,
        localBackupPath: state.localBackupPath,
        dynamicColors: state.dynamicColors,
        lastBackup: state.lastBackup,
        locationEnabled: state.locationEnabled,
        quickCopyMode: state.quickCopyMode,
        hapticsEnabled: state.hapticsEnabled,
        handedness: state.handedness,
      }),
    }
  )
);

// Custom hook for theme functionality
export function useThemeStore() {
  const colorScheme = useColorScheme();
  const { theme, setTheme, toggleTheme } = useSettingsStore();

  const currentTheme = theme ?? colorScheme;
  const isDarkMode = currentTheme === "dark";

  return {
    theme: currentTheme,
    toggleTheme,
    setTheme,
    isDarkMode,
  };
}

// Helper hook to check if store has been hydrated from AsyncStorage
export function usePersistenceLoaded() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if store has been hydrated
    const checkHydrated = () => {
      setIsLoaded(true);
    };

    // Small delay to ensure hydration is complete
    const timeout = setTimeout(checkHydrated, 100);

    return () => clearTimeout(timeout);
  }, []);

  return isLoaded;
}
