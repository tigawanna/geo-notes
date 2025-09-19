import BottomSheet from "@gorhom/bottom-sheet";
import { useRef, useMemo, useCallback, useState } from "react";

export function useNotesFormBottomSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen,setIsOpen]=useState(false)
  const snapPoints = useMemo(() => ["5%","25%", "50%", "70%"], []);

  // callbacks
  const handleSheetChange = useCallback((index: number) => {
    console.log("handleSheetChange", index);
    setIsOpen(index>0)
  }, []);
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);


  return {
    sheetRef,
    snapPoints,
    isOpen,
    handleSheetChange,
    handleSnapPress,
    handleClosePress,
  }
}
