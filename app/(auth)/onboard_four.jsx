import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { primaryColor } from "../../config.json";

const onboard_four = () => {
  return (
    <SafeAreaView>
      <View className="flex gap-10 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[300px] h-[300px]"
          source={require("../../assets/images/adaptive-icon.png")}
        />
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">
            Śledź Swoje Postępy
          </Text>

          <Text className="text-center">
            Zobacz, jak Twoje codzienne wybory wpływają na środowisko. Nasza
            aplikacja pozwala śledzić Twoje postępy, dzięki czemu możesz
            zobaczyć, jak małe zmiany przyczyniają się do lepszego stanu naszej
            planety. Twoje działania mają znaczenie!
          </Text>
        </View>
        <View className="flex flex-row gap-5">
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          ></View>
        </View>
        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={router.replace("/(tabs)")}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Przejdź do aplikacji
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default onboard_four;
