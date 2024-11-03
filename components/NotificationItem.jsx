import React from 'react';
import { View, Text } from 'react-native';

const NotificationItem = ({ notification }) => {
    return (
        <View className="p-5 flex flex-col gap-2 bg-white rounded-xl shadow mb-2">
            <Text className="text-gray-500">{notification.message}</Text>
        </View>
    );
};

export default NotificationItem;
