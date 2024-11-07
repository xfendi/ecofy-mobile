import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Importuj useRouter

import { primaryColor } from "../config.json";
import { db } from "../firebase";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";

const EventListItem = ({ eventData, onClose, deleteFunction }) => {
  const [isLike, setIsLike] = useState();
  const { user } = UserAuth();
  const router = useRouter(); // Inicjalizuj router

  const isHost = eventData.host === user.uid;

  const handleShowDetails = () => {
    router.push({
      pathname: "/(tabs)/details", // Ścieżka do której kierujemy
      params: { eventId: eventData.id }, // Przekazujemy eventId jako część URL
    });
  };

  const handleDelete = (event) => {
    deleteFunction(event.id);
  };

  useEffect(() => {
    const likes = eventData.likes || [];
    if (likes.includes(user.uid)) {
      setIsLike(true);
    } else {
      setIsLike(false);
    }
  }, []);

  const checkAndToggleLike = async () => {
    const eventRef = doc(db, "events", eventData.id.toString());
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
    <View className="absolute bottom-[100px] right-5 left-5 bg-white p-5 rounded-xl flex flex-col gap-5">
      <View className="flex flex-col gap-5">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-xl font-semibold">{eventData?.title}</Text>
          <View className="flex flex-row items-center gap-5">
            {!isHost ? (
              <TouchableOpacity onPress={checkAndToggleLike}>
                {isLike ? (
                  <AntDesign name="heart" size={24} color="red" />
                ) : (
                  <Feather name="heart" size={24} color="black" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleDelete}>
                <AntDesign name="delete" size={24} color="red" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-gray-500">{eventData?.address}</Text>
        <Text>{eventData?.date}</Text>
      </View>
      <TouchableOpacity
        onPress={handleShowDetails}
        className="p-4 rounded-xl bg-black"
      >
        <Text className="text-white text-xl font-semibold text-center">
          Szczegóły
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventListItem;
