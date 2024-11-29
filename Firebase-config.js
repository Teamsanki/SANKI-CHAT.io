// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyAemwBwNix4TbWHA7vrh5ubQaRqEY8VWKk",
  authDomain: "social-bite-skofficial.firebaseapp.com",
  projectId: "social-bite-skofficial",
  storageBucket: "social-bite-skofficial.appspot.com",
  messagingSenderId: "239722707022",
  appId: "1:239722707022:web:57d9b173f2163e85be2b1f",
  databaseURL: "https://social-bite-skofficial-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
