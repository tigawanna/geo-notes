import { customTheme, type CustomThemeKey } from "@/constants/Colors";
import { exportDatabase, formatFileSize, getDatabaseInfo, shareDatabase } from "@/lib/drizzle/backup";
import { useSettingsStore, useThemeStore } from "@/store/settings-store";
import * as Application from "expo-application";
import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Divider, Icon, List, Surface, Switch, useTheme } from "react-native-paper";

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
    lastBackup,
  } = useSettingsStore();
  const developerFacingBuildVersion = Application.nativeBuildVersion;
  
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState<{ size: string; path: string } | null>(null);

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
    setIsBackupLoading(true);
    try {
      const result = await exportDatabase();
      if (result.success) {
        Alert.alert(
          "Backup Created",
          `Database backed up successfully!`,
          [
            { text: "OK", style: "default" },
            {
              text: "Share",
              style: "default",
              onPress: () => handleShareBackup(result.path),
            },
          ]
        );
      } else {
        Alert.alert("Backup Failed", result.error || "Unknown error occurred");
      }
    } catch (error) {
      Alert.alert("Backup Failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleShareBackup = async (backupPath?: string) => {
    setIsBackupLoading(true);
    try {
      const result = await shareDatabase(backupPath);
      if (!result.success) {
        Alert.alert("Share Failed", result.error || "Unknown error occurred");
      }
    } catch (error) {
      Alert.alert("Share Failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const loadDatabaseInfo = async () => {
    const info = await getDatabaseInfo();
    if (info) {
      setDbInfo({
        size: formatFileSize(info.size),
        path: info.path,
      });
    }
  };

  // Load database info when component mounts
  useEffect(() => {
    loadDatabaseInfo();
  }, []);

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
          <List.Subheader style={[styles.listSubHeader]}>Backup & Data</List.Subheader>
          {dbInfo && (
            <List.Item
              title="Database Size"
              description={dbInfo.size}
              left={(props) => <List.Icon {...props} icon="database" />}
            />
          )}
          {lastBackup && (
            <List.Item
              title="Last Backup"
              description={new Date(lastBackup).toLocaleString()}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
          )}
          <View style={styles.backupButtonContainer}>
            <Button
              mode="contained"
              onPress={handleBackup}
              disabled={isBackupLoading}
              icon="backup-restore"
              style={styles.backupButton}>
              {isBackupLoading ? <ActivityIndicator size="small" /> : "Backup Database"}
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleShareBackup()}
              disabled={isBackupLoading}
              icon="share-variant"
              style={styles.backupButton}>
              Backup & Share
            </Button>
          </View>
          <List.Item
            title="What's included?"
            description="All your notes and locations are backed up. You can restore this backup later."
            left={(props) => <List.Icon {...props} icon="information-outline" />}
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
  backupButtonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backupButton: {
    flex: 1,
  },
});
