import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { useRouter } from "expo-router";

import * as ImagePicker from "expo-image-picker";

import { primaryColor } from "../../config.json";
import { UserAuth } from "../../context/AuthContext";
import AppTextInput from "../../components/AppTextInput";
import { storage } from "../../firebase";

const settings = () => {
  const [isModal, setIsModal] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [newpass, setNewpass] = useState();
  const [password, setPassword] = useState();

  const [image, setImage] = useState(null);

  const { logout, user } = UserAuth();
  const router = useRouter();

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/settings");
    closeModal();
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const handleLogout = async () => {
    try {
      router.replace("/(auth)/welcome");
      await logout();
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  const handleVerify = () => {
    router.replace("/(auth)/verify");
  };

  const openModal = () => {
    console.log(user.email, user.displayName, user.emailVerified);
    if (!name && !email && !newpass && !image) {
      Alert.alert("Błąd", "Uzupełnij jakiekolwiek pole.");
      return;
    } else if (email === user.email) {
      Alert.alert("Błąd", "Adres email nie może być taki sam jak poprzedni.");
      return;
    } else if (name === user.diaplayName && name !== undefined) {
      console.log(name, user.displayName);
      Alert.alert(
        "Błąd",
        "Nazwa uzytkownika nie może być taka sama jak poprzednia."
      );
      return;
    } else if (!user.emailVerified) {
      Alert.alert(
        "Błąd",
        "Zweryfikuj swój adres email przez zmianą ustawień konta."
      );
      return;
    }

    setIsModal(true);
  };

  const closeModal = () => {
    setIsModal(false);
    setEmail("");
    setPassword("");
    setName("");
    setNewpass("");
    setImage(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      const credentials = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credentials);

      if (name) {
        await updateProfile(user, { displayName: name });
        Alert.alert("Sukces", "Pomyślnie zaktualizowano nazwę.");
      }

      if (email) {
        await verifyBeforeUpdateEmail(user, email);
        Alert.alert(
          "Sukces",
          "Pomyslnie wysłano wiadomość na nowy adres email. Adres zostanie zmieniony po pomyślniej weryfikacji."
        );
        router.replace("/(auth)/welcome");
        await logout();
      }

      if (newpass) {
        await updatePassword(user, newpass);
        Alert.alert("Sukces", "Pomyślnie zaktualizowano hasło.");
      }

      if (image) {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", image, true);
          xhr.send(null);
        });

        try {
          const storageRef = ref(storage, `profiles/${user.uid}`);
          const result = await uploadBytes(storageRef, blob);
          blob.close();
          const DownloadURL = await getDownloadURL(storageRef);
          await updateProfile(user, { photoURL: DownloadURL });
          Alert.alert("Sukces", "Pomyślnie zaktualizowano zdjęcie profilowe.");
        } catch (e) {
          console.error(e);
          Alert.alert(
            "Błąd",
            `Nie udało się załadować zdjęcia do bazy danych.`
          );
        }
      }

      closeModal();
    } catch (e) {
      closeModal();
      Alert.alert("Błąd", e.message);
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {isModal && (
        <View
          className="absolute flex items-center w-full bottom-0 top-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <View className="bg-gray-100 p-5 w-80 m-auto rounded-xl flex flex-col gap-5 z-50">
            <Text className="text-2xl font-semibold">Potwierdź Hasło</Text>

            <Text className="text-gray-500">Aktualne Hasło</Text>
            <AppTextInput
              placeholder="Wpisz Hasło..."
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              full
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={{ backgroundColor: primaryColor }}
              className="p-4 rounded-xl w-full"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Potwierdź
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeModal}
              className="p-4 rounded-xl w-full bg-gray-500"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Anuluj
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View
          className={`flex flex-col gap-5 ${
            Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"
          }`}
        >
          <View className="flex flex-row justify-between items-center">
            <Text className="text-3xl font-semibold">Ustawienia Konta</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text className="text-red-500 text-lg font-semibold text-center">
                Wyloguj
              </Text>
            </TouchableOpacity>
          </View>
          {!user.emailVerified && (
            <TouchableOpacity
              className="bg-white rounded-xl p-5"
              onPress={handleVerify}
            >
              <Text className="text-xl font-semibold">
                Zweryfikuj Adres Email
              </Text>
              <Text className="text-gray-500">
                Kliknij tą wiadomość i zweryfikuj swój adres email poprzez
                wysłanie wiadomości e-mail.
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex flex-col gap-5">
            <View className="flex-row">
              <TouchableOpacity onPress={pickImage}>
                <View className="absolute z-50 top-[-15px] right-[-15px] h-9 w-9 flex-row items-center justify-center bg-white rounded-full">
                  <Feather name="camera" size={16} color="black" />
                </View>
                {user.photoURL || image ? (
                  <Image
                    source={{ uri: image || user.photoURL }}
                    className="h-32 w-32 rounded-3xl"
                  />
                ) : (
                  <FontAwesome name="user" size={100} color={primaryColor} />
                )}
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-lg font-semibold mb-2">
                Imie i Nazwisko
              </Text>
              <AppTextInput
                placeholder={user.displayName || "Nowa Nazwa..."}
                onChangeText={setName}
                value={name}
                full
              />
            </View>
            <View>
              <View className="flex flex-row justify-between mb-2">
                <Text className="text-lg font-semibold">Adres Email</Text>
                <Text
                  className={`${
                    user.emailVerified ? "text-green-500" : "text-red-500"
                  } text-lg font-semibold`}
                >
                  {user.emailVerified ? "Zweryfikowany" : "Nie Zweryfikowany"}
                </Text>
              </View>
              <AppTextInput
                placeholder={user.email || "Nowy Email..."}
                onChangeText={setEmail}
                value={email}
                full
              />
            </View>
            <View>
              <Text className="text-lg font-semibold mb-2">Hasło Konta</Text>
              <AppTextInput
                placeholder="Nowe Hasło..."
                onChangeText={setNewpass}
                value={newpass}
                secureTextEntry
                full
              />
            </View>
          </View>
          <TouchableOpacity
            className="p-5 rounded-full"
            style={{
              backgroundColor:
                !email && !image && !name && !newpass
                  ? "#000000"
                  : primaryColor,
            }}
            onPress={openModal}
          >
            <Text className="text-white text-xl font-semibold text-center">
              Zapisz zmiany
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default settings;
