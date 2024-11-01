import React from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

const _layout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: "" }} />
      <Tabs.Screen name="map" options={{ headerShown: false, title: "" }} />
      <Tabs.Screen name="create" options={{ headerShown: false, title: "" }} />
      <Tabs.Screen name="events" options={{ headerShown: false, title: "" }} />
      <Tabs.Screen name="profile" options={{ headerShown: false, title: "" }} />
    </Tabs>
  );
};

export default _layout;
