import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
  Platform,
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
  const [notifications, setNotifications] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const { user } = UserAuth();

  const router = useRouter();

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : null;

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

  // Pobieranie wydarzeń, aktualności, powiadomień i wyzwań ekologicznych z Firestore
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({
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

        setEvents(upcomingEvents.slice(0, 5));

        generateNotifications(upcomingEvents);
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
    
        const upcomingChallenges = challengesArray
          .sort((a, b) => {
            // Konwersja endTime na obiekt Date, sortowanie po dacie zakończenia
            const dateA = new Date(a.endTime);
            const dateB = new Date(b.endTime);
            return dateA - dateB; // Sortuje rosnąco (od najbliższej do najdalszej daty zakończenia)
          });
    
        setChallenges(upcomingChallenges); // Set challenges in state
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

    const challengesTomorrow = challenges.filter((challenge) => {
      const challengeEndTime = new Date(challenge.endTime)
      return challengeEndTime >= now && challengeEndTime <= tomorrow;
    })

    const eventNotifications = upcomingEvents.map((event) => ({
      id: event.id, // Używamy id wydarzenia jako id powiadomienia
      event: event,
      title: `Wydarzenie`,
      message: `${event.title} rozpoczyna się ${event.date}`,
    }));

    const challengeNotifications = challengesTomorrow.map((challenge) => ({
      id: `challenge-${challenge.id}`, // Identyfikator powiadomienia dla wyzwania
      challenge: challenge,
      title: `Koniec wyzwania`,
      message: `${challenge.title} kończy się ${new Date(challenge.endTime).toLocaleString()}!`,
    }));

    const newNotifications = [...eventNotifications, ...challengeNotifications]

    setNotifications(newNotifications);
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
      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
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
          <View className="p-5 flex flex-col gap-5 bg-white rounded-3xl">
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
          <Text className="text-2xl font-semibold">Nadchodzace Wydarzenia</Text>

          <View className="flex flex-col gap-5">
            {events.length > 0 ? (
              <>
                {events.map((item) => (
                  <EventItem
                    key={item.id}
                    event={item}
                    deleteFunction={() => {
                      showDeleteAlert(item.id);
                    }}
                  />
                ))}
                <TouchableOpacity
                  className="p-5 rounded-full bg-blue-500"
                  onPress={showMore}
                >
                  <Text className="text-white text-lg font-semibold text-center">
                    Pokaż wszystkie wydarzenia
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="bg-white rounded-3xl p-5">
                <Text className="text-gray-500 text-xl font-semibold">
                  Brak nadchodzacych wydarzeń.
                </Text>
              </View>
            )}
          </View>

          {/* Wyzwania Ekologiczne */}
          <Text className="text-2xl font-semibold">Wyzwania Ekologiczne</Text>
          <View className="flex flex-col gap-5">
            {challenges.length > 0 ? (
              challenges.map((item) => (
                <EcoChallengeItem key={item.id} challenge={item} />
              ))
            ) : (
              <Text className="text-gray-500 text-3xl font-semibold">
                Brak wyzwań ekologicznych.
              </Text>
            )}
          </View>

          {/* Poradniki Ekologiczne */}
          <Text className="text-2xl font-semibold">Poradniki Ekologiczne</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-3xl">
            {tips.map((item) => (
              <View key={item.id} className="border-b border-gray-200 pb-5">
                <Text className="text-xl font-semibold">{item.title}</Text>
                <Text className="text-gray-500">{item.description}</Text>
              </View>
            ))}
          </View>

          {/* FAQ Ekologiczne */}
          <Text className="text-2xl font-semibold">FAQ Ekologiczne</Text>
          <View
            className={`p-5 flex flex-col gap-5 bg-white rounded-3xl ${
              Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"
            }`}
          >
            {faq.map((item) => (
              <View key={item.id} className="border-b border-gray-200 pb-5">
                <Text className="text-xl font-semibold">{item.question}</Text>
                <Text className="text-gray-500">{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
