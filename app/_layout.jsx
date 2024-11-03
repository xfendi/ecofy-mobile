import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";

import { AuthContextProvider } from "../context/AuthContext";
import { primaryColor } from "../config.json";
import { auth } from "../firebase";

import "../global.css";
import {MapProvider} from "../context/MapContext";

const _layout = () => {
  const [isLogin, setIsLogin] = useState(null);

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
      <MapProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {isLogin ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      </MapProvider>
    </AuthContextProvider>
  );
};

export default _layout;