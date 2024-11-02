import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { UserAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import EventItem from "../../components/EventItem";

// Mock data for demonstration purposes
const upcomingEvents = [
  {
    id: 1,
    title: "Sprzątanie Parku",
    date: "2024-11-10",
    address: "Park Chrobrego, Szczecin",
    coordinates: { latitude: 53.3331, longitude: 15.0305 }
  },
  {
    id: 2,
    title: "Warsztaty Ekologiczne",
    date: "2024-11-15",
    address: "Centrum Ekologiczne, Poznań",
    coordinates: { latitude: 52.4064, longitude: 16.9252 }
  },
  {
    id: 3,
    title: "Sadzenie Drzew",
    date: "2024-11-20",
    address: "Rzeka Ina, Szczecin",
    coordinates: { latitude: 53.3320, longitude: 15.0325 }
  },
  {
    id: 4,
    title: "Zbiórka Plastiku",
    date: "2024-11-25",
    address: "Jezioro Miedwie, Szczecin",
    coordinates: { latitude: 53.3350, longitude: 15.0280 }
  },
  {
    id: 5,
    title: "Eko-Market",
    date: "2024-11-30",
    address: "Rynek, Szczecin",
    coordinates: { latitude: 53.4290, longitude: 14.5522 }
  },
  {
    id: 6,
    title: "Bieg Charytatywny",
    date: "2024-12-05",
    address: "Plac Wolności, Poznań",
    coordinates: { latitude: 52.4055, longitude: 16.9342 }
  },
];



const ecoTips = [
  {
    id: 1,
    title: "Oszczędzaj wodę",
    description: "Zamykaj kran podczas mycia zębów, co może zaoszczędzić do 5 litrów wody.",
  },
  {
    id: 2,
    title: "Zrównoważona dieta",
    description: "Jedz więcej warzyw i owoców, wspierając lokalne uprawy i redukując ślad węglowy.",
  },
  {
    id: 3,
    title: "Wykorzystuj transport publiczny",
    description: "Korzystanie z transportu publicznego zmniejsza zanieczyszczenie powietrza i zmniejsza korki.",
  },
  {
    id: 4,
    title: "Segregacja odpadów",
    description: "Prawidłowa segregacja śmieci to kluczowy krok w kierunku recyklingu i zmniejszenia odpadów.",
  },
  {
    id: 5,
    title: "Kompostowanie",
    description: "Tworzenie kompostu z resztek jedzenia to doskonały sposób na zmniejszenie odpadów organicznych.",
  },
  {
    id: 6,
    title: "Unikaj plastiku",
    description: "Zrezygnuj z jednorazowych plastikowych produktów na rzecz wielorazowych.",
  },
];

const faqs = [
  { id: 1, question: "Co to jest ekologia?", answer: "Ekologia to nauka o relacjach między organizmami a ich środowiskiem." },
  { id: 2, question: "Jak mogę pomóc środowisku?", answer: "Możesz oszczędzać wodę, używać transportu publicznego i segregować odpady." },
  { id: 3, question: "Co to jest zrównoważony rozwój?", answer: "To rozwój, który zaspokaja potrzeby obecnych pokoleń, nie zagrażając przyszłym." },
  { id: 4, question: "Jakie są skutki zmian klimatycznych?", answer: "Zmiany klimatyczne prowadzą do ekstremalnych zjawisk pogodowych, topnienia lodowców i podnoszenia się poziomu mórz." },
  { id: 5, question: "Czy warto inwestować w odnawialne źródła energii?", answer: "Tak, odnawialne źródła energii zmniejszają emisję CO2 i są bardziej zrównoważone." },
  { id: 6, question: "Jakie są korzyści z recyklingu?", answer: "Recykling zmniejsza ilość odpadów na wysypiskach i oszczędza zasoby naturalne." },
  { id: 7, question: "Co mogę zrobić, aby zmniejszyć ślad węglowy?", answer: "Możesz korzystać z transportu publicznego, chodzić pieszo lub jeździć rowerem." },
  { id: 8, question: "Jakie są najważniejsze źródła zanieczyszczeń powietrza?", answer: "Główne źródła to transport, przemysł i spalanie paliw kopalnych." },
];

const Index = () => {
  const { user, logout } = UserAuth(); // Assuming user contains displayName or email

  const handleLogout = async () => {
    await logout();
    router.push('/(auth)/welcome');
  };
  const showDetails = (event) => {
    // Navigate to the details page for the specific event
    router.push({
      pathname: '/(tabs)/events', // Adjust the path as necessary
      params: { eventId: event.id },
    });
  };
  return (
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.greeting}>Cześć, {user?.displayName || user?.email}!</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.buttonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <ScrollView contentContainerStyle={{paddingBottom: 70, gap: 20}}>
          <Text style={styles.sectionTitle}>Nadchodzące Wydarzenia</Text>
          {upcomingEvents.map(item => (
              <EventItem key={item.id} event={item}/>
          ))}

          <Text style={styles.sectionTitle}>Poradniki Ekologiczne</Text>
          {ecoTips.map(item => (
              <View key={item.id} style={styles.tipItem}>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text>{item.description}</Text>
              </View>
          ))}

          <Text style={styles.sectionTitle}>FAQ o Ekologii</Text>
          {faqs.map(item => (
              <View key={item.id} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text>{item.answer}</Text>
              </View>
          ))}
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  detailsButton: {
    marginTop: 5,
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  tipItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tipTitle: {
    fontWeight: 'bold',
  },
  faqItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  faqQuestion: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  scrollView: {
    paddingBottom:0,
    flexGrow: 1,
  }
});

export default Index;
