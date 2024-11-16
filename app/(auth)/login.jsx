import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { UserAuth } from "../../context/AuthContext";
import { primaryColor } from "../../config.json";
import Loading from "../../components/Loading";

const login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { SignIn } = UserAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!email || !password) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola.");
      setIsLoading(false);
      return;
    }

    const result = await SignIn(email, password);

    if (result.error) {
      let errorMessage = "Wystąpił błąd. Spróbuj ponownie później.";

      if (result.error.includes("auth/invalid-credential")) {
        errorMessage = "Nieprawidłowe dane logowania.";
      } else if (result.error.includes("auth/invalid-email")) {
        errorMessage = "Podany adres email jest nieprawidłowy.";
      } else if (result.error.includes("auth/user-not-found")) {
        errorMessage = "Nie znaleziono użytkownika o podanym adresie email.";
      } else if (result.error.includes("auth/wrong-password")) {
        errorMessage = "Nieprawidłowe hasło. Spróbuj ponownie.";
      } else if (result.error.includes("auth/too-many-requests")) {
        errorMessage = "Zbyt wiele prób logowania. Spróbuj ponownie później.";
      }

      return Alert.alert("Błąd", errorMessage);
    }

    setIsLoading(false);
    router.replace("/(tabs)");
  };

  const handleProviderClick = () => {
    Alert.alert("Wkrótce", "Ta funkcja zostanie odblokowana wkrótce!");
  };

  return (
    <SafeAreaView>
      {isLoading && <Loading />}
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

        <View className="flex flex-row gap-2">
          <Text>Nie możesz się zalogować?</Text>
          <Link href="/reset" style={{ color: primaryColor }}>
            Zmień Hasło
          </Link>
        </View>

        <TouchableOpacity
          className="p-4 rounded-full w-80"
          style={{ backgroundColor: primaryColor }}
          onPress={handleSubmit}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Zaloguj się
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-2">
          <Text>Nie posiadasz konta?</Text>
          <Link href="/register" style={{ color: primaryColor }}>
            Zarejestruj się
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

export default login;
