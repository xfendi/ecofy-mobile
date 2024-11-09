import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserAuth } from "../../context/AuthContext";
import { Link, useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons"; // Importuj ikonę FontAwesome
import { primaryColor } from "../../config.json";
import EventItem from "../../components/EventItem";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

const Profile = () => {
  const { user, logout } = UserAuth();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [myEvents, setMyEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);
  const [idToDelete, setIdToDelete] = useState();
  const [isDeleteModal, setIsDeleteModal] = useState();

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("host", "==", user.uid));

    // Listener na żywo pobierający eventy, w których host == user.uid
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ ...doc.data() });
      });
      setMyEvents(eventsList); // aktualizacja stanu eventów
    });

    // Czyścimy listener przy demontażu komponentu
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("likes", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ ...doc.data() });
      });
      setLikedEvents(eventsList); // Aktualizacja stanu z polubionymi eventami
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/profile");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const handleDeleteCreatedEvent = async () => {
    setIsDeleteModal(false); // Zamykamy modal po usunięciu
    try {
      await deleteDoc(doc(db, "events", idToDelete.toString()));
      Alert.alert("Event został usunięty!");
    } catch (e) {
      console.error("Błąd przy usuwaniu eventu:", e);
      Alert.alert("Błąd", "Nie udało się usunąć eventu: ", e.message);
    }
  };

  const handleDeleteInterestedEvent = async (id) => {
    const eventRef = doc(db, "events", id.toString());
    await updateDoc(eventRef, {
      likes: arrayRemove(user.uid),
    });
  };

  return (
    <SafeAreaView className="flex-1">
      {isDeleteModal && (
        <View
          className="absolute flex items-center w-full bottom-0 top-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <View className="bg-gray-100 p-5 w-80 m-auto rounded-xl flex flex-col gap-5 z-50">
            <Text className="text-2xl font-semibold">Potwierdź Usunięcie</Text>

            <TouchableOpacity
              onPress={handleDeleteCreatedEvent}
              className="p-4 rounded-xl w-full bg-red-500"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Potwierdź
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsDeleteModal(false)}
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
        <View className="flex-col gap-5">
          <View className="flex flex-col gap-5">
            <View className="flex flex-col items-center gap-5">
              {user.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  className="rounded-full"
                  style={{ height: 80, width: 80 }}
                />
              ) : (
                <Feather name="user" size={64} color={primaryColor} />
              )}
              <View>
                <Text className="text-3xl text-center font-bold w-80">
                  {user.displayName}
                </Text>
                <Text className="text-lg text-gray-500 text-center w-80">
                  {user.email}
                </Text>
              </View>
            </View>
            <View className="flex flex-row w-full gap-5 justify-center">
              <TouchableOpacity
                className="p-5 rounded-full w-full"
                style={{ backgroundColor: primaryColor }}
              >
                <Link
                  href="/settings"
                  className="text-white text-xl font-semibold text-center"
                >
                  Ustawienia Konta
                </Link>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-2xl font-semibold">Moje wydarzenia</Text>
          <View className="gap-5">
            {myEvents.length > 0 ? (
              myEvents.map((event) => (
                <EventItem
                  event={event}
                  key={event.id}
                  deleteFunction={() => {
                    setIsDeleteModal(true);
                    setIdToDelete(event.id);
                  }}
                />
              ))
            ) : (
              <Text className="text-gray-500 text-xl font-semibold">
                Brak utworzonych wydarzeń.
              </Text>
            )}
          </View>

          <Text className="text-2xl font-semibold">Polubione wydarzenia</Text>
          <View
            className={`gap-5 ${
              Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"
            }`}
          >
            {likedEvents.length > 0 ? (
              likedEvents.map((event) => (
                <EventItem
                  event={event}
                  key={event.id}
                  deleteFunction={handleDeleteInterestedEvent}
                />
              ))
            ) : (
              <Text className="text-gray-500 text-xl font-semibold bg-white p-5 rounded-3xl">
                Brak polubionych wydarzeń.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
