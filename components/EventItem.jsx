import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { primaryColor } from "../config.json";
import { useRouter } from "expo-router";
import { UseMap } from "../context/MapContext";
import { UserAuth } from "../context/AuthContext";

import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

const EventItem = ({ event, deleteFunction }) => {
  const [isLike, setIsLike] = useState();
  const router = useRouter();
  const { setSelectedEvent } = UseMap(); // Access the context
  const { user } = UserAuth();

  const handleShowOnMap = () => {
    setSelectedEvent(event);
    router.replace("/(tabs)/map");
  };

  const handleDelete = (event) => {
    deleteFunction(event.id);
  };

  useEffect(() => {
    const postRef = doc(db, "events", event.id.toString());

    // Listener nasłuchujący zmian w dokumencie
    const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const likes = data.likes || [];
        if (likes.includes(user.uid)) {
          setIsLike(true);
        } else {
          setIsLike(false);
        }
      } else {
        console.log("Dokument nie istnieje.");
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAndToggleLike = async () => {
    const eventRef = doc(db, "events", event.id.toString());
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
    <View key={event.id} className="flex flex-col gap-5">
      <View className="flex flex-row justify-between">
        <Text className="text-xl font-semibold" style={{ color: primaryColor }}>
          {event.title}
        </Text>
        {deleteFunction ? (
          <TouchableOpacity onPress={() => handleDelete(event)}>
            <AntDesign name="delete" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={checkAndToggleLike}>
            {isLike ? (
              <AntDesign name="heart" size={24} color="red" />
            ) : (
              <Feather name="heart" size={24} color="black" />
            )}
          </TouchableOpacity>
        )}
      </View>
      <Text>{event.description}</Text>
      <View>
        <Text>{event.address}</Text>
        <Text className="text-gray-400">{event.date}</Text>
        <Text className="text-gray-400">
          {event.coordinates.latitude.toFixed(3)},{" "}
          {event.coordinates.longitude.toFixed(3)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleShowOnMap}
        className="p-4 rounded-xl"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        <Text className="text-white text-xl font-semibold text-center">
          Pokaż na mapie
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventItem;
