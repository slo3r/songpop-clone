import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZBIV1LG6e5bZC6Bbv1JKr9xukGULOikM",
  authDomain: "songpopclone-c0737.firebaseapp.com",
  projectId: "songpopclone-c0737",
  storageBucket: "songpopclone-c0737.appspot.com",
  messagingSenderId: "181676614238",
  appId: "1:181676614238:web:53c32e5023d89ecd214acf"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage();
export const db = getFirestore()