import { View, Text } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import { extractErrorMessages, hasFormErrors } from "./form-utils";
import { useTheme } from "react-native-paper";

interface FormErrorDisplayProps {
  form: UseFormReturn<any>;
  title?: string;
  maxErrors?: number;
  style?: object;
}

export function FormErrorDisplay({
  form,
  title = "Please fix the following errors:",
  maxErrors = 5,
  style,
}: FormErrorDisplayProps) {
  const theme = useTheme()
  const errorMessages = extractErrorMessages(form.formState.errors);
  const isVisible = hasFormErrors(form.formState);

  if (!isVisible || errorMessages.length === 0) {
    return null;
  }

  const displayedErrors = errorMessages.slice(0, maxErrors);
  const remainingCount = errorMessages.length - maxErrors;

  return (
    <View style={[{
      marginTop: 24,
      padding: 16,
      backgroundColor: theme.colors.errorContainer,
      borderWidth: 2,
      borderColor: theme.colors.error,
      borderRadius: 12,
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: theme.colors.error,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialIcons name="error" size={20} color={theme.colors.onError} />
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          <Text style={{ fontWeight: '600', color: theme.colors.onErrorContainer, fontSize: 18 }}>{title}</Text>
          <View style={{ gap: 8 }}>
            {displayedErrors.map((error, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                padding: 8,
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  backgroundColor: theme.colors.error,
                  borderRadius: 4,
                  marginTop: 8,
                }} />
                <Text style={{ fontWeight: '500', color: theme.colors.onErrorContainer, flex: 1 }}>{error}</Text>
              </View>
            ))}
            {remainingCount > 0 && (
              <Text style={{
                color: theme.colors.onErrorContainer,
                fontStyle: 'italic',
                textAlign: 'center',
                paddingVertical: 8,
              }}>
                ... and {remainingCount} more errors
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
