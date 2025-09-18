import { View, Text } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { useTheme } from "react-native-paper";
import { ReactNode } from "react";

interface FormFieldErrorProps {
  form: UseFormReturn<any>;
  fieldName: string;
  children: ReactNode;
}

export function FormFieldError({ form, fieldName, children }: FormFieldErrorProps) {
  const theme = useTheme();
  const error = form.formState.errors[fieldName];
  
  return (
    <View>
      {children}
      {error?.message && (
        <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
          {String(error.message)}
        </Text>
      )}
    </View>
  );
}
