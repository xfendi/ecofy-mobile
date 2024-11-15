import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendEmailVerification } from "firebase/auth";

import { primaryColor } from "../../config.json";
import { UserAuth } from "../../context/AuthContext";

const verify = () => {
  const { user } = UserAuth();
  const router = useRouter();

  if (user?.emailVerified) {
    router.replace("/(tabs)"); 
  }

  const handleSubmit = async () => {
    try {
      await sendEmailVerification(user);
      Alert.alert("Wiadomość została wysłana!");
    } catch (error) {
      Alert.alert("Wystąpił błąd podczas wysyłania wiadomości!");
    }
  };
  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">
            Weryfikacja Email
          </Text>
          <Text className="text-center">
            Kliknij poniżej aby zweryfikować swój adres email i uzyskać pełny
            dostęp do aplikacji!
          </Text>
        </View>

        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Wyślij Email
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-2">
          <Text>Chcesz wrócić do aplikacji?</Text>
          <Link href="/(tabs)" style={{ color: primaryColor }}>
            Strona główna
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default verify;
