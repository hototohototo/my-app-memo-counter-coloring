import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB6Z0bs0Vrr4yIiWJ_pNvoMQAN0mTDmcIk",
  authDomain: "my-app-memocounter.firebaseapp.com",
  databaseURL: "https://my-app-memocounter-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-app-memocounter",
  storageBucket: "my-app-memocounter.appspot.com",
  messagingSenderId: "644001505230",
  appId: "1:644001505230:web:5199508f6e90e0cd67159f"
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app) // 既にあるならそのまま



// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyB6Z0bs0Vrr4yIiWJ_pNvoMQAN0mTDmcIk",
//   authDomain: "my-app-memocounter.firebaseapp.com",
//   databaseURL: "https://my-app-memocounter-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "my-app-memocounter",
//   storageBucket: "my-app-memocounter.firebasestorage.app",
//   messagingSenderId: "644001505230",
//   appId: "1:644001505230:web:5199508f6e90e0cd67159f",
//   measurementId: "G-KZ8YKPM4PM"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);