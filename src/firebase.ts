// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut ,User  } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC1dkLAZHwvSqRd6zUSXY4opRIX9j9NZM",
  authDomain: "bssesportes-f5468.firebaseapp.com",
  databaseURL: "https://bssesportes-f5468-default-rtdb.firebaseio.com",
  projectId: "bssesportes-f5468",
  storageBucket: "bssesportes-f5468.appspot.com",
  messagingSenderId: "566423303677",
  appId: "1:566423303677:web:74faf651a2249714b19594"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
 const db = getFirestore()
 const auth = getAuth(firebase);

 export {firebase, db ,auth,signInWithEmailAndPassword,signOut}