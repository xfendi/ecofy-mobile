import React from "react";
import { View, Text, Image, Dimensions } from "react-native";

const NewsItem = ({ news }) => {
  const { width } = Dimensions.get("window");

  return (
    <View className="border-b border-gray-200 pb-5">
      <Text className="font-bold text-lg">{news.title}</Text>
      <Text className="text-gray-700">{news.description}</Text>
      {news.image && (
        <Image
          source={{ uri: news.image }}
          className="h-32 w-full rounded-xl mt-5"
          style={{ height: width - 80 }}
        />
      )}
    </View>
  );
};

export default NewsItem;
