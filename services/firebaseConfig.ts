
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyAUqhNffH1FyZGzxOEjXkncNKl8wK1eePg",
  authDomain: "dsa-app-21d17.firebaseapp.com",
  projectId: "dsa-app-21d17",
  storageBucket: "dsa-app-21d17.firebasestorage.app",
  messagingSenderId: "37154725975",
  appId: "1:37154725975:web:9ea839f19b13cd9a8b8312"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = (() => {
  if (getApps().length > 0) {
    try {
      return getAuth(app);
    } catch (e) {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  }
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
})();