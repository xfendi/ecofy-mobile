import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

import { primaryColor } from "../../config.json";
import { UseMap } from "../../context/MapContext";
import { UserAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { endOfDay, isAfter, isBefore, parse } from "date-fns";
import useGeoLocation from "../../context/GeoLocationContext";
import DeleteEvent from "../../components/DeleteEvent";
import AppTextInput from "../../components/AppTextInput";

const Details = () => {
  const [event, setEvent] = useState(null);

  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [eventDate, setEventDate] = useState(null);
  const [errors, setErrors] = useState([]);

  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [distance, setDistance] = useState(null);

  const [isLike, setIsLike] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const params = useLocalSearchParams();
  const router = useRouter();

  const { eventId } = params;
  const { location } = useGeoLocation();
  const { setSelectedEvent } = UseMap();
  const { user } = UserAuth();
  const { width } = Dimensions.get("window");

  useEffect(() => {
    if (event?.date) {
      checkShowConfirmButton();
    }
  }, [event]);

  useEffect(() => {
    if (event && location) {
      calculateDistance();
    }
  }, [event, location]);

  const onRefresh = () => {
    setIsRefreshing(true);
    router.replace("/details", { eventId });
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (!eventId) return console.log("no event id provided");

    const eventRef = doc(db, "events", eventId.toString());

    const unsubscribe = onSnapshot(eventRef, (eventSnap) => {
      try {
        if (eventSnap.exists()) {
          const eventDetails = eventSnap.data();
          setEvent(eventDetails);
          setIsConfirmed(eventDetails.confirmed?.includes(user.uid) || false);
          setIsJoined(eventDetails.users?.includes(user.uid) || false);
          const likes = eventDetails.likes || [];
          const errors = eventDetails.errors || [];
          setErrors(errors);
          setIsLike(likes.includes(user.uid));

          const date = parse(
            eventDetails.date,
            "d.M.yyyy HH:mm:ss",
            new Date()
          );
          setEventDate(date);

          if (isAfter(new Date(), endOfDay(date))) {
            setIsArchived(true);
          } else {
            setIsArchived(false);
          }
        } else {
          console.log("Event not found");
        }
      } catch (error) {
        console.error("Błąd podczas ładowania szczegółów wydarzenia:", error);
      }
    }, [eventId]);

    return () => unsubscribe();
  });

  const calculateDistance = () => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const { latitude: lat1, longitude: lon1 } = location.coords;
    const { latitude: lat2, longitude: lon2 } = event.coordinates;

    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistance(distance.toFixed(2));
  };

  const checkShowConfirmButton = () => {
    const currentTime = new Date();
    const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
    const timeDifferenceInHours = (eventDate - currentTime) / (1000 * 60 * 60);
    if (
      isBefore(new Date(), endOfDay(eventDate)) &&
      timeDifferenceInHours <= 1
    ) {
      setShowConfirmButton(true);
    } else {
      setShowConfirmButton(false);
    }
  };

  const handleConfirmAttendance = async () => {
    if (distance <= 0.1) {
      try {
        const eventRef = doc(db, "events", event.id.toString());
        await updateDoc(eventRef, {
          confirmed: arrayUnion(user.uid),
        });
        setIsConfirmed(true);
        Alert.alert(
          "Sukces",
          `Potwierdziłeś swoje przybycie na ${event.title}`
        );
      } catch (error) {
        console.error("Błąd przy potwierdzaniu przybycia:", error);
        Alert.alert(
          "Błąd",
          "Nie udało się potwierdzić przybycia. Spróbuj ponownie."
        );
      }
    } else {
      Alert.alert(
        "Błąd",
        "Musisz być w promieniu 100 metrów od wydarzenia, aby potwierdzić przybycie."
      );
    }
  };

  const handleShowOnMap = () => {
    if (event) {
      setSelectedEvent(event);
      router.replace("/(tabs)/map");
    }
  };

  const handleLikeToggle = async () => {
    const eventRef = doc(db, "events", event.id.toString());
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const likes = eventData.likes || [];
      if (likes.includes(user.uid)) {
        await updateDoc(eventRef, {
          likes: arrayRemove(user.uid),
        });
        setIsLike(false);
      } else {
        await updateDoc(eventRef, {
          likes: arrayUnion(user.uid),
        });
        setIsLike(true);
      }
    }
  };

  const handleJoinEvent = async () => {
    try {
      const eventRef = doc(db, "events", event.id.toString());
      await updateDoc(eventRef, {
        users: arrayUnion(user.uid),
      });
      setIsJoined(true);
      Alert.alert("Sukces", `Dołączono do wydarzenia ${event.title}`);
    } catch (e) {
      console.error("Błąd przy potwierdzaniu przybycia:", e);
      Alert.alert("Błąd", "Nie udało się dołączyc do wydarzenia.", e.message);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const eventRef = doc(db, "events", event.id.toString());
      await updateDoc(eventRef, {
        users: arrayRemove(user.uid),
        confirmed: arrayRemove(user.uid),
      });
      setIsJoined(false);
      Alert.alert("Sukces", `opuszczono wydarzenie ${event.title}`);
    } catch (e) {
      console.error("Błąd przy opuszczaniu wydarzenia:", e);
      Alert.alert("Błąd", "Nie udało się opuscic wydarzenia:", e.message);
    }
  };

  const showLeaveEventModal = () => {
    Alert.alert(
      "Potwierdź opuszczenie",
      "Czy na pewno opuścić to wydarzenie?",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Opuść", onPress: () => handleLeaveEvent() },
      ],
      { cancelable: true }
    );
  };

  const handleSubmitError = async () => {
    const errorExists = errors.some((error) => error.author === user.uid);

    if (!title || !description) {
      Alert.alert("Błąd", "Uzupełnij wszystkie wymagane pola.");
      return;
    }

    if (errorExists) {
      Alert.alert(
        "Błąd",
        "Nie możesz zgłosić błędu, ponieważ już zgłosiłeś inny."
      );
      return;
    }

    try {
      const eventRef = doc(db, "events", event.id.toString());
      await updateDoc(eventRef, {
        errors: arrayUnion({
          title,
          description,
          createdAt: new Date(),
          author: user?.uid,
        }),
      });
      Alert.alert("Sukces", "Błąd został zgłoszony pomyślnie!");
      closeBottomSheet();
    } catch (e) {
      console.error("Błąd przy zgłaszaniu błędu: ", e);
      Alert.alert("Błąd", "Nie udało się zgłosić błędu.");
    }
  };

  const openBottomSheet = () => {
    setIsErrorModal(true);
  };

  const closeBottomSheet = () => {
    setTitle("");
    setDescription("");
    setIsErrorModal(false);
  };

  const clearDocument = async () => {
    const eventRef = doc(db, "events", event.id.toString());

    try {
      await updateDoc(eventRef, {
        users: [],
        confirmed: [],
        likes: [],
      });
    } catch (e) {
      console.error("Błąd przy czyszczeniu dokument:", e);
    }
  };

  if (errors?.length >= 3) {
    clearDocument();
    return (
      <SafeAreaView className="flex-1">
        <ScrollView
          className={Platform.OS === "android" ? "p-5" : "px-5"}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex flex-col gap-5 w-full">
            <Text className="text-3xl font-semibold">{event.title}</Text>
            <View className="p-5 bg-white rounded-3xl w-full">
              <Text className="font-semibold text-red-500">
                Wydarzenie zostało zablokowane
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <View
        className="absolute flex items-center w-full bottom-0 top-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <View className="bg-white p-5 m-auto rounded-3xl z-50">
          <Text className="text-2xl font-semibold">
            Ładowanie szczegółów...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Modal
        animationType="slide"
        transparent={true}
        visible={isErrorModal}
        onRequestClose={closeBottomSheet}
      >
        <View className="flex-1 justify-end items-center">
          <KeyboardAvoidingView
            className="flex-row w-full h-1/2 p-5 bg-white rounded-3xl"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView>
              <View className="flex flex-col gap-5">
                <View className="flex flex-row justify-between">
                  <Text className="text-2xl font-semibold">Zgłoś błąd</Text>
                  <TouchableOpacity onPress={closeBottomSheet}>
                    <FontAwesome name="times" size={20} />
                  </TouchableOpacity>
                </View>

                <AppTextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Podaj tytuł"
                  gray
                  full
                />

                <AppTextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Dodaj treść"
                  multiline
                  gray
                  full
                />

                <TouchableOpacity
                  onPress={handleSubmitError}
                  className="p-5 rounded-full mb-10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-white text-xl font-semibold text-center">
                    Zgłoś błąd
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5">
          {event.photoURL && (
            <Image
              source={{ uri: event.photoURL }}
              className="w-full rounded-3xl"
              style={{ height: width - 40 }}
            />
          )}
          <View className="flex flex-row justify-between">
            <View>
              <Text className="text-3xl font-semibold">{event.title}</Text>
              <Text className="w-80 text-gray-500 mt-2">{event.address}</Text>
            </View>
            <View>
              {event.host === user.uid ? (
                <DeleteEvent event={event} />
              ) : (
                <TouchableOpacity onPress={handleLikeToggle}>
                  {isLike ? (
                    <AntDesign name="heart" size={24} color="red" />
                  ) : (
                    <Feather name="heart" size={24} color="black" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          {isArchived && (
            <View className="p-5 bg-white rounded-3xl w-full">
              <Text className="font-semibold">
                Wydarzenie zostało zarchiwizowane
              </Text>
            </View>
          )}
          {isBefore(new Date(), endOfDay(eventDate)) &&
            isAfter(new Date(), eventDate) && (
              <View className="p-5 bg-white rounded-3xl w-full">
                <Text className="font-semibold">
                  Wydarzenie juz sie rozpoczęło
                </Text>
              </View>
            )}
          {isBefore(new Date(), endOfDay(eventDate)) &&
            isBefore(new Date(), eventDate) && (
              <View className="p-5 bg-white rounded-3xl w-full">
                <Text className="font-semibold">
                  Wydarzenie jeszcze się nie rozpoczęło
                </Text>
              </View>
            )}
          {isAfter(new Date(), endOfDay(eventDate)) && (
            <View className="p-5 bg-white rounded-3xl w-full">
              <Text className="font-semibold">
                Wydarzenie juz się zakończyło
              </Text>
            </View>
          )}
          <View className="flex flex-col gap-5 p-5 bg-white rounded-3xl w-full">
            {event.description && (
              <Text className="w-80 text-gray-500">{event.description}</Text>
            )}
            {event.date && (
              <View>
                <Text className="font-semibold">Data</Text>
                <Text className="w-80 text-gray-500">{event.date}</Text>
              </View>
            )}
            {event.coordinates.latitude && event.coordinates.longitude && (
              <View>
                <Text className="font-semibold">Koordynaty</Text>
                <Text className="w-80 text-gray-500">
                  {event.coordinates.latitude.toFixed(3)},{" "}
                  {event.coordinates.longitude.toFixed(3)}
                </Text>
              </View>
            )}
            {distance && (
              <View>
                <Text className="font-semibold">Odległość</Text>
                <Text className="w-80 text-gray-500">{distance} km</Text>
              </View>
            )}
          </View>
          {showConfirmButton && !isArchived && (
            <View>
              <TouchableOpacity
                onPress={isJoined ? showLeaveEventModal : handleJoinEvent}
                className={`p-5 rounded-full ${
                  isJoined ? "bg-red-500" : "bg-yellow-500"
                }`}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {isJoined ? "Opuszczam wydarzenie" : "Dołczam do wydarzenia"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showConfirmButton && isJoined && !isArchived && (
            <View>
              <TouchableOpacity
                onPress={openBottomSheet}
                className="p-5 rounded-full bg-red-500"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Zgłoś błąd
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showConfirmButton && isJoined && !isArchived && (
            <View>
              <TouchableOpacity
                onPress={isConfirmed ? null : handleConfirmAttendance}
                className={`p-5 rounded-full ${
                  isConfirmed ? "bg-gray-300" : "bg-blue-500"
                }`}
                disabled={isConfirmed}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {isConfirmed
                    ? "Już potwierdzono przybycie"
                    : "Potwierdź przybycie"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className={Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"}>
            <TouchableOpacity
              onPress={handleShowOnMap}
              className="p-5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Pokaż na mapie
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Details;
