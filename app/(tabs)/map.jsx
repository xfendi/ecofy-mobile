// maps.jsx
import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EventListItem from "../../components/EventListItem";
import useGeoLocation from "../../context/GeoLocationContext";

const Map = () => {
    const { location, region } = useGeoLocation(); // Użyj hooka, aby uzyskać lokalizację i region
    const [selectedEvent, setSelectedEvent] = useState(null);

    const markers = [
        {
            id: 0,
            coordinate: { latitude: 53.3331, longitude: 15.0305 },
            title: "Sprzątanie Parku",
            description: "Wydarzenie sprzątania w Parku Chrobrego.",
        },
        {
            id: 1,
            coordinate: { latitude: 53.3320, longitude: 15.0325 },
            title: "Sadzenie Drzew",
            description: "Inicjatywa sadzenia drzew wzdłuż rzeki Iny.",
        },
        {
            id: 2,
            coordinate: { latitude: 53.3350, longitude: 15.0290 },
            title: "Warsztaty Ekologiczne",
            description: "Warsztaty na temat zrównoważonego rozwoju.",
        },
        {
            id: 3,
            coordinate: { latitude: 53.3340, longitude: 15.0280 },
            title: "Zbiórka Plastiku",
            description: "Zbiórka plastiku w okolicach jeziora Miedwie.",
        },
        {
            id: 4,
            coordinate: { latitude: 53.3315, longitude: 15.0340 },
            title: "Eko-Market",
            description: "Targ z lokalnymi, ekologicznymi produktami.",
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <MapView
                    region={region}
                    showsUserLocation={true}
                    style={styles.map}
                    provider="google"
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            description={marker.description}
                            onPress={() => setSelectedEvent(marker.id)}
                        >
                            <FontAwesome name="map-marker" size={35} />
                        </Marker>
                    ))}
                </MapView>

                {/* Wyświetlenie szczegółów wybranego wydarzenia */}
                {selectedEvent !== null && <EventListItem eventData={markers[selectedEvent]} />}
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
