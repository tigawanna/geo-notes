# example react-native-paper-tabs setup

```tsx
import { StyleSheet, View } from "react-native";
import { Surface, useTheme, Text } from "react-native-paper";
import { Tabs, TabScreen, TabsProvider } from "react-native-paper-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

    <TabsProvider defaultIndex={0}>
      <Surface style={{ flex: 1, paddingTop: top + 10 }}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Choose the type of account you want to create
          </Text>
        </View>
        <Tabs
          mode="fixed"
          showLeadingSpace={true}
          theme={theme}
          tabHeaderStyle={{
            backgroundColor: theme.colors.surface,
            padding: 4,
          }}
        >
          <TabScreen label="Local Only" icon="cellphone" >
            <View style={styles.tabContent}>
              <LocalAccountForm />
            </View>
          </TabScreen>
          <TabScreen label="Synced Account" icon="cloud-sync">
            <View style={styles.tabContent}>

              <SyncedAccountForm />
            </View>
          </TabScreen>
        </Tabs>
      </Surface>
    </TabsProvider>

```
