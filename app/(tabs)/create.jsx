import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
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
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";

import { primaryColor } from "../../config.json";
import AppTextInput from "../../components/AppTextInput";
import useGeoLocation from "../../context/GeoLocationContext";
import { UserAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";
import Loading from "../../components/Loading";

const CreateEvent = () => {
  const [currentRegion, setCurrentRegion] = useState(region);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState({});
  const [image, setImage] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { width } = Dimensions.get("window");
  const { user } = UserAuth();
  const { region } = useGeoLocation();

  const router = useRouter();
  const mapRef = useRef(null);

  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  const resetAllStates = () => {
    setName("");
    setDate(new Date());
    setAddress("");
    setDescription("");
    setCoordinates({});
    setImage(null);
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (!coordinates.latitude && !coordinates.longitude) {
      setCurrentRegion(region);
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
    setAddress("");
    mapRef.current?.animateToRegion(
      {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      const image = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      setImage(image.uri);
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

    setIsLoading(true);

    let formattedAddress = null;
    try {
      const addressResponse = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&apiKey=${apiKey}`
      );

      if (!addressResponse.data || !addressResponse.data.features.length) {
        throw new Error("Nie udało się uzyskać prawidłowego adresu.");
      }

      formattedAddress = addressResponse.data.features[0].properties.formatted;
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Błąd", "Nie udało się pobrać adresu: " + error.message);
      return;
    }

    let codeid = null;
    try {
      codeid = await GenerateCode();
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Błąd",
        "Nie udało się wygenerować kodu ID: " + error.message
      );
      return;
    }

    let photoURL = null;
    if (image) {
      console.log("Uploading image...");
      console.log(image);

      const response = await fetch(image);
      const blob = await response.blob();

      const fileRef = ref(storage, `events/${codeid.toString()}`);

      try {
        console.log("Uploading to Firebase Storage...");
        await uploadBytes(fileRef, blob);

        photoURL = await getDownloadURL(fileRef);
        console.log("Image uploaded successfully: ", photoURL);
      } catch (error) {
        setIsLoading(false);
        Alert.alert("Błąd", "Nie udało się przesłać obrazu: " + error.message);
        return;
      }
    }

    try {
      let formattedDate =
        date.toLocaleDateString() + " " + time.toLocaleTimeString();
      formattedDate = formattedDate.replace(/\//g, ".");

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

      Alert.alert("Sukces", "Pomyślnie utworzono wydarzenie!");
      router.replace("/create");
      resetAllStates();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać wydarzenia: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      {isLoading && <Loading />}

      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5">
          <Text className="text-3xl font-semibold">Stwórz Wydarzenie</Text>
          <AppTextInput
            placeholder="Nazwa wydarzenia"
            value={name}
            onChangeText={setName}
            full
          />
          <AppTextInput
            placeholder="Opis wydarzenia"
            value={description}
            onChangeText={setDescription}
            multiline
            full
          />
          <View className="flex flex-row gap-5">
            <TouchableOpacity
              className="p-4 flex flex-row gap-4 bg-white items-center rounded-full"
              style={{ width: width * 0.5 - 27 }}
              onPress={() => setShowDatePicker(true)}
            >
              <View
                className="h-10 w-10 flex-row justify-center items-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <FontAwesome6 name="calendar" size={20} color="#fff" />
              </View>
              <Text className="text-black text-xl font-semibold">
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-4 flex flex-row gap-4 bg-white items-center rounded-full"
              style={{ width: width * 0.5 - 27 }}
              onPress={() => setShowTimePicker(true)}
            >
              <View
                className="h-10 w-10 flex-row justify-center items-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <FontAwesome6 name="clock" size={20} color="#fff" />
              </View>
              <Text className="text-black text-xl font-semibold">
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
            minimumDate={new Date()}
            maximumDate={new Date(2100, 11, 31)}
          />
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            onConfirm={(selectedDate) => {
              setShowTimePicker(false);
              setTime(selectedDate);
            }}
            onCancel={() => setShowTimePicker(false)}
            maximumDate={new Date(2100, 11, 31)}
          />
          <TouchableOpacity
            onPress={pickImage}
            className="p-5 rounded-full bg-black"
          >
            <Text className="text-white text-center text-xl font-semibold">
              Wybierz Zdjęcie
            </Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              className="w-full h-[355px] rounded-3xl"
            />
          )}
          <Text className="text-2xl font-semibold">
            Wybierz Miejsce Wydarzenia
          </Text>
          {!isMapLoading && (
            <MapView
              style={{
                width: "100%",
                height: width - 40,
                borderRadius: 24,
                overflow: "hidden",
              }}
              ref={mapRef}
              region={currentRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              loadingEnabled={true}
              provider={PROVIDER_GOOGLE}
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
          <View className="flex flex-col gap-5 p-5 bg-white rounded-3xl w-full">
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
            className={`p-5 rounded-full ${
              Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"
            }`}
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
