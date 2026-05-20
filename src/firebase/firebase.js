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
  push,
  onValue,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { firebaseConfig } from "./config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

export function sanitizeFirebaseKey(value = "") {
  return String(value || "untitled")
    .trim()
    .replace(/[.#$/\[\]]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "untitled";
}

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
      displayName: email.split("@")[0],
      createdAt: now,
      distro: "Garuda Web Linux",
      kernel: "linux-zen-web 7.0.7-sim",
      shell: "fish",
      role: "user"
    },
    settings: {
      theme: "garuda-dr460nized",
      wallpaper: "linear-gradient(135deg, #070711, #261447 48%, #0e7490)",
      wallpaperType: "gradient",
      panelPosition: "bottom",
      accent: "violet",
      blur: true
    },
    filesystem: {
      home: {
        Desktop: {},
        Documents: {
          welcome_txt: {
            name: "welcome.txt",
            type: "text",
            content: "Selamat datang di Garuda Web Linux. Semua data kamu tersimpan per UID Firebase."
          }
        },
        Downloads: {},
        Pictures: {},
        Music: {},
        Videos: {}
      },
      etc: {
        os_release: {
          name: "os-release",
          type: "system",
          content: "NAME=Garuda Web Linux\nID=garuda-web\nID_LIKE=arch\nPRETTY_NAME=Garuda Web Linux Realtime"
        }
      }
    },
    packages: {
      firefox: true,
      dolphin: true,
      konsole: true,
      neofetch: true,
      htop: true,
      chronoRift: true,
      chat: true,
      mail: true
    },
    services: {
      NetworkManager_service: "active",
      sddm_service: "active",
      firebase_sync_service: "active",
      realtime_chat_service: "active",
      mmorpg_world_service: "active",
      mail_service: "active"
    },
    processes: {}
  };

  await set(ref(db, `users/${uid}`), payload);
  await update(ref(db, `publicUsers/${uid}`), {
    uid,
    email,
    displayName: email.split("@")[0],
    lastSeen: serverTimestamp()
  });
  return payload;
}

export function saveUserPatch(uid, patch) {
  return update(ref(db, `users/${uid}`), patch);
}

export function watchUserData(uid, callback) {
  return onValue(ref(db, `users/${uid}`), snapshot => callback(snapshot.val()));
}

export function updatePresence(uid, email) {
  return update(ref(db, `publicUsers/${uid}`), {
    uid,
    email,
    displayName: email.split("@")[0],
    lastSeen: serverTimestamp(),
    online: true
  });
}

export function watchPublicUsers(callback) {
  return onValue(ref(db, "publicUsers"), snapshot => callback(snapshot.val() || {}));
}

export async function getGameData(uid, gameId = "chronoRift") {
  const snapshot = await get(ref(db, `users/${uid}/games/${gameId}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export function saveGameData(uid, data, gameId = "chronoRift") {
  return update(ref(db, `users/${uid}/games/${gameId}`), data);
}

export function watchGameData(uid, callback, gameId = "chronoRift") {
  return onValue(ref(db, `users/${uid}/games/${gameId}`), snapshot => callback(snapshot.val()));
}

export function watchWorldPlayers(callback) {
  return onValue(ref(db, "world/chronoRift/players"), snapshot => callback(snapshot.val() || {}));
}

export function updateWorldPlayer(uid, data) {
  return update(ref(db, `world/chronoRift/players/${uid}`), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export function pushWorldEvent(data) {
  return push(ref(db, "world/chronoRift/events"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export function watchWorldEvents(callback) {
  const q = query(ref(db, "world/chronoRift/events"), orderByChild("createdAt"), limitToLast(30));
  return onValue(q, snapshot => callback(snapshot.val() || {}));
}

export function sendChatMessage(roomId, data) {
  return push(ref(db, `chatRooms/${sanitizeFirebaseKey(roomId)}/messages`), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export function watchChatRoom(roomId, callback) {
  const q = query(ref(db, `chatRooms/${sanitizeFirebaseKey(roomId)}/messages`), orderByChild("createdAt"), limitToLast(80));
  return onValue(q, snapshot => callback(snapshot.val() || {}));
}

export function sendMail(fromUid, toUid, data) {
  const id = push(ref(db, "mailIndex")).key;
  const payload = {
    id,
    fromUid,
    toUid,
    fromEmail: data.fromEmail,
    toEmail: data.toEmail,
    subject: data.subject,
    body: data.body,
    read: false,
    createdAt: serverTimestamp()
  };
  return Promise.all([
    set(ref(db, `mail/${toUid}/inbox/${id}`), payload),
    set(ref(db, `mail/${fromUid}/sent/${id}`), { ...payload, read: true })
  ]);
}

export function watchMailbox(uid, box, callback) {
  const q = query(ref(db, `mail/${uid}/${box}`), orderByChild("createdAt"), limitToLast(80));
  return onValue(q, snapshot => callback(snapshot.val() || {}));
}
