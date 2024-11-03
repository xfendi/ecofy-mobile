// components/EcoChallengeItem.jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const EcoChallengeItem = ({ challenge }) => {
    const { title, description, startTime, endTime } = challenge;

    const handleJoinChallenge = () => {
        // Tutaj dodaj logikę, aby użytkownik mógł wziąć udział w wyzwaniu
        alert(`Dołączyłeś do wyzwania: ${title}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.dates}>
                Rozpoczęcie: {new Date(startTime).toLocaleString()}{"\n"}
                Zakończenie: {new Date(endTime).toLocaleString()}
            </Text>
            <Button title="Weź udział" onPress={handleJoinChallenge} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        marginVertical: 5,
    },
    dates: {
        marginBottom: 10,
        color: 'gray',
    },
});

export default EcoChallengeItem;
