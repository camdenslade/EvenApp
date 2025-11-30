// app/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDo4FTcf9Pe_CqqgNLk7P85YoHOW6HcqDw",
  authDomain: "even-dating.firebaseapp.com",
  projectId: "even-dating",
  storageBucket: "even-dating.firebasestorage.app",
  messagingSenderId: "801278672018",
  appId: "1:801278672018:web:9007af16b2f8413b3efa4b",
  measurementId: "G-Y98TVSNK5G"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);