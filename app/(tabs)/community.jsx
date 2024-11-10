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
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot } from "firebase/firestore";
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id.toString()));
      Alert.alert("Sukces", "Pomyślnie usunięto post!");
    } catch (e) {
      console.error("Błąd przy usuwaniu postu:", e);
      Alert.alert("Błąd", "Nie udało się usunąć postu:" + e.message);
    }
  };

  const showDeleteAlert = (id) => {
    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć ten post?",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const unsubscribePosts = onSnapshot(
      collection(db, "posts"),
      (querySnapshot) => {
        const postsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          postsArray.push({
            id: doc.id, // Adding id to the object
            ...data,
          });
        });
        setPosts(postsArray); // Set challenges in state
      }
    );

    return () => unsubscribePosts();
  })

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
        createdAt: new Date(),
        author: user?.uid,
        displayName: user?.displayName || "anonymous",
      };

      if (imageUrl) {
        post.photoURL = imageUrl;
      }

      await addDoc(collection(db, "posts"), post);
      Alert.alert("Sukces", "Post został dodany pomyślnie!");
      setTitle("");
      setDescription("");
      setPhoto(null);
      setCreateSheet(false);
    } catch (e) {
      console.error("Błąd przy dodawaniu posta: ", e);
      Alert.alert("Błąd", "Nie udało się dodać posta.");
    }
  };

  const openBottomSheet = () => {
    setCreateSheet(true);
  };

  const closeBottomSheet = () => {
    setPhoto(null);
    setTitle("");
    setDescription("");
    setCreateSheet(false);
  };

  return (
    <SafeAreaView className="flex-1">
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
          <View className="flex flex-row justify-between">
            <Text className="text-3xl font-semibold">Ecofy Forum</Text>
            <TouchableOpacity onPress={openBottomSheet}>
              <FontAwesome name="plus" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {posts.length > 0 ? (
            <View className="flex flex-col gap-5">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  deleteFunction={() => showDeleteAlert(post.id)}
                />
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-5">
              <Text className="text-gray-500 text-xl font-semibold">
                Brak postów.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for Creating Post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createSheet}
        onRequestClose={closeBottomSheet}
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
                  <TouchableOpacity onPress={closeBottomSheet}>
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
                  className="p-5 rounded-full bg-black w-max"
                >
                  <Text className="text-white text-xl text-center font-semibold">
                    Wybierz Zdjęcie
                  </Text>
                </TouchableOpacity>

                {photo && (
                  <Image
                    source={{ uri: photo }}
                    resizeMode="cover"
                    className="w-full h-[355px] rounded-3xl"
                  />
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  className="p-5 rounded-full mb-10"
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
