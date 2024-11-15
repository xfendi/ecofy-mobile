import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";

import TabBar from "../../components/TabBar";
import { UserAuth } from "../../context/AuthContext";

const _layout = () => {
  const { user, loading } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/welcome");
    }
  }, [user, loading, router]);

  if (loading) {
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
