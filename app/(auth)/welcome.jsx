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
          <View
            className="p-5 rounded-xl w-1/2"
            style={{ backgroundColor: primaryColor }}
          >
            <Link
              href="/register"
              className="text-white text-xl font-semibold text-center"
            >
              Zarejestruj się
            </Link>
          </View>
          <View
            className="p-5 rounded-xl w-1/2"
            style={{ backgroundColor: "white" }}
          >
            <Link
              href="/login"
              className="text-black text-xl font-semibold text-center"
            >
              Zaloguj się
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default welcome;
