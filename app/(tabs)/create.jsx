import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { primaryColor } from "../../config.json";
import AppTextInput from "../../components/AppTextInput";
import useGeoLocation from "../../context/GeoLocationContext"; // Adjust the path as necessary
import { UserAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";

const CreateEvent = () => {
  const { user } = UserAuth();
  const { region } = useGeoLocation();
  const [mapRegion, setMapRegion] = useState({
    latitude: region?.latitude || 37.78825, // Default latitude
    longitude: region?.longitude || -122.4324, // Default longitude
    latitudeDelta: 0.0922, // Default delta
    longitudeDelta: 0.0421, // Default delta
  });
  const [isMapLoading, setIsMapLoading] = useState(true);
  const { width } = Dimensions.get("window");
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [image, setImage] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  const resetAllStates = () => {
    setName("");
    setDate(new Date());
    setAddress("");
    setDescription("");
    setCoordinates({ latitude: null, longitude: null });
    setImage(null);
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (region) {
      setMapRegion({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
      setIsMapLoading(false);
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
    setCoordinates({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    setAddress(""); // Clear address when selecting a new location on the map
    setMapRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
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
      const code = Math.floor(Math.random() * 1000000);

      codeid = code;

      const docRef = doc(db, "events", codeid.toString());
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
      !coordinates.latitude ||
      !coordinates.longitude ||
      !name ||
      !date ||
      !time ||
      !description
    ) {
      Alert.alert(
        "Błąd",
        "Proszę uzupełnić każde pole oraz wybrać lokalizację wydarzenia."
      );
      return;
    }

    try {
      setIsLoading(true);

      // Fetch the address using coordinates
      const addressResponse = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&apiKey=${apiKey}`
      );

      if (!addressResponse.data || !addressResponse.data.features.length) {
        throw new Error("Nie udało się uzyskać prawidłowego adresu.");
      }

      const formattedAddress =
        addressResponse.data.features[0].properties.formatted;
      const formattedDate =
        date.toLocaleDateString() + " " + time.toLocaleTimeString();
      setAddress(formattedAddress);

      // Generate a unique code ID for the event
      const codeid = await GenerateCode();

      let photoURL = null;

      // Only upload the image if it is provided
      if (image) {
        const response = await fetch(image);
        if (!response.ok) {
          throw new Error(
            `Nie udało się pobrać obrazu. Kod statusu: ${response.status}`
          );
        }
        const blob = await response.blob();
        const fileRef = ref(storage, `events/${codeid.toString()}`);
        await uploadBytes(fileRef, blob);
        photoURL = await getDownloadURL(fileRef);
      }

      // Save event details to Firestore
      const eventDetails = {
        title: name,
        date: formattedDate,
        address: formattedAddress,
        description: description,
        coordinates: coordinates,
        host: user.uid,
        id: codeid,
      };
      if (photoURL) {
        eventDetails.photoURL = photoURL;
      }

      await setDoc(doc(db, "events", codeid.toString()), eventDetails);

      Alert.alert("Sukces", "Pomyślnie utworzono wydarzenie: " + name);
      setIsLoading(false);

      // Navigate and reset states
      router.replace("/create");
      resetAllStates();
    } catch (error) {
      Alert.alert("Błąd", error.message);
    }
  };

  return (
    <SafeAreaView>
      {isLoading && (
        <View
          className="absolute flex items-center w-full bottom-0 top-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <View className="bg-gray-100 p-5 w-80 m-auto rounded-xl flex flex-col gap-5 z-50">
            <Text className="text-2xl font-semibold">
              Tworzenie Projektu...
            </Text>
          </View>
        </View>
      )}

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
          <View className="flex flex-row gap-5">
            <TouchableOpacity
              className="p-5 flex flex-row gap-5 items-center rounded-xl"
              style={{ backgroundColor: primaryColor, width: width * 0.5 - 27 }}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome name="calendar" size={20} color="#fff" />
              <Text className="text-white text-xl font-semibold">
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-5 flex flex-row gap-5 items-center rounded-xl"
              style={{ backgroundColor: primaryColor, width: width * 0.5 - 27 }}
              onPress={() => setShowTimePicker(true)}
            >
              <FontAwesome6 name="clock" size={20} color="#fff" />
              <Text className="text-white text-xl font-semibold">
                {time.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={(selectedDate) => {
              setShowDatePicker(false);
              setDate(selectedDate);
            }}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()} // Przykład minimalnej daty
            maximumDate={new Date(2100, 11, 31)} // Przykład maksymalnej daty
          />
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            onConfirm={(selectedDate) => {
              setShowTimePicker(false);
              setTime(selectedDate);
            }}
            onCancel={() => setShowTimePicker(false)}
            minimumDate={new Date()} // Przykład minimalnej daty
            maximumDate={new Date(2100, 11, 31)} // Przykład maksymalnej daty
          />
          <TouchableOpacity
            onPress={pickImage}
            className="p-4 rounded-xl bg-black"
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
          {!isMapLoading && (
            <MapView
              style={{
                width: "100%",
                height: 355,
                borderRadius: 200,
                overflow: "hidden",
              }}
              region={mapRegion}
              onRegionChangeComplete={(region) => setMapRegion(region)}
              onPress={handleMapPress}
              showsUserLocation={true}
              loadingEnabled={true} // This prop enables a loading indicator while loading the map.
              provider={MapView.PROVIDER_GOOGLE} // If you have Google Maps API key, use this for better performance
            >
              {coordinates.latitude && coordinates.longitude && (
                <Marker
                  coordinate={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                  }}
                >
                  <FontAwesome name="map-marker" size={40} color="black" />
                </Marker>
              )}
            </MapView>
          )}
          <Text className="text-2xl font-semibold">Podsumowanie</Text>
          <View className="flex flex-col gap-5 p-5 bg-white rounded-xl w-full">
            {name && (
              <View>
                <Text className="font-semibold">Nazwa</Text>
                <Text className="text-gray-500">{name}</Text>
              </View>
            )}
            {date && (
              <View>
                <Text className="font-semibold">Data</Text>
                <Text className="w-80 text-gray-500">
                  {date.toLocaleDateString() + " " + time.toLocaleTimeString()}
                </Text>
              </View>
            )}
            {description && (
              <View>
                <Text className="font-semibold">Opis</Text>
                <Text className="w-80 text-gray-500">{description}</Text>
              </View>
            )}
            {coordinates.latitude && coordinates.longitude && (
              <View>
                <Text className="font-semibold">Koordynaty</Text>
                <Text className="w-80 text-gray-500">
                  {coordinates.latitude.toFixed(3)},{" "}
                  {coordinates.longitude.toFixed(3)}
                </Text>
              </View>
            )}
            {address && (
              <View>
                <Text className="font-semibold">Adres:</Text>
                <Text className="w-80 text-gray-500">{address}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="p-4 rounded-xl mb-[30%]"
            style={{ backgroundColor: primaryColor }}
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
