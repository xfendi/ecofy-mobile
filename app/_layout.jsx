// _layout.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { AuthContextProvider, UserAuth } from "../context/AuthContext"; // Kontekst użytkownika
import { MapContextProvider } from "../context/MapContext"; // Kontekst mapy
import { primaryColor } from "../config.json"; // Kolor z konfiguracji
import "../global.css"; // Globalne style

const _layout = () => {
  return (
    <AuthContextProvider>
      <InnerLayout />
    </AuthContextProvider>
  );
};

const InnerLayout = () => {
  const { user, loading } = UserAuth(); // Z kontekstu użytkownika
  const [isUserReady, setIsUserReady] = useState(false);

  useEffect(() => {
    // Gdy dane o użytkowniku są dostępne, ustawiamy stan na gotowy
    if (user !== undefined) {
      setIsUserReady(true);
    }
  }, [user]);

  // Jeśli dane o użytkowniku są wciąż ładowane, wyświetlamy spinner
  if (!isUserReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  // Jeśli użytkownik jest zalogowany, pokazujemy ekran "tabs"
  // W przeciwnym przypadku ekran logowania
  return (
    <MapContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(tabs)" />  // Ekran z głównymi zakładkami
        ) : (
          <Stack.Screen name="(auth)" />  // Ekran logowania
        )}
      </Stack>
    </MapContextProvider>
  );
};

export default _layout;
