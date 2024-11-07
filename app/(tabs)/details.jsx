import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { primaryColor } from "../../config.json";  // Ścieżka do config.json
import { useRouter, useLocalSearchParams } from "expo-router";
import { UseMap } from "../../context/MapContext";  // Ścieżka do kontekstu MapContext
import { UserAuth } from "../../context/AuthContext";  // Ścieżka do kontekstu AuthContext

import { db } from "../../firebase";  // Ścieżka do pliku firebase
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    deleteDoc,
} from "firebase/firestore";

const Details = () => {
    const params = useLocalSearchParams();
    const { eventId } = params;  // Parametr eventId
    const [event, setEvent] = useState(null);
    const [isLike, setIsLike] = useState(false);
    const { setSelectedEvent } = UseMap(); // Access the context
    const { user } = UserAuth();  // Pobieranie użytkownika z AuthContext
    const { width } = Dimensions.get("window");
    const router = useRouter();

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId);
        }
    }, [eventId]);

    const fetchEventDetails = async (id) => {
        try {
            const eventRef = doc(db, "events", id.toString());
            const eventSnap = await getDoc(eventRef);
            if (eventSnap.exists()) {
                const eventDetails = eventSnap.data();
                setEvent(eventDetails);

                // Sprawdzamy, czy użytkownik polubił wydarzenie
                const likes = eventDetails.likes || [];
                setIsLike(likes.includes(user.uid));
            } else {
                console.log("Event not found");
            }
        } catch (error) {
            console.error("Błąd podczas ładowania szczegółów wydarzenia:", error);
        }
    };

    const handleShowOnMap = () => {
        if (event) {
            setSelectedEvent(event);
            router.replace("/(tabs)/map");
        }
    };

    const handleLikeToggle = async () => {
        const eventRef = doc(db, "events", event.id.toString());
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
            const eventData = eventSnap.data();
            const likes = eventData.likes || [];

            if (likes.includes(user.uid)) {
                await updateDoc(eventRef, {
                    likes: arrayRemove(user.uid),
                });
                setIsLike(false);
            } else {
                await updateDoc(eventRef, {
                    likes: arrayUnion(user.uid),
                });
                setIsLike(true);
            }
        }
    };

    const handleDelete = async () => {
        if (event) {
            await deleteDoc(doc(db, "events", event.id.toString()));
            router.replace("/(tabs)/events"); // Po usunięciu przekierowanie do listy wydarzeń
        }
    };

    if (!event) {
        return (
            <View style={styles.centered}>
                <Text>Ładowanie szczegółów...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Ikona kosza lub serca w prawym górnym rogu */}
            <View style={styles.iconContainer}>
                {event.host === user.uid ? (
                    <TouchableOpacity onPress={handleDelete}>
                        <AntDesign name="delete" size={24} color="red" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleLikeToggle}>
                        {isLike ? (
                            <AntDesign name="heart" size={24} color="red" />
                        ) : (
                            <Feather name="heart" size={24} color="black" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title}>{event.title}</Text>
            {event.photoURL && <Image source={{ uri: event.photoURL }} style={styles.image} />}
            <Text style={styles.sectionTitle}>Opis</Text>
            <Text style={styles.description}>{event.description}</Text>

            <Text style={styles.sectionTitle}>Szczegóły:</Text>
            <Text style={styles.detail}>Adres: {event.address}</Text>
            <Text style={styles.detail}>Data: {event.date}</Text>
            <Text style={styles.sectionTitle}>Lokalizacja:</Text>
            <Text style={styles.detail}>Szerokość: {event.coordinates.latitude}</Text>
            <Text style={styles.detail}>Długość: {event.coordinates.longitude}</Text>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={handleShowOnMap}
                    style={[styles.button, { backgroundColor: primaryColor, width: width * 0.5 - 43 }]}
                >
                    <Text style={styles.buttonText}>Pokaż na mapie</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = {
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flex: 1,
        marginTop: 20, // Dodanie odstępu od góry
        marginBottom: 20, // Dodanie odstępu od dołu
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    detail: {
        fontSize: 16,
        marginBottom: 8,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconContainer: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1,
    },
};

export default Details;
