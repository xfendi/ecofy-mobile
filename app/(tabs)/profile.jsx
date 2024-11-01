import { View, Text, Button, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons'; // Importuj ikony
import { FontAwesome } from '@expo/vector-icons'; // Importuj ikonę FontAwesome

const Profile = () => {
    const { user, logout } = UserAuth();
    const router = useRouter();

    // Przykładowe dane wydarzeń
    const createdEvents = [
        {
            id: 1,
            title: "Warsztaty z recyklingu",
            date: "2024-11-05",
            address: "ul. Ekologiczna 123, Warszawa",
            description: "Warsztaty na temat skutecznego recyklingu i jego korzyści dla środowiska.",
            coordinates: { latitude: 52.2297, longitude: 21.0122 },
        },
        {
            id: 2,
            title: "Dzień sprzątania lasu",
            date: "2024-11-10",
            address: "ul. Leśna 456, Kraków",
            description: "Przyłącz się do nas w akcji sprzątania lasów.",
            coordinates: { latitude: 50.0614, longitude: 19.9383 },
        },
        {
            id: 3,
            title: "Eko-festiwal 2024",
            date: "2024-12-01",
            address: "ul. Festiwalowa 789, Gdańsk",
            description: "Festiwal poświęcony ekologicznemu stylowi życia.",
            coordinates: { latitude: 54.3520, longitude: 18.6466 },
        },
    ];

    const interestedEvents = [
        {
            id: 4,
            title: "Ekologiczne targi",
            date: "2024-11-15",
            address: "ul. Targowa 321, Wrocław",
            description: "Targi produktów ekologicznych i lokalnych.",
            coordinates: { latitude: 51.1079, longitude: 17.0385 },
        },
        {
            id: 5,
            title: "Warsztaty z permakultury",
            date: "2024-11-20",
            address: "ul. Zielona 654, Poznań",
            description: "Warsztaty na temat permakultury i zrównoważonego rozwoju.",
            coordinates: { latitude: 52.4064, longitude: 16.9252 },
        },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/(auth)/welcome");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const handleDeleteCreatedEvent = (id) => {
        // Logika do usuwania utworzonego wydarzenia
        console.log(`Utworzone wydarzenie o id ${id} zostało usunięte.`);
    };

    const handleDeleteInterestedEvent = (id) => {
        // Logika do usuwania zainteresowanego wydarzenia
        console.log(`Zainteresowanie wydarzeniem o id ${id} zostało usunięte.`);
    };

    const handleShowOnMap = (event) => {
        // Logika do wyświetlania wydarzenia na mapie
        console.log(`Pokaż wydarzenie na mapie: ${event.title}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-green-50 p-4">
            <View className="bg-white rounded-lg shadow-md p-6 mb-4">
                {/* Zdjęcie profilowe */}
                <View className="flex flex-row items-center mb-4">
                    {user.photoURL ? (
                        <Image
                            source={{ uri: user.photoURL }}
                            className="h-16 w-16 rounded-full border-2 border-green-400 mr-4"
                        />
                    ) : (
                        <FontAwesome name="user" size={64} color="#4A5568" className="mr-4" />
                    )}
                    <View>
                        <Text className="text-2xl font-bold">{user.displayName || "Niezidentyfikowany"}</Text>
                        <Text className="text-gray-700">{user.email || "Brak danych"}</Text>
                    </View>
                </View>
                <Button title="Wyloguj" onPress={handleLogout} color="#FF3D00" />
            </View>

            <ScrollView>
                <View className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <Text className="text-xl font-semibold mb-4">Ustawienia</Text>
                    <Button title="Zarządzaj ustawieniami" onPress={() => console.log("Settings")} color="#007AFF" />
                </View>

                <View className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <Text className="text-xl font-semibold mb-4">Moje wydarzenia</Text>
                    {createdEvents.length > 0 ? (
                        createdEvents.map(event => (
                            <View key={event.id} className="py-4 border-b border-gray-300 relative">
                                <Text className="text-lg font-semibold text-green-800">{event.title}</Text>
                                <Text className="text-gray-500">{event.date}</Text>
                                <Text className="text-gray-700">{event.address}</Text>
                                <Text className="text-gray-600">{event.description}</Text>
                                <Text className="text-gray-400">Współrzędne: {event.coordinates.latitude}, {event.coordinates.longitude}</Text>
                                {/* Ikonka usuwania */}
                                <TouchableOpacity
                                    onPress={() => handleDeleteCreatedEvent(event.id)}
                                    className="absolute top-4 right-4"
                                >
                                    <AntDesign name="delete" size={24} color="red" />
                                </TouchableOpacity>
                                <Button
                                    title="Pokaż na mapie"
                                    onPress={() => handleShowOnMap(event)}
                                    color="#007AFF"
                                    className="mt-2"
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500">Brak utworzonych wydarzeń.</Text>
                    )}
                </View>

                <View className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <Text className="text-xl font-semibold mb-4">Zainteresowane wydarzenia</Text>
                    {interestedEvents.length > 0 ? (
                        interestedEvents.map(event => (
                            <View key={event.id} className="py-4 border-b border-gray-300 relative">
                                <Text className="text-lg font-semibold text-green-800">{event.title}</Text>
                                <Text className="text-gray-500">{event.date}</Text>
                                <Text className="text-gray-700">{event.address}</Text>
                                <Text className="text-gray-600">{event.description}</Text>
                                <Text className="text-gray-400">Współrzędne: {event.coordinates.latitude}, {event.coordinates.longitude}</Text>
                                {/* Ikonka usuwania */}
                                <TouchableOpacity
                                    onPress={() => handleDeleteInterestedEvent(event.id)}
                                    className="absolute top-4 right-4"
                                >
                                    <AntDesign name="delete" size={24} color="red" />
                                </TouchableOpacity>
                                <Button
                                    title="Pokaż na mapie"
                                    onPress={() => handleShowOnMap(event)}
                                    color="#007AFF"
                                    className="mt-2"
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500">Brak zainteresowanych wydarzeń.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
