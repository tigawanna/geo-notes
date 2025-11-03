import { customTheme, type CustomThemeKey } from "@/constants/Colors";
import { backupDatabase, importDatabase } from "@/lib/op-sqlite/backup";
import { useSettingsStore, useThemeStore } from "@/store/settings-store";
import { logger } from "@/utils/logger";
import * as Application from "expo-application";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider, Icon, List, Surface, Switch, useTheme } from "react-native-paper";

export default function Settings() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const {
    dynamicColors,
    toggleDynamicColors,
    colorScheme,
    setColorScheme,
    locationEnabled,
    toggleLocationEnabled,
    quickCopyMode,
    setQuickCopyMode,
  } = useSettingsStore();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const developerFacingBuildVersion = Application.nativeApplicationVersion;

  const colorSchemeOptions = Object.entries(customTheme).map(([key, value]) => ({
    key: key as CustomThemeKey,
    color: value.light.primary,
  }));

  const authorInfo = {
    name: "tigawanna",
    github: "https://github.com/tigawanna",
    website: "https://tigawanna-portfolio.vercel.app",
    email: "denniskinuthiawaweru@gmail.com",
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      await backupDatabase();
      Alert.alert("Success", "Database backed up successfully");
    } catch (error) {
      logger.error("Backup failed:", error);
      Alert.alert("Error", "Failed to backup database");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      "Import Database",
      "This will replace your current database. Make sure you have a backup! The app will need to restart after import.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            try {
              setIsImporting(true);
              await importDatabase();
              Alert.alert(
                "Success",
                "Database imported successfully. Please restart the app.",
                [
                  {
                    text: "Restart Now",
                    onPress: () => {
                      // Force app to reload by navigating to root
                      router.replace("/");
                    },
                  },
                ]
              );
            } catch (error) {
              logger.error("Import failed:", error);
              Alert.alert("Error", "Failed to import database");
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView style={[styles.container, {}]}>
        <List.Section>
          <List.Subheader style={[styles.listSubHeader]}>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
          <List.Item
            title="Dynamic Colors"
            description="Use Material You color palette"
            left={(props) => <List.Icon {...props} icon="palette" />}
            right={() => <Switch value={dynamicColors} onValueChange={toggleDynamicColors} />}
          />
          <List.Item
            title="Color Scheme"
            left={(props) => <List.Icon {...props} icon="palette-swatch" />}
          />
          <View style={styles.colorContainer}>
            {colorSchemeOptions.map((option) => (
              <TouchableOpacity
                key={option.key || "system"}
                onPress={() => setColorScheme(option.key)}
                style={styles.colorDot}>
                <View
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: option.color,
                      borderRadius: colorScheme === option.key ? 4 : 18,
                    },
                  ]}>
                  {colorScheme === option.key && (
                    <Icon source="check" size={20} color={theme.colors.onPrimary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Divider />
        </List.Section>

        <List.Section>
          <List.Subheader style={[styles.listSubHeader]}>Notes Settings</List.Subheader>
          <List.Item
            title="Location Tracking"
            description="Automatically save location with notes"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => <Switch value={locationEnabled} onValueChange={toggleLocationEnabled} />}
          />
          <List.Item
            title="Quick Copy Mode"
            description={
              quickCopyMode === "title"
                ? "Auto-copy note title"
                : quickCopyMode === "phone"
                ? "Auto-detect phone numbers"
                : "Manual input"
            }
            left={(props) => <List.Icon {...props} icon="content-copy" />}
            onPress={() => {
              const modes: ("title" | "phone" | "manual")[] = ["manual", "title", "phone"];
              const currentIndex = modes.indexOf(quickCopyMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              setQuickCopyMode(nextMode);
            }}
          />
          <Divider />
        </List.Section>

        <List.Section>
          <List.Subheader style={[styles.listSubHeader]}>Database</List.Subheader>
          <List.Item
            title="Backup Database"
            description="Export your database to a file"
            left={(props) => <List.Icon {...props} icon="database-export" />}
            onPress={handleBackup}
            disabled={isBackingUp}
          />
          <List.Item
            title="Import Database"
            description="Replace database from backup file"
            left={(props) => <List.Icon {...props} icon="database-import" />}
            onPress={handleImport}
            disabled={isImporting}
          />
          <Divider />
        </List.Section>

        <List.Section>
          <List.Subheader style={[styles.listSubHeader]}>About</List.Subheader>
          <List.Item
            title="Author"
            description={authorInfo.name}
            left={(props) => <List.Icon {...props} icon="account" />}
            onPress={() => Linking.openURL(authorInfo.website)}
          />
          <List.Item
            title="Github"
            description={authorInfo.github}
            left={(props) => <List.Icon {...props} icon="github" />}
            onPress={() => Linking.openURL(authorInfo.github)}
          />
          <List.Item
            title="Version"
            description={developerFacingBuildVersion ?? "??"}
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </List.Section>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  colorDot: {
    marginBottom: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
