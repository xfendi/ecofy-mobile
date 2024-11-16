import { View, Text, Alert } from "react-native";
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
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola.");
      return;
    }

    const result = await createUser(email, password, name);

    if (result.error) {
      let errorMessage = "Wystąpił błąd. Spróbuj ponownie później.";

      if (result.error.includes("auth/invalid-credential")) {
        errorMessage = "Nieprawidłowe dane rejestracyjne.";
      } else if (result.error.includes("auth/invalid-email")) {
        errorMessage = "Podany adres email jest nieprawidłowy.";
      } else if (result.error.includes("auth/email-already-in-use")) {
        errorMessage = "Ten adres email jest już używany. Wybierz inny.";
      } else if (result.error.includes("auth/weak-password")) {
        errorMessage = "Hasło jest za słabe. Wybierz silniejsze hasło.";
      } else if (result.error.includes("auth/too-many-requests")) {
        errorMessage = "Zbyt wiele prób rejestracji. Spróbuj ponownie później.";
      }

      return Alert.alert("Błąd", errorMessage);
    }

    router.replace("/onboard_one");
  };

  const handleProviderClick = () => {
    Alert.alert("Wkrótce", "Ta funkcja zostanie odblokowana wkrótce!");
  };

  return (
    <SafeAreaView>
      <View className="flex gap-5 p-10 flex-col justify-center h-full items-center">
        <View className="flex flex-col gap-5">
          <Text className="text-center text-5xl font-bold">Stwórz Konto</Text>
          <Text className="text-center">
            Wpisz poniżej swoje dane aby stworzyć konto i przejść do aplikacji!
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
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Stwórz Konto
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-2">
          <Text>Posiadasz już konto?</Text>
          <Link href="/login" style={{ color: primaryColor }}>
            Zaloguj się
          </Link>
        </View>

        <View className="flex flex-col gap-5">
          <Text className="text-center" style={{ color: "#d1d5db" }}>
            Lub Kontynuuj z
          </Text>

          <View className="flex flex-row gap-5">
            <TouchableOpacity
              onPress={handleProviderClick}
              className="p-4 rounded-xl bg-white text-xl font-semibold text-center"
            >
              <Ionicons name="logo-google" color="#d1d5db" size={32} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProviderClick}
              className="p-4 rounded-xl bg-white text-xl font-semibold text-center"
            >
              <Ionicons name="logo-apple" color="#d1d5db" size={32} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProviderClick}
              className="p-4 rounded-xl bg-white text-xl font-semibold text-center"
            >
              <Ionicons name="logo-facebook" color="#d1d5db" size={32} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default register;
