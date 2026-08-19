// ===== FIREBASE CONFIGURATION =====
// YOU MUST REPLACE THESE VALUES WITH YOUR OWN FROM FIREBASE CONSOLE
// Go to: https://console.firebase.google.com/ → Create Project → Settings → SDK

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export services for other files
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
