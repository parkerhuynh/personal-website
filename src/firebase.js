import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

const app = initializeApp({
    apiKey: "AIzaSyDa8QMcB7N8JvVh2JiJYy1QvBxmk5GpKYY",
    authDomain: "personal-website-db108.firebaseapp.com",
    projectId: "personal-website-db108",
    storageBucket: "personal-website-db108.appspot.com",
    messagingSenderId: "728278529439",
    appId: "1:728278529439:web:f7acee36d79a022b2679aa"
})

export const auth = getAuth();
export default app