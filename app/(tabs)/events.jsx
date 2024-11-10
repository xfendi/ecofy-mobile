import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { parse } from "date-fns";

import { db } from "../../firebase";
import EventItem from "../../components/EventItem";

const Events = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  const router = useRouter();
  const params = useLocalSearchParams();

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
          docsArray.push({ ...data });
        });
        
        const upcomingEvents = docsArray.sort((a, b) => {
          // Sort events by date (from nearest to farthest)
          const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
          const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
          return dateA - dateB; // Sort in ascending order
        });

        setEvents(upcomingEvents); // Zapisujemy dokumenty do stanu
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className={Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"}>
          <Text className="text-2xl font-semibold mb-5">
            Lista Wszystkich Wydarzeń
          </Text>
          <View className="gap-5">
            {events.length > 0 ? (
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
              <Text className="text-gray-500 text-xl font-semibold bg-white p-5 rounded-2xl">
                Brak wydarzeń.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Events;
