// ===== AUTHENTICATION LOGIC =====
// Handles Sign Up, Sign In, Sign Out, and Auth State

auth.onAuthStateChanged(user => {
  updateNavForUser(user);
});

function updateNavForUser(user) {
  const navBtns = document.querySelector('.nav-btns');
  if (!navBtns) return;

  if (user) {
    navBtns.innerHTML = `
      <a href="profile.html" class="sign-in" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
        <i class="fa-solid fa-user"></i> ${user.displayName || user.email.split('@')[0]}
      </a>
      <button class="sign-up" onclick="logout()">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    `;
  } else {
    navBtns.innerHTML = `
      <a href="login.html?mode=signin" class="sign-in" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
        <i class="fa-solid fa-right-to-bracket"></i> Sign In
      </a>
      <a href="login.html?mode=signup" class="sign-up" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
        <i class="fa-solid fa-user-plus"></i> Sign Up
      </a>
    `;
  }
}

async function signUp(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: displayName });
    await db.collection('users').doc(userCredential.user.uid).set({
      displayName: displayName,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      filesCount: 0
    });
    alert('Account created successfully! Welcome, ' + displayName);
    window.location.href = 'index.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function signIn(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Welcome back!');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function logout() {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function getCurrentUser() {
  return auth.currentUser;
}

function requireLogin() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      alert('Please sign in first!');
      window.location.href = 'login.html?mode=signin';
    }
  });
}
