// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAemwBwNix4TbWHA7vrh5ubQaRqEY8VWKk",
  authDomain: "https://social-bite-skofficial.firebaseapp.com/",
  databaseURL: "https://social-bite-skofficial-default-rtdb.firebaseio.com/",
  projectId: "Ysocial-bite-skofficial",
  storageBucket: "gs://social-bite-skofficial.appspot.com",
  messagingSenderId: "239722707022",
  appId: "1:239722707022:web:57d9b173f2163e85be2b1f",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Page Elements
const splashScreen = document.getElementById('splash-screen');
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const homePage = document.getElementById('home-page');
const chatRoom = document.getElementById('chat-room');

// Splash Screen Timer
setTimeout(() => {
  splashScreen.style.display = 'none';
  loginPage.style.display = 'block';
}, 3000);

// Switch Between Login and Register
document.getElementById('show-register').onclick = () => {
  loginPage.style.display = 'none';
  registerPage.style.display = 'block';
};

document.getElementById('show-login').onclick = () => {
  registerPage.style.display = 'none';
  loginPage.style.display = 'block';
};

// Register User
document.getElementById('register-form').onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
      alert('Registration successful!');
      registerPage.style.display = 'none';
      loginPage.style.display = 'block';
    })
    .catch(err => alert(err.message));
};

// Login User
document.getElementById('login-form').onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      loginPage.style.display = 'none';
      homePage.style.display = 'block';
      document.getElementById('user-name').textContent = email.split('@')[0];
    })
    .catch(err => alert(err.message));
};

// Join Random Chat
document.getElementById('join-random').onclick = () => {
  homePage.style.display = 'none';
  chatRoom.style.display = 'block';

  const chatRef = database.ref('chats');
  document.getElementById('send-message').onclick = () => {
    const message = document.getElementById('chat-message').value;
    chatRef.push({ message });
    document.getElementById('chat-message').value = '';
  };

  chatRef.on('child_added', snapshot => {
    const chatWindow = document.getElementById('chat-window');
    const message = snapshot.val().message;
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    chatWindow.appendChild(msgDiv);
  });
};

// Exit Chat
document.getElementById('exit-chat').onclick = () => {
  chatRoom.style.display = 'none';
  homePage.style.display = 'block';
};
