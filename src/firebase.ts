// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {getFirestore, collection, addDoc, doc, getDoc} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut ,User  } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable ,getStorage} from 'firebase/storage';
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
 const storage = getStorage(firebase);

 export {
  firebase, 
   db ,
   auth,
   storage,
   signInWithEmailAndPassword,
   signOut, 
   collection, 
   addDoc, 
   doc, 
   getDoc,
   getDownloadURL, 
   ref, 
   uploadBytesResumable
}