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
import { registerIndieID, unregisterIndieDevice } from "native-notify";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        registerIndieID(currentUser.uid, 24760, "yWMd08JhWMihJYHlyMV9so").catch(
          console.error
        );
      }
    });
    return unsubscribe;
  }, []);

  const createUser = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "profiles", userCredential.user.uid), {
        createdAt: new Date(),
      });
      await updateProfile(userCredential.user, { displayName: name });
      await registerIndieID(
        userCredential.user.uid,
        24760,
        "yWMd08JhWMihJYHlyMV9so"
      );
      setUser(userCredential.user);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error creating user:", error);
      return { error: error.message };
    }
  };

  const SignIn = async (email, password) => {
    try {
      if (!email || !password) {
        return { error: "Proszę wypełnić wszystkie pola." };
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await registerIndieID(
        userCredential.user.uid,
        24760,
        "yWMd08JhWMihJYHlyMV9so"
      );

      setUser(userCredential.user);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await unregisterIndieDevice(
          auth.currentUser.uid,
          24760,
          "yWMd08JhWMihJYHlyMV9so"
        );
      }
      await signOut(auth);
      setUser(null);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, createUser, SignIn, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => useContext(UserContext);
