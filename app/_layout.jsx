import React, { useState } from "react";
import { Stack } from "expo-router";

import "../global.css";

const _layout = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <Stack>
      {isLogin ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
};

export default _layout;
