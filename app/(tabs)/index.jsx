import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { UserAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import EventItem from "../../components/EventItem";

import { events, tips, faq } from "../../test-variables";

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, logout } = UserAuth();
  const router = useRouter();
  const firstName = user?.displayName;

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const handleLogout = async () => {
    router.replace("/(auth)/welcome");
    await logout();
  };

  const showDetails = (event) => {
    router.push({
      pathname: "/(tabs)/events",
      params: { eventId: event.id },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-row justify-between items-center">
          <Text className="text-3xl font-bold">
            Witaj, {firstName} 👋
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            {user.photoURL && (
              <Image
                source={{ uri: user.photoURL }}
                className="h-12 w-12 rounded-full"
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-[30%] mt-5">
          <Text className="text-2xl font-semibold mb-5">
            Nadchodzące Wydarzenia
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {events.map((item) => (
              <EventItem key={item.id} event={item} />
            ))}
          </View>

          <Text className="text-2xl font-semibold mt-5 mb-5">
            Poradniki Ekologiczne
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {tips.map((item) => (
              <View key={item.id}>
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
              </View>
            ))}
          </View>

          <Text className="text-2xl font-semibold mt-5 mb-5">
            FAQ Ekologiczne
          </Text>
          <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
            {faq.map((item) => (
              <View key={item.id}>
                <Text>{item.question}</Text>
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
