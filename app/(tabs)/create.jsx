import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AppTextInput from "../../components/AppTextInput";
import { SafeAreaView } from "react-native-safe-area-context";

import { primaryColor } from "../../config.json";

const CreateEvent = () => {
  const [event, setEvent] = useState({
    name: "",
    date: new Date(),
    address: "",
    description: "",
    coordinates: { lat: null, lon: null },
    host: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [locationResults, setLocationResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/events");
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${searchQuery}&apiKey=${apiKey}`
      );
      setLocationResults(response.data.features);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const handleLocationSelect = (location) => {
    setAddress(location.properties.formatted);
    setCoordinates({
      lat: location.geometry.coordinates[1],
      lon: location.geometry.coordinates[0],
    });
    setLocationResults([]);
  };

  const handleSubmit = () => {
    console.log({
      name: name,
      date: date.toISOString(),
      address: address,
      description: description,
      coordinates: coordinates,
    });
  };

  return (
    <SafeAreaView
      className="p-5"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <ScrollView>
        <View className="flex flex-col gap-5">
          <Text className="text-2xl font-semibold">Stwórz Wydarzenie</Text>
          <AppTextInput
            placeholder="Nazwa wydarzenia"
            value={name}
            onChangeText={setName}
            full
          />
          <TouchableOpacity
            className="p-5 flex flex-row gap-5 items-center rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => setShowDatePicker(true)}
          >
            <FontAwesome name="calendar" size={20} color="#fff" />
            <Text className="text-white text-xl font-semibold">
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
          <AppTextInput
            placeholder="Wyszukaj lokalizację"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            full
          />
          {locationResults.length > 0 && (
            <View className="p-5 bg-white rounded-xl flex flex-col gap-5">
              {locationResults.map((item) => (
                <TouchableOpacity
                  key={item.city}
                  onPress={() => handleLocationSelect(item)}
                  className="p-5 bg-gray-100 rounded-xl"
                >
                  <Text>{item.properties.formatted}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <AppTextInput
            placeholder="Opis wydarzenia"
            value={description}
            onChangeText={setDescription}
            multiline
            full
          />
          <Text className="text-2xl font-semibold">
            Podsumowanie
          </Text>
          <View className="flex flex-col gap-5 p-5 bg-white rounded-xl">
            {name && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Nazwa:</Text>
                <Text>{name}</Text>
              </View>
            )}
            {date && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Data:</Text>
                <Text>{date.toLocaleDateString()}</Text>
              </View>
            )}
            {address && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Adres:</Text>
                <Text>{address}</Text>
              </View>
            )}
            {description && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Opis:</Text>
                <Text>{description}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="p-4 rounded-xl"
            style={{ backgroundColor: "#8b5cf6" }}
          >
            <Text className="text-white text-xl font-semibold text-center">
              Utwórz Wydarzenie
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    height: 40,
  },
  locationButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
  },
  selectedAddress: {
    marginVertical: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default CreateEvent;
