import { View, TouchableOpacity, Image, Platform } from "react-native";
import React from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

import { primaryColor } from "../config.json";
import { UserAuth } from "../context/AuthContext";

const TabBar = ({ state, descriptors, navigation }) => {
  const { user } = UserAuth();
  const icons = {
    index: (props) => <Feather name="home" {...props} />,
    create: (props) => <Feather name="plus-circle" {...props} />,
    map: (props) => <Feather name="map-pin" {...props} />,
    community: (props) => <Feather name="message-circle" {...props} />,
    profile: (props) =>
      user?.photoURL ? (
        <Image
          source={{ uri: user?.photoURL }}
          className="rounded-full"
          style={{ height: 32, width: 32 }}
        />
      ) : (
        <Feather name="user" {...props} />
      ),
  };

  return (
    <View className={`absolute bottom-[0px] flex flex-row justify-between items-center p-5 ${Platform.OS === "ios" && "!pb-10"} bg-gray-100`}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (
          ["_sitemap", "+not-found", "settings", "events", "details"].includes(
            route.name
          )
        )
          return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            className="flex-1 justify-center items-center"
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name]({
              size: 30,
              color: isFocused ? primaryColor : "#6b7280",
            })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;
