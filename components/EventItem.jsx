import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Alert
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import { primaryColor } from "../config.json";
import { useRouter } from "expo-router";
import { UseMap } from "../context/MapContext";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { parse } from "date-fns";
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
  const [isImageVisible, setIsImageVisible] = useState(false);
  const router = useRouter();
  const { setSelectedEvent } = UseMap();
  const { user } = UserAuth();
  const { width } = Dimensions.get("window");

  const handleShowOnMap = () => {
    setSelectedEvent(event);
    router.replace("/(tabs)/map");
  };

  const handleShowDetails = () => {
    router.push({
      pathname: "/(tabs)/details",
      params: { eventId: event.id },
    });
  };

  const handleDelete = (event) => {
    const currentTime = new Date();
    const eventDate = parse(
      event.date,
      "d.M.yyyy HH:mm:ss",
      new Date()
    );
    const timeDifference = eventDate - currentTime;

    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

    if (timeDifferenceInHours > 0 && timeDifferenceInHours <= 1){
      Alert.alert("Nie udało sie usunąć wydarzenia", "Nie możesz usunąć wydarzenia na godzinę przed jego rozpoczęciem")
    }
    else{
      deleteFunction(event.id);
    }

  };

  useEffect(() => {
    const postRef = doc(db, "events", event.id.toString());

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
    <View key={event.id} className="flex flex-col gap-5 bg-white rounded-3xl p-5">
       {event.photoURL && (
        <TouchableWithoutFeedback onPress={() => setIsImageVisible(true)}>
          <Image
            source={{ uri: event.photoURL }}
            className="rounded-2xl w-full"
            style={{ height: width - 80 }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Modal wyświetlający obraz */}
      <ImageViewing
        images={[{ uri: event.photoURL }]}
        imageIndex={0}
        visible={isImageVisible}
        onRequestClose={() => setIsImageVisible(false)}
      />

      <View className="flex flex-row justify-between">
        <Text className="text-xl font-semibold">{event.title}</Text>
        {deleteFunction && event.host === user.uid ? (
          <TouchableOpacity onPress={() => handleDelete(event)}>
            <Feather name="trash" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <View className="flex flex-row gap-3">
          <TouchableOpacity onPress={checkAndToggleLike}>
            {isLike ? (
              <AntDesign name="heart" size={24} color="red" />
            ) : (
              <Feather name="heart" size={24} color="black" />
            )}
            
          </TouchableOpacity>
          </View>
        )}
      </View>
      <Text className="text-gray-500">{event.address}</Text>
      <View>
        <Text className="font-semibold">Data</Text>
        <Text className="text-gray-500">{event.date}</Text>
      </View>
      <View className="flex flex-row gap-5">
        <TouchableOpacity
          onPress={handleShowOnMap}
          className="p-4 rounded-full"
          style={{ backgroundColor: primaryColor, width: width * 0.5 - 43 }}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Pokaż na mapie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShowDetails}
          className="p-4 rounded-full bg-black"
          style={{ width: width * 0.5 - 43 }}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Szczegóły
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventItem;
