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
      <Text className="text-xl font-semibold" style={{ color: primaryColor }}>
        {title}
      </Text>
      <Text>{description}</Text>
      <Text className="text-gray-400">
        Rozpoczęcie: {new Date(startTime).toLocaleString()}
        {"\n"}
        Zakończenie: {new Date(endTime).toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={handleJoinChallenge}
        className="p-4 rounded-xl"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        <Text className="text-white text-xl font-semibold text-center">
          Weź udział
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EcoChallengeItem;
