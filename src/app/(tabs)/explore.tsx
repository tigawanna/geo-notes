import { Surface, Text, useTheme, Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index: number) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);
  // render
  const renderItem = useCallback(
    (item:string) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <Surface
      style={{
        flex: 1,
        paddingTop: top,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text>Explore</Text>
      <GestureHandlerRootView style={styles.container}>
        {/* <Button mode="contained" onPress={() => handleSnapPress(2)}>
          Snap To 90%
        </Button>
        <Button mode="contained" onPress={() => handleSnapPress(1)}>
          Snap To 50%
        </Button>
        <Button mode="contained" onPress={() => handleSnapPress(0)}>
          Snap To 25%
        </Button> */}

        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          style={{ backgroundColor: theme.colors.background }}
          handleStyle={{ backgroundColor: theme.colors.elevation.level4 }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
          onChange={handleSheetChange}>
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.contentContainer,
              { backgroundColor: theme.colors.background },
            ]}>
            {data.map(renderItem)}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
      <Button mode="contained" onPress={() => handleSnapPress(0)}>
        Snap To 25%
      </Button>
      <Button onPress={() => handleClosePress()}>Close</Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
    width: "100%",
    gap: 4,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
  },
});
