import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase"; // Upewnij się, że ścieżka jest poprawna
import { UserAuth } from "../../context/AuthContext";
import EventItem from "../../components/EventItem";
import EcoChallengeItem from "../../components/EcoChallengeItem"; // Importujemy komponent wyzwań
import NewsItem from "../../components/NewsItem"; // Importujemy komponent aktualności
import NotificationItem from "../../components/NotificationItem"; // Importujemy komponent powiadomień
import { tips, faq, challenges } from "../../test-variables";

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [notifications, setNotifications] = useState([]); // Stan na powiadomienia
  const { user } = UserAuth();
  const router = useRouter();
  const firstName = user?.displayName;

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

    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date); // Upewnij się, że 'date' jest datą
      return eventDate >= now && eventDate <= tomorrow;
    });

    const newNotifications = upcomingEvents.map(event => ({
      id: event.id, // Używamy id wydarzenia jako id powiadomienia
      message: `Wydarzenie "${event.title}" rozpoczyna się jutro o ${event.date}.`
    }));

    setNotifications(newNotifications);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };


  return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScrollView
            className="p-5"
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
        >
          {/* Logo aplikacji */}
          <View className="flex flex-row justify-between items-center mb-5">
            <Image
                source={require('../../assets/images/adaptive-icon.png')}
                className="h-16 w-16"
                resizeMode="contain"
                style={{ height: 64, width: 64 }}
            />
            <Text className="text-3xl font-bold">Witaj, {firstName} 👋</Text>
          </View>

          {/* Powiadomienia */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">Powiadomienia</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {notifications.length > 0 ? (
                  notifications.map((item) => (
                      <NotificationItem key={item.id} notification={item} />
                  ))
              ) : (
                  <Text className="text-gray-500">Brak nowych powiadomień.</Text>
              )}
            </View>
          </View>

          {/* Nadchodzące Wydarzenia */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">Nadchodzące Wydarzenia</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {events.length > 0 ? (
                  events.map((item) => <EventItem key={item.id} event={item} />)
              ) : (
                  <Text className="text-gray-500 text-xl">Brak wydarzeń</Text>
              )}
            </View>
          </View>

          {/* Aktualności */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">Aktualności</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {news.length > 0 ? (
                  news.map((item) => (
                      <NewsItem key={item.id} news={item} />
                  ))
              ) : (
                  <Text className="text-gray-500 text-xl">Brak aktualności</Text>
              )}
            </View>
          </View>

          {/* Poradniki Ekologiczne */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">Poradniki Ekologiczne</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {tips.map((item) => (
                  <View key={item.id} className="border-b border-gray-200 pb-2 mb-2">
                    <Text className="font-bold">{item.title}</Text>
                    <Text>{item.description}</Text>
                  </View>
              ))}
            </View>
          </View>

          {/* Wyzwania Ekologiczne */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">Wyzwania Ekologiczne</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {challenges.map((item) => (
                  <EcoChallengeItem key={item.id} challenge={item} />
              ))}
            </View>
          </View>

          {/* FAQ Ekologiczne */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold mb-2">FAQ Ekologiczne</Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl shadow">
              {faq.map((item) => (
                  <View key={item.id} className="border-b border-gray-200 pb-2 mb-2">
                    <Text className="font-bold">{item.question}</Text>
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
