import { useContext, useEffect, useState, createContext } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({});

  const router = useRouter();

  const createUser = async (email, password, name) => {
    await createUserWithEmailAndPassword(auth, email, password).then(
      function () {
        console.log("Successfully created new user.");
        setDoc(doc(db, "profiles", auth.currentUser?.uid), {
          createdAt: new Date(),
        });
        updateProfile(auth.currentUser, {
          displayName: name,
        });
      }
    );
  };

  const SignIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth).then(() => {
      console.log("User signed out");
      router.replace("/(auth)/welcome");
    })
  };

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Adres Email:", currentUser.email);
        console.log("User ID:", currentUser.uid)
        console.log("Zdjęcie Profilowe:", currentUser.photoURL);
        console.log("Nazwa użytkownika: ", currentUser.displayName);
        console.log("Email Zweryfikowany: ", currentUser.emailVerified);
      } else {
        console.log("User not logged in");
      }
      setUser(currentUser);
    });
  }, []);

  return (
    <UserContext.Provider value={{ createUser, SignIn, logout, user }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};
