import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase";
import EventItem from "../../components/EventItem";

const Events = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isDeleteModal, setIsDeleteModal] = useState();
  const [idToDelete, setIdToDelete] = useState();

  const router = useRouter();
  const params = useLocalSearchParams();

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

        setEvents(docsArray); // Zapisujemy dokumenty do stanu
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ height: "100%" }}>
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
        className="px-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-[53px]">
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
                    setIsDeleteModal(true);
                    setIdToDelete(event.id);
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
