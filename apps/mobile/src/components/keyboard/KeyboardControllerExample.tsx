import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ListItem {
  id: string;
  text: string;
}

function AnimatedListItem({ item, index }: { item: ListItem; index: number }) {
  const theme = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.listItem,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
        },
        animatedStyle,
      ]}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {item.text}
      </Text>
    </Animated.View>
  );
}

export function KeyboardControllerExample() {
  const theme = useTheme();
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);

  const handleSubmit = () => {
    if (inputText.trim()) {
      const newItem: ListItem = {
        id: Date.now().toString(),
        text: inputText.trim(),
      };
      setItems((prev) => [newItem, ...prev]);
      setInputText("");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, width: "100%", height: "100%" }} behavior="padding">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
            Keyboard Controller Example
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Type and press Enter to add items
          </Text>
        </View>

        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {items.map((item, index) => (
            <AnimatedListItem key={item.id} item={item} index={index} />
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            label="Type here"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            style={styles.input}
            mode="outlined"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  listItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  input: {
    width: "100%",
  },
});
