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
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { endOfDay, isAfter, isBefore, parse } from "date-fns";

import { db } from "../../firebase";
import EventItem from "../../components/EventItem";
import { primaryColor } from "../../config.json";

const Events = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [events, setEvents] = useState([]);
  const [archiveEvents, setArchiveEvents] = useState([]);

  const [tab, setTab] = useState("active");

  const router = useRouter();

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
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({ ...data });
        });

        const activeEvents = docsArray
          .filter((event) => {
            const eventDate = parse(
              event.date,
              "d.M.yyyy HH:mm:ss",
              new Date()
            );
            return isBefore(new Date(), endOfDay(eventDate));
          })
          .sort((a, b) => {
            const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
            const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
            return dateA - dateB;
          });

        const inactiveEvents = docsArray
          .filter((event) => {
            const eventDate = parse(
              event.date,
              "d.M.yyyy HH:mm:ss",
              new Date()
            );
            return isAfter(new Date(), endOfDay(eventDate));
          })
          .sort((a, b) => {
            const dateA = parse(a.date, "d.M.yyyy HH:mm:ss", new Date());
            const dateB = parse(b.date, "d.M.yyyy HH:mm:ss", new Date());
            return dateA - dateB;
          });

        setArchiveEvents(inactiveEvents);
        setEvents(activeEvents);
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
        <View
          className={`flex flex-col gap-5 ${
            Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"
          }`}
        >
          <Text className="text-3xl font-semibold">Lista Wydarzeń</Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Events;
