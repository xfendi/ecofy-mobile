// EventListItem.jsx
import {View, Text, StyleSheet, Button} from 'react-native';
import React from 'react';
const EventListItem = ({ eventData }) => {

    const ShowMore = (id) =>{
        {/*przeniesienie do events.jsx*/}
    }
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{eventData?.title}</Text>
            <Text style={styles.description}>{eventData?.description}</Text>
            <Text style={styles.address}>{eventData?.address}</Text>
            <Button title="Dowiedz się więcej" color="#2222ff" onPress={() => {ShowMore(eventData.id)}}/>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 100, // Odstęp od dolnej krawędzi ekranu
        left: 20, // Odstęp od lewej krawędzi
        right: 20, // Odstęp od prawej krawędzi
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // Działa na Androidzie, aby dodać cień
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: 'gray',
    },
});

export default EventListItem;
