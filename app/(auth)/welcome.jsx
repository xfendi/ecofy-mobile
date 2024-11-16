import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { primaryColor } from "../../config.json";

const welcome = () => {
  const router = useRouter();

  const handleOpenRegister = () => {
    router.navigate("/register");
  };

  const handleOpenLogin = () => {
    router.navigate("/login");
  };

  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <Image
          className="w-[300px] h-[300px]"
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
        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleOpenRegister}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Zarejestruj się
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: "white" }}
          onPress={handleOpenLogin}
        >
          <Text className="text-black text-xl font-semibold text-center">
            Zaloguj się
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default welcome;
