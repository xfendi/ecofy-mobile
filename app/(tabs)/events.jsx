import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import EventItem from "../../components/EventItem";

const eventsData = [
    {
        id: 0,
        title: "Sprzątanie Parku",
        date: "2024-11-10",
        address: "Park Chrobrego, Szczecin",
        description: "Wydarzenie sprzątania parku, które ma na celu ochronę środowiska.",
        coordinates: { latitude: 53.3331, longitude: 15.0305 },
    },
    {
        id: 1,
        title: "Warsztaty Ekologiczne",
        date: "2024-11-15",
        address: "Centrum Ekologiczne, Poznań",
        description: "Warsztaty dotyczące zrównoważonego rozwoju i ekologii.",
        coordinates: { latitude: 52.4064, longitude: 16.9252 },
    },
    {
        id: 2,
        title: "Sadzenie Drzew",
        date: "2024-11-20",
        address: "Rzeka Ina, Szczecin",
        description: "Inicjatywa sadzenia drzew wzdłuż rzeki, aby poprawić jakość powietrza.",
        coordinates: { latitude: 53.3320, longitude: 15.0325 },
    },
    {
        id: 3,
        title: "Zbiórka Plastiku",
        date: "2024-11-25",
        address: "Jezioro Miedwie, Szczecin",
        description: "Zbiórka plastiku z okolic jeziora, mająca na celu oczyszczenie wód.",
        coordinates: { latitude: 53.3340, longitude: 15.0280 },
    },
    {
        id: 4,
        title: "Eko-Market",
        date: "2024-11-30",
        address: "Rynek, Szczecin",
        description: "Targ z lokalnymi, ekologicznymi produktami.",
        coordinates: { latitude: 53.3315, longitude: 15.0340 },
    },
    {
        id: 5,
        title: "Bieg Charytatywny",
        date: "2024-12-05",
        address: "Plac Wolności, Poznań",
        description: "Bieg mający na celu zbieranie funduszy na rzecz lokalnych organizacji charytatywnych.",
        coordinates: { latitude: 52.4050, longitude: 16.9318 },
    },
];

const Events = () => {
    const [interestedEvents, setInterestedEvents] = useState(new Set());
    const [highlightedEvent, setHighlightedEvent] = useState(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    // Odczytanie ID z parametrów i podświetlenie wydarzenia
    useEffect(() => {
        const eventId = parseInt(params.eventId, 10);
        if (!isNaN(eventId) && eventsData.some(event => event.id === eventId)) {
            setHighlightedEvent(eventId);

            const timer = setTimeout(() => {
                setHighlightedEvent(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [params.eventId]);

    const toggleInterest = (eventId) => {
        setInterestedEvents((prev) => {
            const newSet = new Set(prev);
            newSet.has(eventId) ? newSet.delete(eventId) : newSet.add(eventId);
            return newSet;
        });
    };

    const handleShowOnMap = (eventId) => {
        router.push({
            pathname: "/(tabs)/map",
            params: { eventId: String(eventId) },
        });
    };

    const renderEvent = (item) => (
        <EventItem event={item} key={item.id} isHighlight={highlightedEvent === item.id} />
    );

    return (
        <SafeAreaView>
            <View style={{}}>
                <Text style={styles.header}>Wydarzenia</Text>
                <ScrollView contentContainerStyle={{ paddingBottom: 230, gap: 20, padding: 10 }}>
                    {eventsData.map(renderEvent)}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
    },
    eventContainer: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
    },
    highlightedEvent: {
        backgroundColor: '#ffeb3b', // Kolor podświetlenia
        borderWidth: 2,
        borderColor: '#fbc02d',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    interestButton: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    mapButton: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Events;