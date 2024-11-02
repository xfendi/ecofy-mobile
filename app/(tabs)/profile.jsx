import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserAuth } from "../../context/AuthContext";
import { Link, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons"; // Importuj ikony
import { FontAwesome } from "@expo/vector-icons"; // Importuj ikonę FontAwesome
import { primaryColor } from "../../config.json";
import EventItem from "../../components/EventItem";

const Profile = () => {
  const { user, logout } = UserAuth();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/profile");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const createdEvents = [
    {
      id: 1,
      title: "Warsztaty z recyklingu",
      date: "2024-11-05",
      address: "ul. Ekologiczna 123, Warszawa",
      description:
        "Warsztaty na temat skutecznego recyklingu i jego korzyści dla środowiska.",
      coordinates: { latitude: 52.2297, longitude: 21.0122 },
    },
    {
      id: 2,
      title: "Dzień sprzątania lasu",
      date: "2024-11-10",
      address: "ul. Leśna 456, Kraków",
      description: "Przyłącz się do nas w akcji sprzątania lasów.",
      coordinates: { latitude: 50.0614, longitude: 19.9383 },
    },
    {
      id: 3,
      title: "Eko-festiwal 2024",
      date: "2024-12-01",
      address: "ul. Festiwalowa 789, Gdańsk",
      description: "Festiwal poświęcony ekologicznemu stylowi życia.",
      coordinates: { latitude: 54.352, longitude: 18.6466 },
    },
  ];

  const interestedEvents = [
    {
      id: 4,
      title: "Ekologiczne targi",
      date: "2024-11-15",
      address: "ul. Targowa 321, Wrocław",
      description: "Targi produktów ekologicznych i lokalnych.",
      coordinates: { latitude: 51.1079, longitude: 17.0385 },
    },
    {
      id: 5,
      title: "Warsztaty z permakultury",
      date: "2024-11-20",
      address: "ul. Zielona 654, Poznań",
      description: "Warsztaty na temat permakultury i zrównoważonego rozwoju.",
      coordinates: { latitude: 52.4064, longitude: 16.9252 },
    },
  ];

  const handleDeleteCreatedEvent = (id) => {
    console.log(`Utworzone wydarzenie o id ${id} zostało usunięte.`);
  };

  const handleDeleteInterestedEvent = (id) => {
    console.log(`Zainteresowanie wydarzeniem o id ${id} zostało usunięte.`);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex flex-col gap-5 p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5">
          <View className="flex flex-col items-center gap-5">
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="h-32 w-32 rounded-full"
              />
            ) : (
              <FontAwesome name="user" size={64} color={primaryColor} />
            )}
            <View>
              <Text className="text-3xl font-bold text-center">
                {user.displayName}
              </Text>
              <Text className="text-center text-lg">{user.email}</Text>
            </View>
          </View>
          <View className="flex flex-row w-full gap-5 justify-center">
            <TouchableOpacity
              className="p-4 rounded-xl w-1/2"
              style={{ backgroundColor: primaryColor }}
            >
              <Link
                href="/settings"
                className="text-white text-xl font-semibold text-center"
              >
                Ustawienia Konta
              </Link>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-[30%] mt-5">
          <Text className="text-2xl font-semibold mb-5">Moje wydarzenia</Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {createdEvents.length > 0 ? (
              createdEvents.map((event) => (
                <EventItem
                  event={event}
                  key={event.id}
                  deleteFunction={handleDeleteCreatedEvent}
                />
              ))
            ) : (
              <Text className="text-gray-400">Brak utworzonych wydarzeń.</Text>
            )}
          </View>

          <Text className="text-2xl font-semibold mt-5 mb-5">
            Polubione wydarzenia
          </Text>
          <View className="bg-white rounded-lg p-5 flex flex-col gap-5">
            {interestedEvents.length > 0 ? (
              interestedEvents.map((event) => (
                <EventItem
                  event={event}
                  key={event.id}
                  deleteFunction={handleDeleteInterestedEvent}
                />
              ))
            ) : (
              <Text className="text-gray-400">Brak polubionych wydarzeń.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
