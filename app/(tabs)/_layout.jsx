import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import { UserAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const _layout = () => {
    const { user } = UserAuth(); // Pobranie użytkownika z kontekstu
    const router = useRouter(); // Użycie hooka useRouter
    const [loading, setLoading] = useState(true); // Stan do monitorowania ładowania

    useEffect(() => {
        // Sprawdzenie, czy użytkownik jest zalogowany
        if (!user) {
            router.replace("/(auth)/welcome"); // Przekierowanie do ekranu logowania
        } else {
            setLoading(false); // Ustawienie stanu ładowania na false, jeśli użytkownik jest zalogowany
        }
    }, [user, router]); // Zależność od usera i routera

    if (loading) {
        return null; // Zwróć null, gdy trwa ładowanie
    }

    return (
        <Tabs tabBar={(props) => <TabBar {...props} />}>
            <Tabs.Screen name="index" options={{ headerShown: false }} />
            <Tabs.Screen name="map" options={{ headerShown: false }} />
            <Tabs.Screen name="create" options={{ headerShown: false }} />
            <Tabs.Screen name="events" options={{ headerShown: false }} />
            <Tabs.Screen name="profile" options={{ headerShown: false }} />
        </Tabs>
    );
};

export default _layout;
