import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { primaryColor } from "../../config.json";
import { UserAuth } from "../../context/AuthContext";
import AppTextInput from "../../components/AppTextInput";
import { storage } from "../../firebase";
import Loading from "../../components/Loading";

const settings = () => {
  const [isModal, setIsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [newpass, setNewpass] = useState();
  const [password, setPassword] = useState();

  const [image, setImage] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const { logout, user } = UserAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (!selectedImage) {
        setImage(user.photoURL || undefined);
        return;
      }

      setImage(selectedImage);
    }, [user])
  );

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/settings");
    closeModal();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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
    if (
      !name &&
      !email &&
      !newpass &&
      !selectedImage &&
      image == user.photoURL
    ) {
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
    setImage(user.photoURL || undefined);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      const pickedImage = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      setSelectedImage(pickedImage.uri);
      setImage(pickedImage.uri);
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      console.log("removing selected image")
      setSelectedImage(undefined);
      setImage(user.photoURL || undefined);
      return;
    } else if (user.photoURL) {
      console.log("removing image")
      setImage(undefined);
      return;
    } else if (!user.photoURL) {
      Alert.alert("Błąd", "Brak zdjęcia profilowego do usunięcia.");
      return;
    } else {
      Alert.alert("Błąd", "Nie znaleziono zdjęcia.");
      return;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      closeModal();

      const credentials = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credentials);

      if (name) {
        await updateProfile(user, { displayName: name });
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

      if (selectedImage || image !== user.photoURL) {
        if (selectedImage) {
          console.log(selectedImage);
          const response = await fetch(selectedImage);
          const blob = await response.blob();

          const fileRef = ref(storage, `profiles/${user.uid}`);

          try {
            console.log("Uploading to Firebase Storage...");
            await uploadBytes(fileRef, blob);

            const DownloadURL = await getDownloadURL(fileRef);
            await updateProfile(user, { photoURL: DownloadURL });
          } catch (e) {
            console.error(e);
            Alert.alert(
              "Błąd",
              `Nie udało się załadować zdjęcia do bazy danych.`
            );
          }
        } else {
          console.log("Removing image...");
          await updateProfile(user, { photoURL: "" });
        }
      }

      Alert.alert("Sukces", "Pomyślnie zaktualizowano ustawienia konta.");
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      closeModal();
      Alert.alert("Błąd", e.message);
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {isLoading && <Loading />}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModal}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end items-center">
          <KeyboardAvoidingView
            className="flex-row w-full h-1/2 p-5 bg-white rounded-t-3xl"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView>
              <View className="flex flex-col gap-5">
                <View className="flex flex-row justify-between">
                  <Text className="text-2xl font-semibold">
                    Potwierdź hasło
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <FontAwesome name="times" size={20} />
                  </TouchableOpacity>
                </View>
                <AppTextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Aktualne Hasło"
                  secureTextEntry
                  gray
                  full
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  className="p-5 rounded-full mb-10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-white text-xl font-semibold text-center">
                    Potwierdź
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
              className="bg-white rounded-3xl p-5"
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
            <View className="flex-row gap-5 items-center">
              <TouchableOpacity>
                {!isImageRemoved && image ? (
                  <Image
                    source={{ uri: image }}
                    className="h-32 w-32 rounded-3xl"
                  />
                ) : (
                  <Feather name="user" size={100} color={primaryColor} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className="h-20 w-20 flex-row items-center justify-center bg-white rounded-3xl"
              >
                <Feather name="camera" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={removeImage}
                className="h-20 w-20 flex-row items-center justify-center bg-white rounded-3xl"
              >
                <Feather name="trash" size={24} color="red" />
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
                !name &&
                !email &&
                !newpass &&
                !selectedImage &&
                image == user.photoURL
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
