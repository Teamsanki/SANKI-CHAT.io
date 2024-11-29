// Splash Screen Logic
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
  }, 2000); // Show splash screen for 2 seconds
});

// Authentication Logic
const authForm = document.getElementById('auth-form');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const authBtn = document.getElementById('auth-btn');
const userDisplay = document.getElementById('user-email');
const chatContainer = document.getElementById('chat-container');
const authContainer = document.getElementById('auth-container');

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailField.value;
  const password = passwordField.value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showChatUI(userCredential.user);
    })
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            showChatUI(userCredential.user);
          })
          .catch((err) => alert(err.message));
      } else {
        alert(error.message);
      }
    });
});

function showChatUI(user) {
  userDisplay.textContent = user.email;
  authContainer.classList.add('hidden');
  chatContainer.classList.remove('hidden');
}

// Logout
document.getElementById('logout').addEventListener('click', () => {
  auth.signOut().then(() => {
    chatContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
  });
});

// WebRTC Logic
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let peerConnection;

document.getElementById('start-call').addEventListener('click', () => {
  peerConnection = new RTCPeerConnection(configuration);
  const remoteAudio = document.getElementById('remote-audio');

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      return peerConnection.createOffer();
    })
    .then((offer) => {
      peerConnection.setLocalDescription(offer);
      return database.ref('calls/offer').set(offer);
    })
    .catch((error) => console.error(error));

  peerConnection.ontrack = (event) => {
    remoteAudio.srcObject = new MediaStream(event.streams[0].getTracks());
  };

  database.ref('calls/answer').on('value', (snapshot) => {
    if (snapshot.val()) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
    }
  });

  database.ref('calls/candidates').on('child_added', (snapshot) => {
    const candidate = new RTCIceCandidate(snapshot.val());
    peerConnection.addIceCandidate(candidate);
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      database.ref('calls/candidates').push(event.candidate);
    }
  };
});
