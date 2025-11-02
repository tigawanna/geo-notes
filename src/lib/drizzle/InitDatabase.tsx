import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import migrations from "@/drizzle/migrations";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { Button, Card, Surface, Text, useTheme } from "react-native-paper";
import { db } from "./client";

interface InitDatabaseProps {
  children?: React.ReactNode;
}
export function InitDatabase({ children }: InitDatabaseProps) {
  const { success, error } = useMigrations(db, migrations);
  const theme = useTheme();
  if (error) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: theme.colors.background }}>
        <Card style={{ padding: 20, width: '90%', maxWidth: 400, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.error }}>
              Database Migration Failed
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 20, color: theme.colors.onSurface }}>
              {error.message}
            </Text>
            <Text variant="bodySmall" style={{ textAlign: 'center', marginBottom: 20, color: theme.colors.onSurfaceVariant }}>
              Please try restarting the app or contact support if the problem persists.
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                // You could add retry logic here
                console.log('Retry migration');
              }}
              style={{ marginTop: 10 }}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            >
              Retry
            </Button>
          </Card.Content>
        </Card>
      </Surface>
    );
  }
  if (!success) {
    return <LoadingFallback />;
  }
  return children;
}
