// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAemwBwNix4TbWHA7vrh5ubQaRqEY8VWKk",
  authDomain: "social-bite-skofficial.firebaseapp.com",
  databaseURL: "https://social-bite-skofficial-default-rtdb.firebaseio.com",
  projectId: "social-bite-skofficial",
  storageBucket: "social-bite-skofficial.appspot.com",
  messagingSenderId: "239722707022",
  appId: "1:239722707022:web:57d9b173f2163e85be2b1f"
};
firebase.initializeApp(firebaseConfig);

let localStream;
let peerConnection;
let isCaller = false;
let remoteStream;

const database = firebase.database();
const signalingRef = database.ref('signaling');

// WebRTC configuration for ICE servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Get local audio stream
async function getLocalMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    document.getElementById('localAudio').srcObject = stream;
    localStream = stream;
  } catch (err) {
    console.error('Error accessing media devices.', err);
  }
}

// Create a new Peer Connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  // When remote stream is added, set it to the remote audio element
  peerConnection.ontrack = function(event) {
    remoteStream = event.streams[0];
    document.getElementById('remoteAudio').srcObject = remoteStream;
  };

  // Add local stream to the connection
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // ICE Candidate handling
  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      sendSignalingMessage({
        type: 'candidate',
        candidate: event.candidate
      });
    }
  };
}

// Send signaling messages to the Firebase database
function sendSignalingMessage(message) {
  signalingRef.push(message);
}

// Handle incoming signaling messages (offer, answer, candidate)
signalingRef.on('child_added', function(snapshot) {
  const message = snapshot.val();
  if (message.type === 'offer') {
    handleIncomingCall(message.offer);
  } else if (message.type === 'answer') {
    peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
  } else if (message.type === 'candidate') {
    peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
  }
});

// Initiate a call
function initiateCall() {
  isCaller = true;
  createPeerConnection();
  
  // Create an offer and set the local description
  peerConnection.createOffer()
    .then(offer => {
      return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
      sendSignalingMessage({ type: 'offer', offer: peerConnection.localDescription });
    })
    .catch(err => console.error('Error creating offer', err));
}

// Handle incoming call
function handleIncomingCall(offer) {
  createPeerConnection();

  // Set the received offer as the remote description
  peerConnection.setRemoteDescription(offer)
    .then(() => {
      return peerConnection.createAnswer();
    })
    .then(answer => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      sendSignalingMessage({ type: 'answer', answer: peerConnection.localDescription });
    })
    .catch(err => console.error('Error handling incoming call', err));
}

// Call button event
document.getElementById('call-button').onclick = function() {
  initiateCall();
  document.getElementById('call-button').style.display = 'none';
  document.getElementById('end-call-button').style.display = 'block';
};

// End call button event
document.getElementById('end-call-button').onclick = function() {
  peerConnection.close();
  document.getElementById('call-button').style.display = 'block';
  document.getElementById('end-call-button').style.display = 'none';
};

// Send chat messages
document.getElementById('send-message').onclick = function() {
  const message = document.getElementById('chat-message').value;
  if (message.trim()) {
    const msgElement = document.createElement('div');
    msgElement.className = 'message user';
    msgElement.innerText = message;
    document.getElementById('chat-window').appendChild(msgElement);
    document.getElementById('chat-message').value = ''; // Clear input field
  }
};

// Get local media when page loads
getLocalMedia();
