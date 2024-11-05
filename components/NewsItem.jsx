import React from 'react';
import {View, Text, Image, Dimensions} from 'react-native';
const { width } = Dimensions.get("window");

const NewsItem = ({ news }) => {
    return (
        <View className="border-b border-gray-200 pb-2 mb-2">
            <Text className="font-bold text-lg">{news.title}</Text>
            <Text className="text-gray-700">{news.description}</Text>
            {news.image && (
                <Image
                    source={{ uri: news.image }}
                    className="rounded-xl w-full"
                    style={{ height: width - 80 }}
                    resizeMode="cover"
                />
            )}
        </View>
    );
};

export default NewsItem;
