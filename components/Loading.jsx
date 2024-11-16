import { View, ActivityIndicator } from "react-native";
import React from "react";

const Loading = () => {
  return (
    <View
      className="absolute flex-row justify-center items-center w-screen h-screen z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
    >
      <View className="bg-white p-5 rounded-3xl">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    </View>
  );
};

export default Loading;
