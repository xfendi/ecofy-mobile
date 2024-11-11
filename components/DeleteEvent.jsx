import { View, Text, Alert } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { parse } from "date-fns";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const DeleteEvent = ({ event }) => {
    console.log(event);
  const handleDelete = async (id) => {
    const currentTime = new Date();
    const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
    const timeDifference = eventDate - currentTime;
    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

    if (timeDifferenceInHours > 0 && timeDifferenceInHours <= 1) {
      Alert.alert(
        "Błąd",
        "Nie możesz usunąć wydarzenia na godzinę przed jego rozpoczęciem"
      );
    } else {
      try {
        await deleteDoc(doc(db, "events", id.toString()));
        Alert.alert("Sukces", "Pomyślnie usunięto wydarzenie!");
        router.replace("/");
      } catch (e) {
        console.error("Błąd przy usuwaniu wydarzenia:", e);
        Alert.alert("Błąd", "Nie udało się usunąć wydarzenia: ", e.message);
      }
    }
  };

  const showDeleteAlert = (id) => {
    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć to wydarzenie?",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", onPress: () => handleDelete(id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity onPress={() => showDeleteAlert(event.id)}>
      <Feather name="trash" size={24} color="red" />
    </TouchableOpacity>
  );
};

export default DeleteEvent;
