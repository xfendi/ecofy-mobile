import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { parse, isBefore } from "date-fns";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase"; // Upewnij się, że ścieżka jest poprawna
import { UserAuth } from "../../context/AuthContext";
import EventItem from "../../components/EventItem";
import EcoChallengeItem from "../../components/EcoChallengeItem"; // Importujemy komponent wyzwań
import NotificationItem from "../../components/NotificationItem"; // Importujemy komponent powiadomień
import { tips, faq } from "../../test-variables";
import { primaryColor } from "../../config.json";

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsInThreeDays, setEventsInThreeDays] = useState([]);
  const [notifications, setNotifications] = useState([]); // Stan na powiadomienia
  const [challenges, setChallenges] = useState([]); // Stan na wyzwania ekologiczne
  const [selectedTab, setSelectedTab] = useState("upcomingEvents");

  const [isDeleteModal, setIsDeleteModal] = useState();
  const [idToDelete, setIdToDelete] = useState();

  const { user } = UserAuth();
  const router = useRouter();
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : null;

  const handleDelete = async () => {
    setIsDeleteModal(false);
    try {
      await deleteDoc(doc(db, "events", idToDelete.toString()));
      Alert.alert("Event został usunięty!");
    } catch (e) {
      console.error("Błąd przy usuwaniu eventu:", e);
      Alert.alert("Błąd", "Nie udało się usunąć eventu: ", e.message);
    }
  };

  // Pobieranie wydarzeń, aktualności, powiadomień i wyzwań ekologicznych z Firestore
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({
            id: doc.id, // Adding id to the object
            ...data,
          });
        });

        // Filter out events that have already passed and sort by date
        const now = new Date();
        const upcomingEvents = docsArray
          .filter((event) => {
            // Parse the event date
            const eventDate = parse(
              event.date,
              "d.M.yyyy HH:mm:ss",
              new Date()
            );
            return isBefore(now, eventDate); // Include only future events
          })
          .sort((a, b) => {
            // Sort events by date (from nearest to farthest)
            const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
            const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
            return dateA - dateB; // Sort in ascending order
          });

        // Limit the length of the array to 5 after filtering and sorting
        setEvents(upcomingEvents.slice(0, 5));

        generateNotifications(upcomingEvents); // Generate notifications based on upcoming events
        generateUpcomingEvents(upcomingEvents);
      }
    );

    const unsubscribeChallenges = onSnapshot(
      collection(db, "ecoChallenges"),
      (querySnapshot) => {
        const challengesArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          challengesArray.push({
            id: doc.id, // Adding id to the object
            ...data,
          });
        });
        setChallenges(challengesArray); // Set challenges in state
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeChallenges();
    };
  }, []);

  // Funkcja do generowania powiadomień na podstawie nadchodzących wydarzeń
  const generateNotifications = (events) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Jutro

    const upcomingEvents = events.filter((event) => {
      const eventDate = parse(event.date, "dd.MM.yyyy HH:mm:ss", new Date());
      return eventDate >= now && eventDate <= tomorrow;
    });

    const newNotifications = upcomingEvents.map((event) => ({
      id: event.id, // Używamy id wydarzenia jako id powiadomienia
      event: event,
      title: `Wydarzenie`,
      message: `${event.title} rozpoczyna się ${event.date}`,
    }));

    setNotifications(newNotifications);
  };

  const generateUpcomingEvents = (events) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Jutro

    const upcomingEvents = events.filter((event) => {
      const eventDate = parse(event.date, "dd.MM.yyyy HH:mm:ss", new Date());
      return eventDate >= now && eventDate <= tomorrow;
    });

    const newEvents = upcomingEvents.map((event) => ({ ...event }));

    setEventsInThreeDays(newEvents);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const showMore = () => {
    router.push("/(tabs)/events");
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
              onPress={handleDelete}
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
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5">
          {/* Logo aplikacji */}
          <View className="flex flex-row justify-between items-center">
            <Text className="text-3xl font-bold w-80">
              Witaj, {firstName} 👋
            </Text>
            <TouchableOpacity onPress={() => router.replace("/profile")}>
              <Image
                source={{ uri: user?.photoURL }}
                className="rounded-full"
                style={{ height: 44, width: 44 }}
              />
            </TouchableOpacity>
          </View>

          {/* Powiadomienia */}
          <Text className="text-2xl font-semibold">Powiadomienia</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <NotificationItem key={item.id} notification={item} />
              ))
            ) : (
              <Text className="text-gray-500 text-xl font-semibold">
                Brak nowych powiadomień.
              </Text>
            )}
          </View>

          {/* Wydarzenia */}
          <Text className="text-2xl font-semibold">Wydarzenia</Text>
          <View className="flex flex-row gap-5">
            <TouchableOpacity
              onPress={() => setSelectedTab("upcomingEvents")}
              className="flex-1 p-5 rounded-full"
              style={{
                backgroundColor:
                  selectedTab === "upcomingEvents" ? primaryColor : "white",
              }}
            >
              <Text
                className={`text-lg font-semibold text-center ${
                  selectedTab === "upcomingEvents" ? "text-white" : "text-black"
                }`}
              >
                Nadchodzące
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("allEvents")}
              className="flex-1 p-5 rounded-full"
              style={{
                backgroundColor:
                  selectedTab === "allEvents" ? primaryColor : "white",
              }}
            >
              <Text
                className={`text-lg font-semibold text-center ${
                  selectedTab === "allEvents" ? "text-white" : "text-black"
                }`}
              >
                Wszystkie
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === "upcomingEvents" ? (
            <>
              <View className="flex flex-col gap-5">
                {eventsInThreeDays.length > 0 ? (
                  eventsInThreeDays.map((item) => (
                    <EventItem
                      key={item.id}
                      event={item}
                      deleteFunction={() => {
                        setIsDeleteModal(true);
                        setIdToDelete(item.id);
                      }}
                    />
                  ))
                ) : (
                  <Text className="text-gray-500 bg-white rounded-xl p-5 text-xl font-semibold">
                    Brak nadchodzacych wydarzeń.
                  </Text>
                )}
              </View>
            </>
          ) : (
            <>
              <View className="flex flex-col gap-5">
                {events.length > 0 ? (
                  events.map((item) => (
                    <EventItem
                      key={item.id}
                      event={item}
                      deleteFunction={() => {
                        setIsDeleteModal(true);
                        setIdToDelete(item.id);
                      }}
                    />
                  ))
                ) : (
                  <Text className="text-gray-500 bg-white rounded-xl p-5 text-xl font-semibold">
                    Brak wydarzeń.
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="p-4 rounded-xl bg-black"
                onPress={showMore}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Pokaż więcej
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Wyzwania Ekologiczne */}
          <Text className="text-2xl font-semibold">
            Wyzwania Ekologiczne
          </Text>
          <View className="flex flex-col gap-5">
            {challenges.length > 0 ? (
              challenges.map((item) => (
                <EcoChallengeItem key={item.id} challenge={item} />
              ))
            ) : (
              <Text className="text-gray-500 text-xl font-semibold">
                Brak wyzwań ekologicznych.
              </Text>
            )}
          </View>

          {/* Poradniki Ekologiczne */}
          <Text className="text-2xl font-semibold">
            Poradniki Ekologiczne
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {tips.map((item) => (
              <View key={item.id} className="border-b border-gray-200 pb-5">
                <Text className="text-xl font-semibold">{item.title}</Text>
                <Text>{item.description}</Text>
              </View>
            ))}
          </View>

          {/* FAQ Ekologiczne */}
          <Text className="text-2xl font-semibold">FAQ Ekologiczne</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl mb-[30%]">
            {faq.map((item) => (
              <View key={item.id} className="border-b border-gray-200 pb-5">
                <Text className="text-xl font-semibold">{item.question}</Text>
                <Text>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
