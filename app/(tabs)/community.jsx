import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, getDocs } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AppTextInput from "../../components/AppTextInput";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";
import Post from "../../components/PostItem";

import { primaryColor } from "../../config.json";

const Community = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [posts, setPosts] = useState([]);
  const [createSheet, setCreateSheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const storage = getStorage();

  const { user } = UserAuth();

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const fetchedPosts = [];
      querySnapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      fetchedPosts.sort((a,b) => b.createdAt.seconds - a.createdAt.seconds)
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Błąd przy pobieraniu postów:", error);
      Alert.alert("Błąd", "Nie udało się pobrać postów.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!photo) return null;

    try {
      const response = await fetch(photo);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${Date.now()}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Błąd przy przesyłaniu zdjęcia:", error);
      Alert.alert("Błąd", "Nie udało się przesłać zdjęcia.");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Błąd", "Proszę uzupełnić tytuł oraz opis.");
      return;
    }

    try {
      const imageUrl = await uploadImage();
      const post = {
        title,
        description,
        imageUrl: imageUrl || "",
        createdAt: new Date(),
        userId: user?.uid || "anonymous",
        userName: user?.displayName || "anonymous",
      };

      await addDoc(collection(db, "posts"), post);
      Alert.alert("Sukces", "Post został dodany pomyślnie!");
      setTitle("");
      setDescription("");
      setPhoto(null);
      setCreateSheet(false);
      fetchPosts();
    } catch (error) {
      console.error("Błąd przy dodawaniu posta:", error);
      Alert.alert("Błąd", "Nie udało się dodać posta.");
    }
  };

  const openBottomSheet = () => {
    setCreateSheet(true);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5 mb-[30%]">
          <View className="flex flex-row justify-between">
            <Text className="text-3xl font-semibold">Ecofy Forum</Text>
            <TouchableOpacity onPress={openBottomSheet}>
              <FontAwesome name="plus" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-col gap-5">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal for Creating Post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createSheet}
        onRequestClose={() => setCreateSheet(false)}
      >
        <View className="flex-1 justify-end items-center">
          <KeyboardAvoidingView
            className="flex-row w-full h-1/2 p-5 bg-white rounded-xl"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView>
              <View className="flex flex-col gap-5">
                <View className="flex flex-row justify-between">
                  <Text className="text-2xl font-semibold">Stwórz post</Text>
                  <TouchableOpacity onPress={() => setCreateSheet(false)}>
                    <FontAwesome name="times" size={20} />
                  </TouchableOpacity>
                </View>
                <AppTextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Podaj tytuł"
                  gray
                  full
                />

                <AppTextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Dodaj treść"
                  multiline
                  gray
                  full
                />

                <TouchableOpacity
                  onPress={pickImage}
                  className="p-4 rounded-xl bg-black"
                >
                  <Text className="text-white text-xl font-semibold">
                    Wybierz Zdjęcie
                  </Text>
                </TouchableOpacity>

                {photo && (
                  <Image
                    source={{ uri: photo }}
                    resizeMode="cover"
                    className="w-full h-[355px] rounded-xl"
                  />
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-white text-xl font-semibold text-center">
                    Utwórz Post
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Community;
