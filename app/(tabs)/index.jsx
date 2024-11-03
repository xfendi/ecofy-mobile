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
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase"; // Upewnij się, że ścieżka jest poprawna
import { UserAuth } from "../../context/AuthContext";
import EventItem from "../../components/EventItem";
import EcoChallengeItem from "../../components/EcoChallengeItem"; // Importujemy komponent wyzwań
import NewsItem from "../../components/NewsItem"; // Importujemy komponent aktualności
import NotificationItem from "../../components/NotificationItem"; // Importujemy komponent powiadomień
import { tips, faq, challenges } from "../../test-variables";
import { parse } from 'date-fns';

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsInThreeDays, setEventsInThreeDays] = useState([]);
  const [news, setNews] = useState([]);
  const [notifications, setNotifications] = useState([]); // Stan na powiadomienia

  const [isDeleteModal, setIsDeleteModal] = useState();
  const [idToDelete, setIdToDelete] = useState();

  const { user } = UserAuth();
  const router = useRouter();
  const firstName = user?.displayName;

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

  // Pobieranie wydarzeń, aktualności i powiadomień z Firestore
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({
            id: doc.id, // Dodajemy id do obiektu
            ...data,
          });
        });
        setEvents(docsArray);
        generateNotifications(docsArray); // Generujemy powiadomienia na podstawie wydarzeń
        generateUpcomingEvents(docsArray);
      }
    );

    const unsubscribeNews = onSnapshot(
      collection(db, "news"),
      (querySnapshot) => {
        const newsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          newsArray.push({
            id: doc.id, // Dodajemy id do obiektu
            ...data,
          });
        });
        setNews(newsArray);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeNews();
    };
  }, []);

  // Funkcja do generowania powiadomień na podstawie nadchodzących wydarzeń
  const generateNotifications = (events) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Jutro

    const upcomingEvents = events.filter((event) => {
      const eventDate = parse(event.date, 'dd.MM.yyyy HH:mm:ss', new Date());
      return eventDate >= now && eventDate <= tomorrow;
    });

    const newNotifications = upcomingEvents.map((event) => ({
      id: event.id, // Używamy id wydarzenia jako id powiadomienia
      event: event,
      message: `Wydarzenie "${event.title}" rozpoczyna się jutro o ${event.date}.`,
    }));

    setNotifications(newNotifications);
  };

  const generateUpcomingEvents = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Jutro

    const upcomingEvents = events.filter((event) => {
      const eventDate = parse(event.date, 'dd.MM.yyyy HH:mm:ss', new Date());
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
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
            <Text className="text-3xl font-bold">Witaj, {firstName} 👋</Text>
            <TouchableOpacity onPress={() => router.replace("/profile")}>
              <Image
                source={{ uri: user.photoURL }}
                className="rounded-full"
                style={{ height: 44, width: 44 }}
              />
            </TouchableOpacity>
          </View>

          {/* Powiadomienia */}
          <Text className="text-2xl font-semibold mb-2">Powiadomienia</Text>
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

          {/* Nadchodzące Wydarzenia */}
          <Text className="text-2xl font-semibold mb-2">
            Nadchodzące Wydarzenia
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
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
              <Text className="text-gray-500 text-xl font-semibold">
                Brak wydarzeń
              </Text>
            )}
          </View>

          {/* Aktualności */}
          <Text className="text-2xl font-semibold mb-2">Aktualności</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {news.length > 0 ? (
              news.map((item) => <NewsItem key={item.id} news={item} />)
            ) : (
              <Text className="text-gray-500 text-xl font-semibold">
                Brak aktualności
              </Text>
            )}
          </View>

          {/* Wyzwania Ekologiczne */}
          <Text className="text-2xl font-semibold mb-2">
            Wyzwania Ekologiczne
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl ">
            {challenges.map((item) => (
              <EcoChallengeItem key={item.id} challenge={item} />
            ))}
          </View>

          {/* Poradniki Ekologiczne */}
          <Text className="text-2xl font-semibold mb-2">
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
          <Text className="text-2xl font-semibold mb-2">FAQ Ekologiczne</Text>
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
