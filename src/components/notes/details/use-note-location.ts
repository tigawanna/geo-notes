import { useDeviceLocation } from "@/hooks/use-device-location";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useNoteLocation(id?: string | undefined) {
  const { location, requestLocationAgain, isLoading: isLocationLoading } = useDeviceLocation();
  const [locationUpdateDialogVisible, setLocationUpdateDialogVisible] = useState(false);
  const qc = useQueryClient();

  const handleAddLocation = (
    savedLocation: { lat: number; lng: number } | null,
    setSavedLocation: (location: { lat: number; lng: number }) => void,
    setHasUnsavedChanges: (value: boolean) => void
  ) => {
    if (!location || typeof location !== "object" || !("coords" in location)) {
      // If no current location, request it
      requestLocationAgain();
    } else if (savedLocation) {
      // If note already has a location, show confirmation dialog
      setLocationUpdateDialogVisible(true);
    } else {
      // If note doesn't have a location yet, add current location directly
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        setSavedLocation({
          lng: coords.longitude,
          lat: coords.latitude,
        });
        qc.invalidateQueries({ queryKey: ["notes", id] });
        setHasUnsavedChanges(true);
      }
    }
  };

  const confirmLocationUpdate = (
    setSavedLocation: (location: { lat: number; lng: number }) => void,
    setHasUnsavedChanges: (value: boolean) => void
  ) => {
    if (location && typeof location === "object" && "coords" in location) {
      const coords = (location as any).coords;
      if (coords?.longitude && coords?.latitude) {
        setSavedLocation({
          lng: coords.longitude,
          lat: coords.latitude,
        });
        setHasUnsavedChanges(true);
      }
    }
    setLocationUpdateDialogVisible(false);
  };

  return {
    location,
    isLocationLoading,
    locationUpdateDialogVisible,
    setLocationUpdateDialogVisible,
    handleAddLocation,
    confirmLocationUpdate,
  };
}
