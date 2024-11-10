import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";

import { AuthContextProvider } from "../context/AuthContext";
import { MapContextProvider } from "../context/MapContext";
import { primaryColor } from "../config.json";
import { auth } from "../firebase";
import registerNNPushToken from 'native-notify';

import "../global.css";

const _layout = () => {
  const [isLogin, setIsLogin] = useState(null);
  registerNNPushToken(24760, 'yWMd08JhWMihJYHlyMV9so');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLogin(!!currentUser);
    });
    return unsubscribe;
  }, []);

  if (isLogin === null) {
    return (
      <View>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <AuthContextProvider>
      <MapContextProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {isLogin ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
      </MapContextProvider>
    </AuthContextProvider>
  );
};

export default _layout;
