import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";

import { AuthContextProvider } from "../context/AuthContext";
import { auth } from "../firebase";

const _layout = () => {
  const [isLogin, setIsLogin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLogin(!!currentUser);
    });
    return unsubscribe;
  }, []);

  if (isLogin === null) {
    // Ekran ładowania
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default _layout;
