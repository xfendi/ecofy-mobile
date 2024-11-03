import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EventListItem from "../../components/EventListItem";
import useGeoLocation from "../../context/GeoLocationContext";
import { useLocalSearchParams } from "expo-router";

import { events } from "../../test-variables";
import { primaryColor } from "../../config.json";

const Map = () => {
  const { region } = useGeoLocation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const mapRef = useRef(null);
  const params = useLocalSearchParams();

  let eventId;
  if (params.eventId && !isNaN(parseInt(params.eventId, 10))) {
    eventId = parseInt(params.eventId, 10);
  }

  const markers = [
    {
      id: 1,
      coordinates: { latitude: 53.3331, longitude: 15.0305 },
      title: "Sprzątanie Parku",
      address: "ul. Leśna 456, Kraków",
      date: "2024-11-10",
      description: "Wydarzenie sprzątania w Parku Chrobrego.",
    },
    {
      id: 2,
      coordinates: { latitude: 53.332, longitude: 15.0325 },
      title: "Sadzenie Drzew",
      date: "2024-11-10",
      address: "ul. Leśna 456, Kraków",
      description: "Inicjatywa sadzenia drzew wzdłuż rzeki Iny.",
    },
    {
      id: 3,
      coordinates: { latitude: 53.335, longitude: 15.029 },
      title: "Warsztaty Ekologiczne",
      address: "ul. Leśna 456, Kraków",
      date: "2024-11-10",
      description: "Warsztaty na temat zrównoważonego rozwoju.",
    },
    {
      id: 4,
      coordinates: { latitude: 53.334, longitude: 15.028 },
      title: "Zbiórka Plastiku",
      address: "ul. Leśna 456, Kraków",
      date: "2024-11-10",
      description: "Zbiórka plastiku w okolicach jeziora Miedwie.",
    },
    {
      id: 5,
      coordinates: { latitude: 53.3315, longitude: 15.034 },
      title: "Eko-Market",
      address: "ul. Leśna 456, Kraków",
      date: "2024-11-10",
      description: "Targ z lokalnymi, ekologicznymi produktami.",
    },
  ];

  useEffect(() => {
    if (eventId !== undefined) {
      const event = markers.find((marker) => marker.id === eventId);
      if (event) {
        setSelectedEvent(eventId);
        mapRef.current?.animateToRegion(
          {
            latitude: event.coordinates.latitude,
            longitude: event.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    }
  }, [eventId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          region={region}
          showsUserLocation={true}
          style={styles.map}
          provider="google"
        >
          {markers.map((marker) => (
            <Marker
              tracksViewChanges={false}
              key={marker.id}
              coordinate={marker.coordinates}
              title={marker.title}
              onPress={() => {
                setSelectedEvent(marker.id);
              }}
            >
              <FontAwesome
                name="map-marker"
                size={selectedEvent === marker.id ? 40 : 35}
                color={selectedEvent === marker.id ? primaryColor : "black"}
              />
            </Marker>
          ))}
        </MapView>

        {selectedEvent !== null && (
          <EventListItem
            eventData={markers[selectedEvent]}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
});

export default Map;
