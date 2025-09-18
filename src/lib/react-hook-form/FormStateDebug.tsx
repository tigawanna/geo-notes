import { View, Text } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { useTheme } from "react-native-paper";

interface FormStateDebugProps {
  form: UseFormReturn<any>;
  title?: string;
  style?: object;
  showFullState?: boolean; // Option to show full form state or just errors
}

export function FormStateDebug({
  form,
  title = "🔧 Form State (Development)",
  style,
  showFullState = false,
}: FormStateDebugProps) {
  const theme = useTheme();
  if (!__DEV__) {
    return null;
  }

  const debugData = showFullState ? form.formState : form.formState.errors;

  return (
    <View
      style={[
        {
          marginTop: 24,
          padding: 16,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        },
        style,
      ]}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: theme.colors.onSurfaceVariant,
          marginBottom: 12,
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "monospace",
          color: theme.colors.onSurface,
          backgroundColor: theme.colors.surface,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}>
        {JSON.stringify(debugData, null, 2)}
      </Text>
    </View>
  );
}
