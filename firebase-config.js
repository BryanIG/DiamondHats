// Importar las funciones necesarias de los SDKs de Firebase (v11.0.1 estable)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de tu proyecto Diamond Hats
const firebaseConfig = {
    apiKey: "AIzaSyCGdqpFOraa9b2dttIwUw2pfqfWTH11MTE",
    authDomain: "diamond-hats-b7f95.firebaseapp.com",
    projectId: "diamond-hats-b7f95",
    storageBucket: "diamond-hats-b7f95.firebasestorage.app",
    messagingSenderId: "721797444933",
    appId: "1:721797444933:web:a26c68690ef12b4c673a2c"
};

// Inicializar Firebase, Auth y Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);