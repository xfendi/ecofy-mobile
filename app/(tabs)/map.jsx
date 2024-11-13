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
import { endOfDay, isBefore, parse } from "date-fns";

const Map = () => {
  const [events, setEvents] = useState([]);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const { selectedEvent, setSelectedEvent } = UseMap();

  const mapRef = useRef(null);
  const { region } = useGeoLocation(); // region from context
  const [currentRegion, setCurrentRegion] = useState(region); // local state for map region

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id.toString()));
      Alert.alert("Sukces", "Pomyślnie usunięto wydarzenie!");
      setSelectedEvent(null);
    } catch (e) {
      console.error("Błąd przy usuwaniu wydarzenia:", e);
      Alert.alert("Błąd", "Nie udało się usunąć wydarzenia: ", e.message);
    }
  };

  const showDeleteAlert = (id) => {
    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć to wydarzenie?",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: true }
    );
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
      <View>
        <MapView
          ref={mapRef}
          region={currentRegion}
          showsUserLocation={true}
          style={styles.map}
        >
          {events.map((marker) => {
            const eventDate = parse(
              marker.date,
              "d.M.yyyy HH:mm:ss",
              new Date()
            );

            if (isBefore(new Date(), endOfDay(eventDate))) {
              return (
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
                    color={
                      selectedEvent?.id === marker.id ? primaryColor : "black"
                    }
                  />
                </Marker>
              );
            }
          })}
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
              showDeleteAlert(selectedEvent.id);
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
