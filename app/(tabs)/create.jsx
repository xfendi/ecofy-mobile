import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AppTextInput from "../../components/AppTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../../config.json";
import useGeoLocation from "../../context/GeoLocationContext"; // Adjust the path as necessary
import { UserAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const CreateEvent = () => {
  const { user } = UserAuth();
  const { region } = useGeoLocation(); // Use the custom hook
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [image, setImage] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(region); // Track region for the map

  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  const resetAllStates = () => {
    setName("");
    setDate(new Date());
    setAddress("");
    setDescription("");
    setCoordinates({ lat: null, lon: null });
    setImage(null);
    setShowDatePicker(false);
  };

  useEffect(() => {
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

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setCoordinates({ lat: coordinate.latitude, lon: coordinate.longitude });
    setAddress(""); // Clear address when selecting a new location on the map
    setMapRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinates.lat}&lon=${coordinates.lon}&apiKey=${apiKey}`
      );
      const formattedAddress = response.data.features[0].properties.formatted;
      setAddress(formattedAddress);
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
      Alert.alert("Błąd", error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const GenerateCode = async () => {
    let isUnique = false;
    let codeid;

    while (!isUnique) {
      const code = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");

      codeid = code;

      const docRef = doc(db, "projects", codeid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (!data) {
        isUnique = true;
      }
    }

    console.log(codeid);
    return codeid;
  };

  const handleSubmit = async () => {
    if (
      !coordinates.lat ||
      !coordinates.lon ||
      !name ||
      !date ||
      !description
    ) {
      Alert.alert(
        "Błąd",
        "Proszę uzupełnić każde pole oraz wybrac lokalizację wydarzenia."
      );
      return;
    }

    try {
      const codeid = await GenerateCode();

      const response = await fetch(image);
      const blob = await response.blob();

      const fileRef = ref(storage, `events/${codeid}`);
      await uploadBytes(fileRef, blob);
      const photoURL = await getDownloadURL(fileRef);

      await setDoc(doc(db, "events", codeid), {
        name: name,
        date: date,
        address: address,
        description: description,
        coordinates: coordinates,
        host: user.uid,
        photoURL: photoURL,
      });
      Alert.alert("Sukces", "Pomyślnie utworzono wydarzenie: " + name);
      router.replace("/create");
      resetAllStates();
      console.log("Project document created successfully with codeId:", codeid);
    } catch (error) {
      console.error("Błąd podczas tworzenia wydarzenia:", error);
      Alert.alert("Błąd", error.message);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
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
          <TouchableOpacity
            onPress={pickImage}
            className="p-4 rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-xl font-semibold">
              Wybierz Zdjęcie
            </Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              className="w-full h-[355px] rounded-xl"
            />
          )}
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
            placeholder="Opis wydarzenia"
            value={description}
            onChangeText={setDescription}
            multiline
            full
          />
          <Text className="text-2xl font-semibold">
            Wybierz Miejsce Wydarzenia
          </Text>
          <MapView
            style={{ width: "100%", height: 355, borderRadius: "120px" }}
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
              >
                <FontAwesome name="map-marker" size={40} color="black" />
              </Marker>
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
            {description && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Opis:</Text>
                <Text>{description}</Text>
              </View>
            )}
            {coordinates.lat && coordinates.lon && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Koordynaty:</Text>
                <Text>
                  {coordinates.lat}, {coordinates.lon}
                </Text>
              </View>
            )}
            {address && (
              <View className="flex flex-row items-center" style={{ gap: 5 }}>
                <Text className="text-lg font-semibold">Adres:</Text>
                <Text>{address}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="p-4 rounded-xl mb-[30%]"
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
