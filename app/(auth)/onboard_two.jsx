import { View, Text, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { primaryColor } from "../../config.json";

const onboard_two = () => {
  return (
    <SafeAreaView>
      <View className="flex gap-10 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[350px] h-[350px]"
          source={require("../../assets/images/adaptive-icon.png")}
        />
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">
            Wybierz Swoje Cele Ekologiczne
          </Text>

          <Text className="text-center">
            Czego najbardziej pragniesz osiągnąć? Czy to oszczędzanie energii,
            redukcja plastiku czy może ochrona dzikiej przyrody? Wybierz cele,
            które są dla Ciebie najważniejsze, a my pomożemy Ci w ich
            realizacji!
          </Text>
        </View>
        <View className="flex flex-row gap-5">
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          ></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
        </View>
        <View className="flex flex-row gap-5">
          <Link
            href="/onboard_three"
            className="p-4 rounded-xl w-80 text-white text-xl font-semibold text-center"
            style={{ backgroundColor: primaryColor }}
          >
            Dalej
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default onboard_two;
