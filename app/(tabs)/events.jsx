import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import EventItem from "../../components/EventItem";

import { events } from "../../test-variables";

const Events = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/events");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  // Odczytanie ID z parametrów i podświetlenie wydarzenia
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

  const renderEvent = (item) => (
    <EventItem
      event={item}
      key={item.id}
      isHighlight={highlightedEvent === item.id}
    />
  );

  return (
    <SafeAreaView>
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-[30%]">
          <Text className="text-2xl font-semibold mb-5">Lista Wydarzeń</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {events.map(renderEvent)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Events;
