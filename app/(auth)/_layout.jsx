import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="reset" options={{ headerShown: false }} />

      <Stack.Screen name="verify" options={{ headerShown: false }} />

      <Stack.Screen name="onboard_one" options={{ headerShown: false }} />
      <Stack.Screen name="onboard_two" options={{ headerShown: false }} />
      <Stack.Screen name="onboard_three" options={{ headerShown: false }} />
      <Stack.Screen name="onboard_four" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
