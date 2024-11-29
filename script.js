// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAemwBwNix4TbWHA7vrh5ubQaRqEY8VWKk",
  authDomain: "social-bite-skofficial.firebaseapp.com",
  databaseURL: "https://social-bite-skofficial-default-rtdb.firebaseio.com",
  projectId: "social-bite-skofficial",
  storageBucket: "social-bite-skofficial.appspot.com",
  messagingSenderId: "239722707022",
  appId: "1:239722707022:web:57d9b173f2163e85be2b1f"
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
const chatWindow = document.getElementById('chat-window');
const chatMessageInput = document.getElementById('chat-message');
const sendMessageButton = document.getElementById('send-message');
const exitChatButton = document.getElementById('exit-chat');
const noUserAlert = document.getElementById('no-user-alert');
const userNameDisplay = document.getElementById('user-name');

let chatPartnerId = null;
let currentUserId = null;

// User authentication state change
auth.onAuthStateChanged(user => {
  console.log('Auth state changed:', user); // Debugging log
  if (user) {
    currentUserId = user.uid;
    homePage.style.display = 'block';
    splashScreen.style.display = 'none';
    userNameDisplay.textContent = user.displayName || 'User';
  } else {
    splashScreen.style.display = 'block';
    loginPage.style.display = 'none';
  }
});

// Register Page
document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const name = document.getElementById('reg-name').value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: name });
    database.ref('users/' + userCredential.user.uid).set({ status: 'looking' });
    window.location.reload();
  } catch (error) {
    alert(error.message);
  }
};

// Login Page
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert(error.message);
  }
};

// Switch between login and register page
document.getElementById('register-link').onclick = () => {
  loginPage.style.display = 'none';
  registerPage.style.display = 'block';
};

document.getElementById('login-link').onclick = () => {
  registerPage.style.display = 'none';
  loginPage.style.display = 'block';
};

// Start Chat Button
document.getElementById('start-chat').onclick = () => {
  joinRandomChat();
};

// Function to join a random chat
function joinRandomChat() {
  const usersRef = database.ref('users');
  const currentUserRef = database.ref('users/' + currentUserId);

  currentUserRef.update({ status: 'looking' });

  usersRef.orderByChild('status').equalTo('looking').once('value', snapshot => {
    const users = snapshot.val();
    if (users) {
      const availableUsers = Object.keys(users).filter(uid => uid !== currentUserId);
      if (availableUsers.length > 0) {
        const randomUserId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        chatPartnerId = randomUserId;

        currentUserRef.update({ status: 'chatting', partnerId: randomUserId });
        database.ref('users/' + randomUserId).update({ status: 'chatting', partnerId: currentUserId });

        initializeChatInterface(randomUserId);
      } else {
        noUserAlert.style.display = 'block';
        chatMessageInput.disabled = true;
        sendMessageButton.disabled = true;
      }
    }
  });
}

// Initialize chat window
function initializeChatInterface(randomUserId) {
  chatRoom.style.display = 'block';
  chatMessageInput.disabled = false;
  sendMessageButton.disabled = false;

  const chatRef = database.ref('chats/' + currentUserId + '/' + randomUserId);
  chatRef.on('child_added', snapshot => {
    const messageData = snapshot.val();
    const messageDiv = document.createElement('div');
    messageDiv.textContent = messageData.message;
    messageDiv.className = messageData.sender === currentUserId ? 'message user' : 'message other';
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });

  sendMessageButton.onclick = () => {
    const message = chatMessageInput.value;
    if (message.trim()) {
      const chatRef = database.ref('chats/' + currentUserId + '/' + randomUserId);
      chatRef.push({ sender: currentUserId, message });

      const partnerChatRef = database.ref('chats/' + randomUserId + '/' + currentUserId);
      partnerChatRef.push({ sender: currentUserId, message });

      chatMessageInput.value = '';
    }
  };
}

// Exit chat
exitChatButton.onclick = () => {
  if (chatPartnerId) {
    database.ref('users/' + currentUserId).update({ status: 'looking', partnerId: null });
    database.ref('users/' + chatPartnerId).update({ status: 'looking', partnerId: null });
  }

  chatRoom.style.display = 'none';
  noUserAlert.style.display = 'none';
  chatPartnerId = null;
};
