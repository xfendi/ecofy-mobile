// tabs/_layout.js
import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import { UserAuth } from "../../context/AuthContext"; // Kontekst użytkownika
import { useRouter } from "expo-router";

const _layout = () => {
  const { user, loading } = UserAuth();  // Używamy kontekstu użytkownika
  const router = useRouter();

  useEffect(() => {
    // Jeśli dane o użytkowniku zostały załadowane i nie jest zalogowany, przekierowujemy
    if (!loading && !user) {
      router.replace("/(auth)/welcome");
    }
  }, [user, loading, router]);  // Reagujemy na zmiany w user i loading

  if (loading) {
    // Zwracamy null lub spinner, dopóki dane o użytkowniku są ładowane
    return null;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="map" options={{ headerShown: false }} />
      <Tabs.Screen name="create" options={{ headerShown: false }} />
      <Tabs.Screen name="events" options={{ headerShown: false }} />
      <Tabs.Screen name="community" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
      <Tabs.Screen name="settings" options={{ headerShown: false }} />
      <Tabs.Screen name="details" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default _layout;
