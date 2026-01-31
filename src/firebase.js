import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD8ij9P5TJ3zrS1lEzhjGUw1PwK0JzvWGw",
  authDomain: "campuscanvas-mgma.firebaseapp.com",
  projectId: "campuscanvas-mgma",
  storageBucket: "campuscanvas-mgma.firebasestorage.app",
  messagingSenderId: "165486772565",
  appId: "1:165486772565:web:b44b7282ba8f54b9df2fdc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export default app;

