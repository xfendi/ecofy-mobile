// components/EcoChallengeItem.jsx
import React from "react";
import { View, Text } from "react-native";

import { primaryColor } from "../config.json";
import { TouchableOpacity } from "react-native";

const EcoChallengeItem = ({ challenge }) => {
  const { title, description, startTime, endTime } = challenge;

  const handleJoinChallenge = () => {
    alert(`Dołączyłeś do wyzwania: ${title}`);
  };

  return (
    <View className="flex flex-col gap-5">
      <Text className="text-xl font-semibold">{title}</Text>
      <Text>{description}</Text>
      <View className="flex flex-row gap-5">
        <View>
          <Text className="font-semibold">Rozpoczęcie</Text>
          <Text className="text-gray-500">
            {new Date(startTime).toLocaleString()}
          </Text>
        </View>
        <View>
          <Text className="font-semibold">Zakończenie</Text>
          <Text className="text-gray-500">
            {new Date(endTime).toLocaleString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleJoinChallenge}
        className="p-4 rounded-xl"
        style={{ backgroundColor: primaryColor }}
      >
        <Text className="text-white text-xl font-semibold text-center">
          Weź udział
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EcoChallengeItem;
