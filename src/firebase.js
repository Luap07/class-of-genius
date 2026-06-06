import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBCVHEpqyx15GBRiDdGl6PwG7wzzAdJgHs",
  authDomain: "class-of-genius.firebaseapp.com",
  projectId: "class-of-genius",
  storageBucket: "class-of-genius.appspot.com",
  messagingSenderId: "105820643883",
  appId: "1:105820643883:web:33b91b10fe8a91657b406e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);