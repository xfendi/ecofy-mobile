import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState(new Date());
    const [eventAddress, setEventAddress] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${searchQuery}&apiKey=${apiKey}`);
            setLocationResults(response.data.features);
        } catch (error) {
            console.error('Error fetching location data:', error);
        }
    };

    const handleLocationSelect = (location) => {
        setEventAddress(location.properties.formatted);
        setCoordinates({
            lat: location.geometry.coordinates[1],
            lon: location.geometry.coordinates[0],
        });
        setLocationResults([]);
    };

    const handleSubmit = () => {
        console.log({
            name: eventName,
            date: eventDate.toISOString(),
            address: eventAddress,
            description: eventDescription,
            coordinates: coordinates,
        });
        setEventName('');
        setEventDate(new Date());
        setEventAddress('');
        setSearchQuery('');
        setEventDescription('');
        setLocationResults([]);
        setCoordinates({ lat: null, lon: null });
    };

    return (
        <FlatList
            contentContainerStyle={styles.container}
            data={[{ key: 'form' }]} // Dummy data to use FlatList
            renderItem={() => (
                <View>
                    <Text style={styles.title}>Stwórz Wydarzenie</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nazwa wydarzenia"
                        value={eventName}
                        onChangeText={setEventName}
                    />
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <FontAwesome name="calendar" size={20} color="#fff" />
                        <Text style={styles.dateButtonText}>{eventDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={eventDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setEventDate(selectedDate);
                                }
                            }}
                        />
                    )}
                    <View style={styles.locationContainer}>
                        <FontAwesome name="search" size={20} style={styles.searchIcon} />
                        <TextInput
                            style={styles.locationInput}
                            placeholder="Wyszukaj lokalizację"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <FlatList
                        data={locationResults}
                        keyExtractor={(location) => location.properties.place_id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.locationButton} onPress={() => handleLocationSelect(item)}>
                                <Text style={styles.locationText}>{item.properties.formatted}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.locationList}
                    />
                    <Text style={styles.selectedAddress}>Wybrana lokalizacja: {eventAddress}</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Opis wydarzenia"
                        value={eventDescription}
                        onChangeText={setEventDescription}
                        multiline
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Utwórz Wydarzenie</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    dateButtonText: {
        color: '#fff',
        marginLeft: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    locationInput: {
        flex: 1,
        height: 40,
    },
    locationButton: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    locationText: {
        fontSize: 16,
    },
    selectedAddress: {
        marginVertical: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    descriptionInput: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CreateEvent;