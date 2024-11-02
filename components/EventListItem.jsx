import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import React from 'react';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router"; // Importuj useRouter

const EventListItem = ({ eventData, onClose }) => {
    const router = useRouter(); // Inicjalizuj router

    const ShowMore = (id) => {
        router.push({
            pathname: "/(tabs)/events", // Ścieżka do komponentu Events
            params: { eventId: id }, // Przekaż identyfikator wydarzenia
        });
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <FontAwesome name="times" size={20} style={{ color: 'red' }} />
            </TouchableOpacity>
            <Text style={styles.title}>{eventData?.title}</Text>
            <Text style={styles.description}>{eventData?.description}</Text>
            <Text style={styles.address}>{eventData?.address}</Text>
            <Button title="Dowiedz się więcej" color="#2222ff" onPress={() => { ShowMore(eventData.id) }} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: 'gray',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default EventListItem;
