import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { UserAuth } from "../../context/AuthContext";
import { router } from "expo-router";

const index = () => {
  const { logout } = UserAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/(auth)/welcome');
  }
  return (
    <SafeAreaView>
      <View>
        <Text className="text-red-500 bg-black">Home</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default index;
