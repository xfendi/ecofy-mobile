import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { AntDesign } from "@expo/vector-icons";

import { primaryColor } from "../config.json";

const EventItem = ({ event, deleteFunction }) => {
  const handleShowOnMap = (event) => {
    // Logika do wyświetlania wydarzenia na mapie
    console.log(`Pokaż wydarzenie na mapie: ${event.title}`);
  };

  const handleDelete = (event) => {
    deleteFunction(event.id);
  }

  return (
    <View key={event.id} className="flex flex-col gap-5">
      <View className="flex flex-row justify-between">
        <Text className="text-xl font-semibold" style={{ color: primaryColor }}>
          {event.title}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(event)}>
          <AntDesign name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <View>
        <Text className="text-gray-400">{event.date}</Text>
        <Text className="text-gray-600">{event.address}</Text>
        <Text>{event.description}</Text>
        <Text className="text-gray-400">
          {event.coordinates.latitude}, {event.coordinates.longitude}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleShowOnMap(event)}
        className="p-4 rounded-xl"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        <Text className="text-white text-xl font-semibold text-center">
          Pokaż na mapie
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventItem;
