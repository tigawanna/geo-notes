import { Stack } from "expo-router";

export default function ContainerLayout() {

 // Listen for changes to authentication state
 // if (isPending) {
  //   return <LoadingFallback />;
  // }

  const isAuthenticated = false

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
