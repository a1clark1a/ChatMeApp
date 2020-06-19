import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

var firebaseConfig = firebase.initializeApp({
  apiKey: "AIzaSyCczVDp5lTxObH_H8DcNP-lSfBtNtQxxlM",
  authDomain: "react-slack-clone-550b3.firebaseapp.com",
  databaseURL: "https://react-slack-clone-550b3.firebaseio.com",
  projectId: "react-slack-clone-550b3",
  storageBucket: "react-slack-clone-550b3.appspot.com",
  messagingSenderId: "730886789516",
  appId: "1:730886789516:web:99e488f328196c1d0c1ea9",
  measurementId: "G-DGHH1BFR8P",
})

export default firebase
