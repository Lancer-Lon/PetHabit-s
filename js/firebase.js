// ==================== FIREBASE MODULE ====================
const firebaseConfig = {
  apiKey: "AIzaSyBU5jbR8af_Fh-RTj7JsZQ1OSFyhnnx5YM",
  authDomain: "pethabit-77373.firebaseapp.com",
  projectId: "pethabit-77373",
  storageBucket: "pethabit-77373.firebasestorage.app",
  messagingSenderId: "210388751632",
  appId: "1:210388751632:web:dc78a9fd1014e118978195",
  measurementId: "G-1FNG89BDQK"
};

let auth = null;
let db = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  db.enablePersistence().catch(() => {});
  firebaseReady = true;
  console.log('✅ Firebase ready');
} catch (e) {
  console.warn('⚠️ Firebase not configured');
}

// ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ для авторизации
function signInWithGoogle() {
  if (!firebaseReady) { showToast('Firebase не настроен'); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => showToast('Ошибка: ' + e.message));
}

function signInWithApple() {
  if (!firebaseReady) { showToast('Firebase не настроен'); return; }
  const provider = new firebase.auth.OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  auth.signInWithPopup(provider).catch(e => showToast('Ошибка: ' + e.message));
}

// Единый обработчик — только через onAuthStateChanged
async function onUserLoggedIn(user) {
  state.player.userId = user.uid;
  state.player.isAnonymous = false;
  
  const cloudData = await loadFromCloud(user.uid);
  if (cloudData) {
    Object.assign(state, cloudData);
    showToast('☁️ Прогресс загружен!');
  } else {
    await saveToCloud();
    showToast('☁️ Прогресс сохранён!');
  }
  
  updateCloudStatus();
  startApp();
}

async function loadFromCloud(uid) {
  if (!firebaseReady) return null;
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data().state : null;
  } catch (e) {
    return null;
  }
}

async function saveToCloud() {
  if (!firebaseReady || !state.player.userId || state.player.isAnonymous) return;
  try {
    await db.collection('users').doc(state.player.userId).set({
      state: JSON.parse(JSON.stringify(state)),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error('Save failed:', e);
  }
}

console.log('✅ Firebase module loaded');
