import { useSettingsStore } from "@/store/settings-store";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  // console.log("status", status);
  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }
  return await Location.getCurrentPositionAsync({
    mayShowUserSettingsDialog: true,
    accuracy: Location.Accuracy.High,
    timeInterval: 1000 * 1 * 5, // 1 minutes
  });
}

export async function manuallySetLocation({
  lat,
  lng,
  qc,
}: {
  lat: number;
  lng: number;
  qc: QueryClient;
}) {
  const oldlocation = qc.getQueryData<Location.LocationObject>(["device-location"]);
  // logger.log("oldlocation", oldlocation);
  qc.setQueryData(["device-location"], {
    ...oldlocation,
    mocked: true,
    coords: {
      ...oldlocation?.coords,
      latitude: lat,
      longitude: lng,
    },
  });
}

export function useDeviceLocation() {
  const queryClient = useQueryClient();
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const { locationEnabled } = useSettingsStore();

  const {
    data: location,
    error,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["device-location"],
    queryFn: getCurrentLocation,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: locationEnabled, // Only fetch when location tracking is enabled
  });

  useEffect(() => {
    // Don't start watching if location tracking is disabled
    if (!locationEnabled) {
      // Clean up any existing watcher
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
      return;
    }

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Minimum time between updates (5s)
          distanceInterval: 2, // Minimum distance change (2m)
        },
        (newLocation) => {
          queryClient.setQueryData(["device-location"], newLocation);
        }
      );
    };

    startWatching();

    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, [queryClient, locationEnabled]); // Re-run when locationEnabled changes

  const { mutate: requestLocationAgain, isPending: isRefreshing } = useMutation({
    mutationFn: getCurrentLocation,
    onSuccess: (data, _, ctx) => {
      queryClient.setQueryData(["device-location"], data);
    },
  });

  return {
    location,
    errorMsg: error?.message || null,
    requestLocationAgain,
    manuallySetLocation: (lat: number, lng: number) =>
      manuallySetLocation({ lat, lng, qc: queryClient }),
    isLoading,
    isRefreshing: isRefreshing || isRefetching,
    refetch,
  };
}
