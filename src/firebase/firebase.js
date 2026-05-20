import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { firebaseConfig } from "./config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

export async function getUserDesktop(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function createDefaultDesktop(uid, email) {
  const now = new Date().toISOString();
  const payload = {
    profile: {
      uid,
      email,
      createdAt: now,
      distro: "Garuda Linux",
      kernel: "linux-zen simulated",
      shell: "fish"
    },
    settings: {
      theme: "garuda-dr460nized",
      wallpaper: "default",
      panelPosition: "bottom",
      accent: "violet"
    },
    filesystem: {
      home: {
        Desktop: {},
        Documents: {
          "welcome.txt": "Selamat datang di Garuda Web OS."
        },
        Downloads: {},
        Pictures: {},
        Music: {},
        Videos: {}
      },
      etc: {
        "os-release": "NAME=Garuda Web OS\nID=garuda-web\nID_LIKE=arch"
      }
    },
    packages: {
      firefox: false,
      code: false,
      neofetch: true,
      dolphin: true,
      konsole: true,
      htop: true
    },
    processes: {},
    services: {
      "NetworkManager.service": "active",
      "sddm.service": "active",
      "bluetooth.service": "inactive",
      "firebase-sync.service": "active"
    }
  };

  await set(ref(db, `users/${uid}`), payload);
  return payload;
}

export function saveUserPatch(uid, patch) {
  return update(ref(db, `users/${uid}`), patch);
}

export function watchUserData(uid, callback) {
  return onValue(ref(db, `users/${uid}`), snapshot => callback(snapshot.val()));
}


export async function getGameData(uid, gameId = "mmorpgTurnbase") {
  const snapshot = await get(ref(db, `users/${uid}/games/${gameId}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function saveGameData(uid, data, gameId = "mmorpgTurnbase") {
  return update(ref(db, `users/${uid}/games/${gameId}`), data);
}

export function watchGameData(uid, callback, gameId = "mmorpgTurnbase") {
  return onValue(ref(db, `users/${uid}/games/${gameId}`), snapshot => callback(snapshot.val()));
}
