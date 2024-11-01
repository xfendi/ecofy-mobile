import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <SafeAreaView>
      <View>
        <Text className="text-red-500 bg-black">Home</Text>
      </View>
    </SafeAreaView>
  );
};

export default index;
