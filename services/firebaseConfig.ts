import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyAUqhNffH1FyZGzxOEjXkncNKl8wK1eePg",
  authDomain: "dsa-app-21d17.firebaseapp.com",
  projectId: "dsa-app-21d17",
  storageBucket: "dsa-app-21d17.firebasestorage.app",
  messagingSenderId: "37154725975",
  appId: "1:37154725975:web:9ea839f19b13cd9a8b8312"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };