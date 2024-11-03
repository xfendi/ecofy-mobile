import React from 'react';
import { View, Text, Image } from 'react-native';

const NewsItem = ({ news }) => {
    return (
        <View className="border-b border-gray-200 pb-2 mb-2">
            <Text className="font-bold text-lg">{news.title}</Text>
            <Text className="text-gray-700">{news.description}</Text>
            {news.image && (
                <Image
                    source={{ uri: news.image }}
                    className="h-32 w-full rounded-md mt-2"
                    resizeMode="cover"
                />
            )}
        </View>
    );
};

export default NewsItem;
