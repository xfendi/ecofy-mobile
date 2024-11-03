import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { useMap } from "../../context/MapContext";

import { db } from "../../firebase";
import EventListItem from "../../components/EventListItem";
import useGeoLocation from "../../context/GeoLocationContext";
import { primaryColor } from "../../config.json";

const Map = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { selectedE, setSelectedE } = useMap();
  {console.log(selectedE)}

  const mapRef = useRef(null);
  const { region } = useGeoLocation();

  console.log("selectedEventID:", selectedEvent?.id);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "events"),
      (querySnapshot) => {
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docsArray.push({
            ...data,
            date: data.date.toDate().toLocaleDateString(),
          });
        });

        setEvents(docsArray);
      }
    );

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedE) {
        const event = events.find((marker) => marker.id === selectedE);
        if (event) {
          setSelectedEvent(event);
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
          console.log("Invalid eventId");
        }
        setSelectedE(null);
      }
    }, [selectedE, events])
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          region={region}
          showsUserLocation={true}
          style={styles.map}
          provider="google"
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
          <EventListItem
            eventData={selectedEvent}
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
