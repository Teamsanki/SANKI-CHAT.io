// Splash Screen Logic
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
  }, 2000); // Show splash screen for 2 seconds
});

// Toggle Between Login and Registration
const toggleAuthBtn = document.getElementById('toggle-auth');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

toggleAuthBtn.addEventListener('click', () => {
  loginForm.classList.toggle('hidden');
  registerForm.classList.toggle('hidden');
  toggleAuthBtn.textContent =
    loginForm.classList.contains('hidden') ? 'Switch to Login' : 'Switch to Register';
});

// Registration Logic
const register = document.getElementById('register');
register.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert('Registration successful!');
      showChatUI(userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Login Logic
const login = document.getElementById('login');
login.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showChatUI(userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Show Chat UI
function showChatUI(user) {
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('chat-container').classList.remove('hidden');
}

// Logout Logic
document.getElementById('logout').addEventListener('click', () => {
  auth.signOut().then(() => {
    document.getElementById('chat-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
  });
});

// WebRTC Call Logic (same as before)
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
  });
});
