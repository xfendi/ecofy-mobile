import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { primaryColor } from "../../config.json";

const welcome = () => {
  return (
    <SafeAreaView>
      <View className="flex gap-10 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[350px] h-[350px]"
          source={require("../../assets/images/adaptive-icon.png")}
        />
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">Witaj w Ecofy</Text>

          <Text className="text-center">
            Połącz się z lokalnymi ekologicznymi wydarzeniami i inicjatywami.
            Dołącz do nas, aby wprowadzać pozytywne zmiany w swojej
            społeczności!
          </Text>
        </View>
        <View className="flex flex-row gap-5">
          <Link
            href="/login"
            className="p-4 rounded-xl w-1/2 text-white text-xl font-semibold text-center"
            style={{ backgroundColor: primaryColor }}
          >
            Zaloguj się
          </Link>
          <Link
            href="/register"
            className="p-4 rounded-xl w-1/2 bg-white text-xl font-semibold text-center"
          >
            Zarejestruj się
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default welcome;
