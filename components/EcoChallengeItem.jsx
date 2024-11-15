import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { primaryColor } from "../config.json";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";

const EcoChallengeItem = ({ challenge }) => {
  const {
    title,
    description,
    startTime,
    endTime,
    joinedUsers = [],
    doneUsers = [],
  } = challenge;
  const { user } = UserAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (user?.uid && Array.isArray(joinedUsers)) {
      setIsJoined(joinedUsers.includes(user.uid));
    }
    if (user?.uid && Array.isArray(doneUsers)) {
      setIsDone(doneUsers.includes(user.uid));
    }
  }, [joinedUsers, user, doneUsers]);

  const handleJoinChallenge = async () => {
    if (isJoined) {
      Alert.alert(
        "Już dołączony!",
        "Nie możesz dołączyć ponownie do tego wyzwania."
      );
      return;
    }

    if (!challenge || !challenge.id || typeof challenge.id !== "number") {
      console.error("Challenge or Challenge ID is not valid", { challenge });
      Alert.alert(
        "Błąd",
        "Nie można dołączyć do wyzwania. Proszę spróbować ponownie."
      );
      return;
    }

    console.log("Attempting to join challenge with ID:", challenge.id);
    console.log("Challenge details:", {
      title,
      description,
      startTime,
      endTime,
      joinedUsers,
    });

    const challengeRef = doc(db, "ecoChallenges", String(challenge.id));
    console.log("Challenge Reference:", challengeRef);

    try {
      await updateDoc(challengeRef, {
        joinedUsers: arrayUnion(user?.uid),
      });

      setIsJoined(true);
      Alert.alert(`Dołączyłeś do wyzwania: ${title}`);
      console.log(`User ${user?.uid} joined challenge: ${title}`);
    } catch (error) {
      console.error("Error joining challenge:", error.message);
      Alert.alert("Wystąpił błąd przy dołączaniu do wyzwania.");
    }
  };

  const handleDoneChallenge = async () => {
    if (!isJoined) {
      Alert.alert(
        "Jeszcze nie dołączyłeś!",
        "Nie możesz wykonać zadania dopóki do niego nie dołaczyłeś."
      );
      return;
    }

    if (!challenge || !challenge.id || typeof challenge.id !== "number") {
      console.error("Challenge or Challenge ID is not valid", { challenge });
      Alert.alert(
        "Błąd",
        "Nie można dołączyć do wyzwania. Proszę spróbować ponownie."
      );
      return;
    }

    console.log("Attempting to join challenge with ID:", challenge.id);
    console.log("Challenge details:", {
      title,
      description,
      startTime,
      endTime,
      joinedUsers,
    });

    const challengeRef = doc(db, "ecoChallenges", String(challenge.id));
    console.log("Challenge Reference:", challengeRef);

    try {
      await updateDoc(challengeRef, {
        doneUsers: arrayUnion(user?.uid),
      });

      setIsDone(true);
      Alert.alert("Sukces", `Wykonałeś wyzwanie: ${title}`);
      console.log(`User ${user?.uid} done challenge: ${title}`);
    } catch (error) {
      console.error("Error w zrobieniu challenge:", error.message);
      Alert.alert("Wystąpił błąd przy wykonywaniu wyzwania.");
    }
  };

  const handleUnjoinChallenge = async () => {
    if (!isJoined) {
      Alert.alert(
        "Nie jesteś członkiem wyzwania!",
        "Nie możesz się wypisać, ponieważ nie dołączyłeś do wyzwania."
      );
      return;
    }

    const challengeRef = doc(db, "ecoChallenges", String(challenge.id));

    try {
      await updateDoc(challengeRef, {
        joinedUsers: arrayRemove(user.uid),
      });
      setIsJoined(false);
      Alert.alert(`Opuszczono wyzwanie: ${title}`);
    } catch (error) {
      console.error("Error leaving challenge: ", error);
      Alert.alert("Wystąpił błąd przy opuszczaniu wyzwania.");
    }
  };

  return (
    <View className="flex flex-col gap-5 bg-white p-5 rounded-3xl">
      <Text className="text-xl font-semibold">{title}</Text>
      <Text className="text-gray-500">{description}</Text>
      <View className="flex flex-row gap-5">
        <View>
          <Text className="font-semibold">Rozpoczęcie</Text>
          <Text className="text-gray-500">
            {new Date(startTime).toLocaleString()}
          </Text>
        </View>
        <View>
          <Text className="font-semibold">Zakończenie</Text>
          <Text className="text-gray-500">
            {new Date(endTime).toLocaleString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={isJoined ? handleUnjoinChallenge : handleJoinChallenge}
        className="p-5 rounded-full"
        style={{ backgroundColor: isJoined ? "red" : primaryColor }}
        disabled={false}
      >
        <Text className="text-white text-xl font-semibold text-center">
          {isJoined ? "Opuszczam" : "Biorę udział"}
        </Text>
      </TouchableOpacity>
      {isJoined && (
        <TouchableOpacity
          className="flex flex-row gap-5 justify-center items-center rounded-full h-16"
          onPress={handleDoneChallenge}
          disabled={isDone ? true : false}
          style={{ backgroundColor: isDone ? "gray" : "#3b82f6" }}
        >
          <Text className="text-white text-xl font-semibold text-center">
            {isDone ? "Już oznaczone jako wykonane" : "Oznacz jako wykonane"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EcoChallengeItem;
