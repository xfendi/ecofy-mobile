import React from "react";
import { TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { UseMap } from "../context/MapContext";
import { useRouter } from "expo-router";

const NotificationItem = ({ notification }) => {
  const { setSelectedEvent } = UseMap();
  const router = useRouter();

  const handleShowOnMap = () => {
    setSelectedEvent(notification.event);
    router.replace("/(tabs)/map");
  };

  return (
    <TouchableOpacity
      onPress={handleShowOnMap}
      className="border-b border-gray-200 pb-5"
      disabled={notification.typeChallenge}
    >
      <Text className="text-xl font-semibold">{notification.title}</Text>
      <Text className="text-gray-500">{notification.message}</Text>
    </TouchableOpacity>
  );
};

export default NotificationItem;
