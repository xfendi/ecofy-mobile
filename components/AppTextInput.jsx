import { TextInput } from "react-native";
import React, { useState } from "react";

const AppTextInput = ({ full, gray, ...otherProps }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      className={`${full ? "w-full" : "w-80"} p-5 rounded-xl ${gray ? "bg-gray-100" : "bg-white"} text-lg text-start border-2 border-transparent ${
        focused && "!border-green-500 border-solid border-2"
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...otherProps}
    />
  );
};

export default AppTextInput;
