import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AppTextInput from "../../components/AppTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../../config.json";
import useGeoLocation from "../../context/GeoLocationContext"; // Adjust the path as necessary

const CreateEvent = () => {
  const { location, region } = useGeoLocation(); // Use the custom hook

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [locationResults, setLocationResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(region); // Track region for the map

  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  useEffect(() => {
    // Update map region when location changes
    if (region) {
      setMapRegion(region);
    }
  }, [region]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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
    const selectedLat = location.geometry.coordinates[1];
    const selectedLon = location.geometry.coordinates[0];
    setAddress(location.properties.formatted);
    setCoordinates({ lat: selectedLat, lon: selectedLon });
    setMapRegion({
      latitude: selectedLat,
      longitude: selectedLon,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setLocationResults([]);
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setCoordinates({ lat: coordinate.latitude, lon: coordinate.longitude });
    setAddress(""); // Clear address when selecting a new location on the map
    setMapRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleSubmit = async () => {
    if (!coordinates.lat || !coordinates.lon) {
      Alert.alert("Błąd", "Proszę wybrać lokalizację przed utworzeniem wydarzenia.");
      return;
    }

    try {
      const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinates.lat}&lon=${coordinates.lon}&apiKey=${apiKey}`
      );
      const formattedAddress = response.data.features[0].properties.formatted;
      console.log({
        name: name,
        date: date.toISOString(),
        address: formattedAddress,
        description: description,
        coordinates: coordinates,
      });
      // Logic to save the event goes here
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
    }
  };

  return (
      <SafeAreaView
          className="p-5"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
      >
        <ScrollView contentContainerStyle={{paddingBottom: 70}}>
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
                          key={item.properties.place_id}
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
            <MapView
                style={{ width: "100%", height: 300 }}
                region={mapRegion}
                onRegionChangeComplete={(region) => setMapRegion(region)}
                onPress={handleMapPress} // Allow selecting a location on the map
                showsUserLocation={true}
            >
              {coordinates.lat && coordinates.lon && (
                  <Marker
                      coordinate={{
                        latitude: coordinates.lat,
                        longitude: coordinates.lon,
                      }}
                      title={address || "Wybrana lokalizacja"}
                      pinColor="red" // Customize the marker color if needed
                  />
              )}
            </MapView>
            <Text className="text-2xl font-semibold">Podsumowanie</Text>
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

export default CreateEvent;
