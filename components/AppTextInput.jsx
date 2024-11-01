import { TextInput } from "react-native";
import React, { useState } from "react";

const AppTextInput = ({ ...otherProps }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      className={`w-80 p-4 rounded-xl bg-white text-lg text-start border-2 border-transparent ${
        focused && "!border-green-500 border-solid border-2"
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...otherProps}
    />
  );
};

export default AppTextInput;
