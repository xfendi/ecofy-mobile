import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, StyleSheet, Alert, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase";
import EventListItem from "../../components/EventListItem";
import useGeoLocation from "../../context/GeoLocationContext";
import { UseMap } from "../../context/MapContext";
import { primaryColor } from "../../config.json";
import { TouchableOpacity } from "react-native";

const Map = () => {
  const [events, setEvents] = useState([]);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState();
  const { selectedEvent, setSelectedEvent } = UseMap();

  const mapRef = useRef(null);
  const { region } = useGeoLocation(); // region from context
  const [currentRegion, setCurrentRegion] = useState(region); // local state for map region

  const handleDelete = async () => {
    setIsDeleteModal(false);
    try {
      await deleteDoc(doc(db, "events", idToDelete.toString()));
      Alert.alert("Event został usunięty!");
    } catch (e) {
      console.error("Błąd przy usuwaniu eventu:", e);
      Alert.alert("Błąd", "Nie udało się usunąć eventu: ", e.message);
    }
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
        setEvents(docsArray);
      }
    );

    return () => unsubscribe();
  }, []);

  // Set the current region when the region from context changes
  useEffect(() => {
    if (!selectedEvent) {
      setCurrentRegion(region);
    }
  }, [region, selectedEvent]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedEvent && events.length > 0) {
        // Ensure events is not empty
        const event = events.find((marker) => marker.id === selectedEvent.id);
        if (event) {
          mapRef.current?.animateToRegion(
            {
              latitude: event.coordinates.latitude,
              longitude: event.coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        } else {
          setSelectedEvent(null);
        }
      }
    }, [selectedEvent, events])
  );

  const animate = (coordinates) => {
    mapRef.current?.animateToRegion(
      {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isDeleteModal && (
        <View
          className="absolute flex items-center w-full bottom-0 top-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <View className="bg-gray-100 p-5 w-80 m-auto rounded-xl flex flex-col gap-5 z-50">
            <Text className="text-2xl font-semibold">Potwierdź Usunięcie</Text>

            <TouchableOpacity
              onPress={handleDelete}
              className="p-4 rounded-xl w-full bg-red-500"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Potwierdź
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsDeleteModal(false)}
              className="p-4 rounded-xl w-full bg-gray-500"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Anuluj
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View>
        <MapView
          ref={mapRef}
          region={currentRegion} // Use local state for the region
          showsUserLocation={true}
          style={styles.map}
        >
          {events.map((marker) => (
            <Marker
              tracksViewChanges={false}
              key={marker.id}
              coordinate={marker.coordinates}
              onPress={() => {
                setSelectedEvent(marker);
                animate(marker.coordinates);
              }}
            >
              <FontAwesome
                name="map-marker"
                size={selectedEvent?.id === marker.id ? 40 : 35}
                color={selectedEvent?.id === marker.id ? primaryColor : "black"}
              />
            </Marker>
          ))}
        </MapView>

        {selectedEvent && (
          <View className="absolute top-16 left-5 bg-white flex-row justify-center items-center h-14 w-14 rounded-full">
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <FontAwesome name="times" size={24} />
            </TouchableOpacity>
          </View>
        )}

        {selectedEvent && (
          <EventListItem
            eventData={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            deleteFunction={() => {
              setIsDeleteModal(true);
              setIdToDelete(selectedEvent.id);
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
});

export default Map;
