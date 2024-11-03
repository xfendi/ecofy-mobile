import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase";
import EventItem from "../../components/EventItem";

const Events = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  const router = useRouter();
  const params = useLocalSearchParams();

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/events");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  useEffect(() => {
    const eventId = parseInt(params.eventId, 10);
    if (!isNaN(eventId) && events.some((event) => event.id === eventId)) {
      setHighlightedEvent(eventId);

      const timer = setTimeout(() => {
        setHighlightedEvent(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [params.eventId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({
            ...data,
            date: data.date.toDate().toLocaleDateString(),
          });
        });

        setEvents(docsArray); // Zapisujemy dokumenty do stanu
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-[30%]">
          <Text className="text-2xl font-semibold mb-5">
            Lista Wszystkich Wydarzeń
          </Text>
          {events.length > 0 ? (
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
              {events.map((event) => (
                <EventItem
                  event={event}
                  key={event.id}
                  isHighlight={highlightedEvent === event.id}
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-xl font-semibold">
              Brak wydarzeń
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Events;
