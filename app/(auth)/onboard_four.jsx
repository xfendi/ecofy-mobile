import { View, Text, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { primaryColor } from "../../config.json";

const onboard_four = () => {
  return (
    <SafeAreaView>
      <View className="flex gap-10 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[350px] h-[350px]"
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
        <View className="flex flex-row gap-5">
          <Link
            href="/(tabs)"
            className="p-4 w-80 rounded-xl text-white text-xl font-semibold text-center"
            style={{ backgroundColor: primaryColor }}
          >
            Przejdź do aplikacji
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default onboard_four;
