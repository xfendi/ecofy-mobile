import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Importuj useRouter

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
import { parse } from "date-fns";

const EventListItem = ({ eventData, deleteFunction }) => {
  const [isLike, setIsLike] = useState();
  const { user } = UserAuth();
  const router = useRouter();

  const isHost = eventData.host === user.uid;

  const handleShowDetails = () => {
    router.push({
      pathname: "/(tabs)/details",
      params: { eventId: eventData.id },
    });
  };

  const handleDelete = (event) => {
    const currentTime = new Date();
    const eventDate = parse(eventData.date, "d.M.yyyy HH:mm:ss", new Date());
    const timeDifference = eventDate - currentTime;

    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

    if (timeDifferenceInHours > 0 && timeDifferenceInHours <= 1) {
      Alert.alert(
        "Nie udało sie usunąć wydarzenia",
        "Nie możesz usunąć wydarzenia na godzinę przed jego rozpoczęciem"
      );
    } else {
      deleteFunction(event.id);
    }
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
    <View
      className={`absolute ${
        Platform.OS === "ios" ? "bottom-[103px]" : "bottom-[88px]"
      } right-5 left-5 bg-white p-5 rounded-3xl flex flex-col gap-5`}
    >
      <View className="flex flex-col gap-5">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-2xl font-semibold">{eventData?.title}</Text>
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
                <Feather name="trash" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {eventData?.address && (
          <Text className="text-gray-500">{eventData?.address}</Text>
        )}
        <Text>{eventData?.date}</Text>
      </View>
      <TouchableOpacity
        onPress={handleShowDetails}
        className="p-5 rounded-full bg-black"
      >
        <Text className="text-white text-xl font-semibold text-center">
          Szczegóły
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventListItem;
