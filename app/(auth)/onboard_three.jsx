import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { primaryColor } from "../../config.json";

const onboard_three = () => {
  const router = useRouter();
  const handleOpenNextPage = () => {
    router.replace("/onboard_four");
  };

  return (
    <SafeAreaView>
      <View className="flex gap-10 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[300px] h-[300px]"
          source={require("../../assets/images/adaptive-icon.png")}
        />
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">
            Odkryj Mapę Inicjatyw
          </Text>

          <Text className="text-center">
            Chcesz zobaczyć, co dzieje się w Twojej okolicy? Nasza interaktywna
            mapa inicjatyw ekologicznych pozwoli Ci odkryć lokalne projekty,
            wydarzenia i społeczności, które działają na rzecz ochrony
            środowiska. Dowiedz się, jak możesz się zaangażować i wspierać
            działania w swoim regionie!
          </Text>
        </View>
        <View className="flex flex-row gap-5">
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
          <View
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          ></View>
          <View className="w-5 h-5 bg-white rounded-full"></View>
        </View>
        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleOpenNextPage}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Dalej
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default onboard_three;
