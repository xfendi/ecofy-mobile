import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";

import { db } from "../firebase";
import { UserAuth } from "../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import AppTextInput from "./AppTextInput";

import ImageViewing from "react-native-image-viewing";

const Post = ({ post }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const { width } = Dimensions.get("window");

  const [isImageVisible, setIsImageVisible] = useState(false);
  const { user } = UserAuth();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const commentsSnapshot = await getDocs(
        collection(db, `posts/${post.id}/comments`)
      );
      const fetchedComments = [];
      commentsSnapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() });
      });
      fetchedComments.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Błąd przy pobieraniu komentarzy:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      text: newComment,
      createdAt: new Date(),
      userId: user?.uid || "anonymous", // Dodanie userId do komentarza
      userName: user?.displayName || "anonymous",
    };

    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), comment);
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Błąd przy dodawaniu komentarza:", error);
    }
  };

  return (
    <View className="flex flex-col gap-5 bg-white rounded-2xl p-5">
      <View>
        <Text className="font-semibold">{post?.userName || "anonymous"}</Text>
        <Text className="text-gray-500 text-[12px]">
          {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
        </Text>
      </View>

      <Text className="text-xl font-semibold">{post.title}</Text>

      {post.imageUrl && (

        <TouchableWithoutFeedback onPress={() => setIsImageVisible(true)}>
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full rounded-xl"
          style={{ height: width - 80 }}
        />
        </TouchableWithoutFeedback>
      )}
      <ImageViewing
        images={[{ uri: post.imageUrl }]} // Przekazujemy tylko jeden obraz
        imageIndex={0}
        visible={isImageVisible}
        onRequestClose={() => setIsImageVisible(false)}
      />

      <Text>{post.description}</Text>

      <Text className="text-xl font-semibold">Komentarze</Text>
      <View className="flex flex-col gap-5">
        <ScrollView>
          <View className="flex flex-col gap-5">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id}>
                  <Text className="font-semibold">
                    {comment.userName || "anonymous"}
                  </Text>
                  <Text>{comment.text}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500">Brak komentarzy</Text>
            )}
          </View>
        </ScrollView>

        <View className="flex flex-row justify-between items-center">
          <AppTextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Dodaj komentarz ..."
            gray
          />
          <TouchableOpacity onPress={addComment}>
            <FontAwesome name="send" size={32} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  commentsList: {
    maxHeight: 150,
    marginTop: 8,
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: "bold",
  },
  commentInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  addCommentButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addCommentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Post;