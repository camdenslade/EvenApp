// app/firebase.ts
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDo4FTcf9Pe_CqqgNLk7P85YoHOW6HcqDw",
  authDomain: "even-dating.firebaseapp.com",
  projectId: "even-dating",
  storageBucket: "even-dating.firebasestorage.app",
  messagingSenderId: "801278672018",
  appId: "1:801278672018:web:0b6a77bf679ad2c13efa4b",
  measurementId: "G-4XSXXK475F"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
