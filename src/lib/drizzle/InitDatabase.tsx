import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import migrations from "@/drizzle/migrations";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { db } from "./client";

interface InitDatabaseProps {
  children?: React.ReactNode;
}
export function InitDatabase({ children }: InitDatabaseProps) {
  const { success, error } = useMigrations(db, migrations);
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return <LoadingFallback />;
  }
  return children;
}
