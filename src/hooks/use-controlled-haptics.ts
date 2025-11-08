import { useSettingsStore } from "@/store/settings-store";
import * as Haptics from "expo-haptics";

export function useControlledHaptics() {
const { hapticsEnabled: enabled } = useSettingsStore();
  const triggerSuccessHaptic = async () => {
    if (!enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const triggerWarningHaptic = async () => {
    if (!enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };
  const triggerImpact = async (style: Haptics.ImpactFeedbackStyle) => {
    if (!enabled) return;
    await Haptics.impactAsync(style);
  };
  return {
    triggerImpact,
    triggerSuccessHaptic,
    triggerWarningHaptic,
  };
}
