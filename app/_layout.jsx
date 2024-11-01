import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";

import { AuthContextProvider } from "../context/AuthContext";
import { auth } from "../firebase";

import "../global.css";

const _layout = () => {
  const [isLogin, setIsLogin] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
  }, []);
  return (
      <AuthContextProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {isLogin ? (
              <Stack.Screen name="(tabs)" />
          ) : (
              <Stack.Screen name="(auth)" />
          )}
        </Stack>
      </AuthContextProvider>
  );
};

export default _layout;
