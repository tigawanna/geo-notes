import { Snackbar, Text, useTheme } from "react-native-paper";
import { useSnackbarStore } from "./global-snackbar-store";

export function GlobalSnackbar() {
  const { visible, message, action, duration, hideSnackbar } = useSnackbarStore();
  const theme = useTheme();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={duration}
      action={action}
      style={{
        backgroundColor: theme.colors.surfaceVariant,
        marginBottom: 60, // Add some space above tab bar
      }}
    >
      <Text>
        {message}
      </Text>
    </Snackbar>
  );
}

