import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";

import { AuthContextProvider, UserAuth } from "../context/AuthContext";
import { MapContextProvider } from "../context/MapContext";
import { primaryColor } from "../config.json";

import "../global.css";

const _layout = () => {
  return (
    <AuthContextProvider>
      <InnerLayout />
    </AuthContextProvider>
  );
};

const InnerLayout = () => {
  const { user } = UserAuth();
  const [isUserReady, setIsUserReady] = useState(false);

  useEffect(() => {
    if (user !== undefined) {
      setIsUserReady(true);
    }
  }, [user]);

  if (!isUserReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <MapContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
      </Stack>
    </MapContextProvider>
  );
};

export default _layout;
