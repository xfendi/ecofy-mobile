import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth";

import AppTextInput from "../../components/AppTextInput";
import { primaryColor } from "../../config.json";
import { auth } from "../../firebase";

const reset = () => {
  const [email, setEmail] = useState();

  const handleSubmit = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Wiadomość została wysłana!");
    } catch (error) {
      Alert.alert("Wystąpił błąd podczas wysyłania wiadomości!");
    }
  }
  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">
            Resetowanie Hasła
          </Text>
          <Text className="text-center">
            Wpisz poniżej swój adres email abyśmy mogli przesłac ci maila z
            resetowaniem hasła!
          </Text>
        </View>
        <View className="flex flex-col gap-5">
          <AppTextInput placeholder="Email" onChangeText={setEmail} />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Wyślij Email
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-5">
          <Text>Pamiętasz swoje hasło?</Text>
          <Link href="/login" style={{ color: primaryColor }}>
            Zaloguj się
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default reset;
