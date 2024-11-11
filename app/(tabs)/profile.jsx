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
import { Link, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

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

import { UserAuth } from "../../context/AuthContext";
import { primaryColor } from "../../config.json";
import EventItem from "../../components/EventItem";
import { db } from "../../firebase";
import { isAfter, isBefore, parse } from "date-fns";

const Profile = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [events, setEvents] = useState([]);
  const [archiveEvents, setArchiveEvents] = useState([]);

  const [tab, setTab] = useState("active");

  const [likedEvents, setLikedEvents] = useState([]);

  const { user } = UserAuth();

  const router = useRouter();

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("host", "==", user.uid));

    // Listener na żywo pobierający eventy, w których host == user.uid
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ ...doc.data() });
      });

      const activeEvents = eventsList
        .filter((event) => {
          const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
          return isBefore(new Date(), eventDate);
        })
        .sort((a, b) => {
          const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
          const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
          return dateA - dateB;
        });

      const inactiveEvents = eventsList
        .filter((event) => {
          const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
          return isAfter(new Date(), eventDate);
        })
        .sort((a, b) => {
          const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
          const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
          return dateA - dateB;
        });

      setEvents(activeEvents);
      setArchiveEvents(inactiveEvents);
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

      const activeLikedEvents = eventsList
        .filter((event) => {
          const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
          return isBefore(new Date(), eventDate);
        })
        .sort((a, b) => {
          const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
          const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
          return dateA - dateB;
        });

      setLikedEvents(activeLikedEvents);
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id.toString()));
      Alert.alert("Sukces", "Pomyślnie usunięto wydarzenie!");
    } catch (e) {
      console.error("Błąd przy usuwaniu wydarzenia:", e);
      Alert.alert("Błąd", "Nie udało się usunąć wydarzenia: ", e.message);
    }
  };

  const showDeleteAlert = (id) => {
    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć to wydarzenie?",
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

  const handleDeleteInterestedEvent = async (id) => {
    const eventRef = doc(db, "events", id.toString());
    await updateDoc(eventRef, {
      likes: arrayRemove(user.uid),
    });
  };

  return (
    <SafeAreaView className="flex-1">
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
          <View className="flex flex-row gap-5">
            <TouchableOpacity
              onPress={() => setTab("active")}
              className="p-5 rounded-full flex-1"
              style={{
                backgroundColor: tab === "active" ? primaryColor : "white",
              }}
            >
              <Text
                className={`${
                  tab === "active" ? "text-white" : "text-black"
                } text-xl font-semibold text-center`}
              >
                Aktywne
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab("archive")}
              className="p-5 rounded-full flex-1"
              style={{
                backgroundColor: tab === "archive" ? primaryColor : "white",
              }}
            >
              <Text
                className={`${
                  tab === "archive" ? "text-white" : "text-black"
                } text-xl font-semibold text-center`}
              >
                Archiwum
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-5">
            {tab === "active" ? (
              events.length > 0 ? (
                events.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    deleteFunction={() => {
                      showDeleteAlert(event.id);
                    }}
                  />
                ))
              ) : (
                <View className="bg-white rounded-3xl p-5">
                  <Text className="text-gray-500 text-xl font-semibold">
                    Brak aktywnych wydarzeń.
                  </Text>
                </View>
              )
            ) : archiveEvents.length > 0 ? (
              archiveEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  deleteFunction={() => {
                    showDeleteAlert(event.id);
                  }}
                />
              ))
            ) : (
              <View className="bg-white rounded-3xl p-5">
                <Text className="text-gray-500 text-xl font-semibold">
                  Brak archiwalnych wydarzeń.
                </Text>
              </View>
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
              <View className="bg-white rounded-3xl p-5">
                <Text className="text-gray-500 text-xl font-semibold">
                  Brak polubionych wydarzeń.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
