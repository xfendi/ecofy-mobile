import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase"; // Make sure the path is correct
import { UserAuth } from "../../context/AuthContext";
import EventItem from "../../components/EventItem";
import { tips, faq } from "../../test-variables";

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState([]); // State for events
  const { user } = UserAuth();
  const router = useRouter();
  const firstName = user?.displayName;

  // Fetch events from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
        collection(db, "events"),
        (querySnapshot) => {
          const docsArray = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            docsArray.push({
              ...data,
            });
          });
          setEvents(docsArray); // Update state with events
        }
    );

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Handle refresh logic
  const onRefresh = () => {
    setIsRefreshing(true);
    router.replace("/");
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleProfile = () => {
    router.replace("/profile");
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
            <Text className="text-3xl font-bold w-80">Witaj, {firstName} 👋</Text>
            <TouchableOpacity onPress={handleProfile}>
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
              {events.length > 0 ? (
                  events.map((item) => <EventItem key={item.id} event={item} />)
              ) : (
                  <Text className="text-gray-500 text-xl font-semibold">
                    Brak wydarzeń
                  </Text>
              )}
            </View>

            <Text className="text-2xl font-semibold mt-5 mb-5">
              Poradniki Ekologiczne
            </Text>
            <View className="p-5 flex flex-col gap-5 bg-white rounded-xl">
              {/* Render ecological tips here */}
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
              {/* Render ecological FAQs here */}
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