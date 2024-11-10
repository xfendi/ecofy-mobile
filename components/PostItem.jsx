import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";
import { UserAuth } from "../context/AuthContext";

import { primaryColor } from "../config.json";

const Post = ({ post, deleteFunction }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isLike, setIsLike] = useState();
  const [likesLength, setLikesLength] = useState(0);
  const [commentsLength, setCommentsLength] = useState(0);
  const [focused, setFocused] = useState(false);
  const [commentSheet, setCommentSheet] = useState(false);

  const { width } = Dimensions.get("window");
  const { user } = UserAuth();

  const handleDelete = (event) => {
    deleteFunction(event.id);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `posts/${post.id}/comments`),
      (snapshot) => {
        const fetchedComments = [];
        snapshot.forEach((doc) => {
          fetchedComments.push({ id: doc.id, ...doc.data() });
        });
        fetchedComments.sort(
          (a, b) => b.createdAt.seconds - a.createdAt.seconds
        );
        setComments(fetchedComments);
        setCommentsLength(fetchedComments.length);
      },
      (error) => {
        console.error("Błąd przy nasłuchiwaniu komentarzy:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      text: newComment,
      createdAt: new Date(),
      author: user?.uid,
      displayName: user?.displayName || "anonymous",
    };

    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), comment);
      Alert.alert("Sukces", "Pomyślnie dodano komentarz!");
      setNewComment("");
    } catch (e) {
      console.error("Błąd przy dodawaniu komentarza:", e);
      Alert.alert("Błąd", "Nie udało się dodać komentarza: " + e.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "posts", post.id.toString()),
      (doc) => {
        if (doc.exists) {
          const likes = doc.data()?.likes || [];
          setLikesLength(likes.length);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const checkAndToggleLike = async () => {
    const eventRef = doc(db, "posts", post.id.toString());
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const likes = eventData.likes || [];

      if (likes.includes(user.uid)) {
        await updateDoc(eventRef, {
          likes: arrayRemove(user.uid),
        });
        setIsLike(false);
      } else {
        await updateDoc(eventRef, {
          likes: arrayUnion(user.uid),
        });
        setIsLike(true);
      }
    } else {
      console.log("Event nie istnieje.");
    }
  };

  return (
    <View className="flex flex-col gap-5 bg-white rounded-3xl p-5">
      {post.photoURL && (
        <TouchableWithoutFeedback onPress={() => setIsImageVisible(true)}>
          <Image
            source={{ uri: post.photoURL }}
            className="w-full rounded-3xl"
            style={{ height: width - 80 }}
          />
        </TouchableWithoutFeedback>
      )}

      <View className="flex-row justify-between">
        <View>
          <Text className="font-semibold">{post?.userName || "anonymous"}</Text>
          <Text className="text-gray-500 text-[12px]">
            {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>
        {deleteFunction && post.author === user.uid && (
          <TouchableOpacity onPress={() => handleDelete(post)}>
            <Feather name="delete" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-xl font-semibold">{post.title}</Text>

      <ImageViewing
        images={[{ uri: post.imageUrl }]} // Przekazujemy tylko jeden obraz
        imageIndex={0}
        visible={isImageVisible}
        onRequestClose={() => setIsImageVisible(false)}
      />

      <Text>{post.description}</Text>

      <View className={`border-t-2 pt-5 ${post.author !== user.uid ? "justify-between" : "justify-end"} border-gray-100 flex flex-row`}>
        {post.author !== user.uid && (
          <TouchableOpacity
            onPress={checkAndToggleLike}
            className="flex flex-row gap-3 items-center"
          >
            {isLike ? (
              <AntDesign name="heart" size={20} color="#ef4444" />
            ) : (
              <Feather name="heart" size={20} color="#6b7280" />
            )}
            <Text className={isLike ? "text-red-500" : "text-gray-500"}>
              {likesLength}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setCommentSheet(true)}
          className="flex flex-row gap-3 items-center"
        >
          <Feather name="message-circle" size={20} color="#6b7280" />
          <Text className="text-gray-500">{commentsLength}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={commentSheet}
        onRequestClose={() => setCommentSheet(false)}
      >
        <View className="flex-1 justify-end items-center">
          <KeyboardAvoidingView
            className="flex-row w-full h-1/2 p-5 bg-white rounded-t-3xl"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="flex flex-col gap-5 w-full">
              <View className="flex flex-row justify-between">
                <Text className="text-2xl font-semibold">Komentarze</Text>
                <TouchableOpacity onPress={() => setCommentSheet(false)}>
                  <FontAwesome name="times" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <View className="flex flex-col gap-5">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <View key={comment.id}>
                        <Text className="font-semibold">
                          {comment.displayName}
                        </Text>
                        <Text>{comment.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-gray-500">Brak komentarzy</Text>
                  )}
                </View>
              </ScrollView>

              <View className="flex flex-row justify-between items-center mb-10">
                <TextInput
                  className={`w-80 px-5 py-3 rounded-full bg-gray-100 border-2 ${
                    focused
                      ? "border-green-500 border-solid"
                      : "border-transparent"
                  }`}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Dodaj komentarz ..."
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
                <TouchableOpacity
                  onPress={addComment}
                  className={`flex flex-row items-center justify-center w-12 h-12 rounded-full bg-gray-100 border-2 ${
                    newComment
                      ? "border-green-500 border-solid"
                      : "border-transparent"
                  }`}
                >
                  <FontAwesome
                    name="send"
                    size={20}
                    color={newComment ? primaryColor : "#d1d5db"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default Post;
