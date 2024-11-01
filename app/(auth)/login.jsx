import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";

import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter  } from "expo-router";

import { UserAuth } from "../../context/AuthContext";

import { primaryColor } from "../../config.json";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { SignIn } = UserAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Uwaga!", "Proszę wypełnić wszystkie pola.");
      return;
    }
    await SignIn(email, password);
    router.replace('/(tabs)');
  };
  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">Witaj Ponownie</Text>
          <Text className="text-center">
            Wpisz poniżej dane logowania aby przejść do aplikacji!
          </Text>
        </View>
        <View className="flex flex-col gap-5">
          <AppTextInput placeholder="Email" onChangeText={setEmail} />
          <AppTextInput
            placeholder="Hasło"
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="flex flex-row gap-5">
          <Text>Nie możesz sie zalogować?</Text>
          <Link href="/reset" style={{ color: primaryColor }}>
            Zresetuj Hasło
          </Link>
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Zaloguj się
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-5">
          <Text>Nie posiadasz konta?</Text>
          <Link href="/reset" style={{ color: primaryColor }}>
            Stwórz nowe konto
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

export default login;
