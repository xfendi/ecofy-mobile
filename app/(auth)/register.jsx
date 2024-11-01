import { View, Text } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";
import { TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import { primaryColor } from "../../config.json";
import { UserAuth } from "../../context/AuthContext";

const register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { createUser } = UserAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password || !name) {
      Alert.alert("Uwaga!", "Proszę wypełnić wszystkie pola.");
      return;
    }
    await createUser(email, password, name);
    router.replace("/(tabs)");
  };
  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">Stwórz Konto</Text>
          <Text className="text-center">
            Wpisz poniżej swoje dane abystworzyc konto i przejść do aplikacji!
          </Text>
        </View>
        <View className="flex flex-col gap-5">
          <AppTextInput placeholder="Imie i Nazwisko" onChangeText={setName} />
          <AppTextInput placeholder="Email" onChangeText={setEmail} />
          <AppTextInput
            placeholder="Hasło"
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Stwórz Konto
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-5">
          <Text>Posiadasz już konto?</Text>
          <Link href="/reset" style={{ color: primaryColor }}>
            Zaloguj się
          </Link>
        </View>

        <View className="flex flex-col gap-5">
          <Text className="text-center">Lub Kontynuuj z</Text>

          <View className="flex flex-row gap-5">
            <TouchableOpacity className="p-4 rounded-xl bg-white text-xl font-semibold text-center">
              <Ionicons name="logo-google" color="black" size={30} />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 rounded-xl bg-white text-xl font-semibold text-center">
              <Ionicons name="logo-apple" color="black" size={30} />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 rounded-xl bg-white text-xl font-semibold text-center">
              <Ionicons name="logo-facebook" color="black" size={30} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default register;
