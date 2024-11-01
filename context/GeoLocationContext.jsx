// useGeoLocation.js
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Location from 'expo-location';

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState({
        latitude: 52.2297, // Domyślna lokalizacja - Warszawa
        longitude: 21.0122,
        latitudeDelta: 0.1, // Przybliżenie mapy (daleko)
        longitudeDelta: 0.1,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Jeśli użytkownik nie udzieli zgody, pokaż alert i ustaw domyślną lokalizację
                Alert.alert(
                    "Brak uprawnień",
                    "Nie udzielono zgody na dostęp do lokalizacji. Wyświetlana jest domyślna lokalizacja: Warszawa."
                );
                return;
            }

            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
                setRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.05, // Ustal bliższe przybliżenie
                    longitudeDelta: 0.05,
                });
            } catch (error) {
                // W przypadku błędu (np. czas oczekiwania) ustaw domyślną lokalizację
                Alert.alert(
                    "Błąd lokalizacji",
                    "Nie udało się pobrać aktualnej lokalizacji. Wyświetlana jest domyślna lokalizacja: Warszawa."
                );
                setRegion({
                    latitude: 52.2297, // Warszawa
                    longitude: 21.0122,
                    latitudeDelta: 0.1, // Przybliżenie mapy (daleko)
                    longitudeDelta: 0.1,
                });
            }
        })();
    }, []);

    return { location, region };
};

export default useGeoLocation;
