import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { primaryColor } from "../config.json"

const TabBar = ({ state, descriptors, navigation }) => {
  const icons = {
    index: (props) => <FontAwesome name="home" {...props} />,
    create: (props) => <FontAwesome name="plus" {...props} />,
    map: (props) => <FontAwesome name="map" {...props} />,
    events: (props) => <FontAwesome name="map-marker" {...props} />,
    profile: (props) => <FontAwesome name="user" {...props} />,
  };

  return (
    <View className="absolute bottom-[0px] rounded-[25px] flex flex-row justify-between items-center p-[15px] bg-white m-[15px]">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (["_sitemap", "+not-found"].includes(route.name)) return null;

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
              color: isFocused ? primaryColor : "black",
            })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;
