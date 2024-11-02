import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router"; // Importuj useRouter

import { primaryColor } from "../config.json"; // Importuj kolor

const EventListItem = ({ eventData, onClose }) => {
  const router = useRouter(); // Inicjalizuj router

  const ShowMore = (id) => {
    router.push({
      pathname: "/(tabs)/events", // Ścieżka do komponentu Events
      params: { eventId: id }, // Przekaż identyfikator wydarzenia
    });
  };

  return (
    <View className="absolute bottom-[100px] right-5 left-5 bg-white p-5 rounded-xl flex flex-col gap-5">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-xl font-semibold" style={{ color: primaryColor }}>
          {eventData?.title}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <FontAwesome name="times" size={20} />
        </TouchableOpacity>
      </View>
      <View>
        <Text className="text-gray-600">{eventData?.address}</Text>
        <Text>{eventData?.description}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          ShowMore(eventData.id);
        }}
        className="p-4 rounded-xl"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        <Text className="text-white text-xl font-semibold text-center">
          Dowiedz się więcej
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventListItem;
