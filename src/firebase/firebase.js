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
    .slice(0, 100) || "untitled";
}

export function ipFromUid(uid = "") {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  const a = 10 + (hash % 220);
  const b = 20 + ((hash >>> 8) % 200);
  return `192.168.${a}.${b}`;
}

export async function getUserDesktop(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function createDefaultDesktop(uid, email) {
  const now = new Date().toISOString();
  const ipAddress = typeof ipFromUid === "function" ? ipFromUid(uid) : `192.168.1.${Math.floor(Math.random() * 200) + 20}`;

  const payload = {
    profile: {
      uid,
      email,
      displayName: email.split("@")[0],
      createdAt: now,
      distro: "Garuda Web Linux",
      kernel: "linux-zen-web 7.0.7-sim",
      shell: "fish",
      role: "user",
      ipAddress,
      hostname: `garuda-${uid.slice(0, 6).toLowerCase()}`
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
            content: "Selamat datang di Garuda Web Linux. Semua file user tersimpan di Firebase per UID.",
            updatedAt: now
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
          content: "NAME=Garuda Web Linux\\nID=garuda-web\\nID_LIKE=arch\\nPRETTY_NAME=Garuda Web Linux Realtime",
          updatedAt: now
        }
      }
    },
    packages: {
      firefox: true,
      dolphin: true,
      konsole: true,
      neofetch: true,
      htop: true,
      nano: true,
      calc: true,
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
      mail_service: "active",
      filesystem_service: "active"
    },
    processes: {}
  };

  await set(ref(db, `users/${uid}`), payload);

  try {
    await update(ref(db, `publicUsers/${uid}`), {
      uid,
      email,
      displayName: email.split("@")[0],
      ipAddress,
      lastSeen: serverTimestamp(),
      online: true
    });
  } catch (error) {
    console.warn("publicUsers write skipped:", error);
  }

  return payload;
}

export function saveUserPatch(uid, patch) {
  return update(ref(db, `users/${uid}`), patch);
}

export function watchUserData(uid, callback) {
  return onValue(ref(db, `users/${uid}`), snapshot => callback(snapshot.val()));
}

export async function saveFile(uid, folder = "Documents", filename = "untitled.txt", content = "", type = "text") {
  const safe = sanitizeFirebaseKey(filename);
  const payload = {
    name: filename,
    type,
    content,
    updatedAt: new Date().toISOString()
  };
  await update(ref(db, `users/${uid}/filesystem/home/${sanitizeFirebaseKey(folder)}/${safe}`), payload);
  return payload;
}

export async function readFile(uid, folder = "Documents", filename = "") {
  const safe = sanitizeFirebaseKey(filename);
  const snapshot = await get(ref(db, `users/${uid}/filesystem/home/${sanitizeFirebaseKey(folder)}/${safe}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function removeFile(uid, folder = "Documents", filename = "") {
  return set(ref(db, `users/${uid}/filesystem/home/${sanitizeFirebaseKey(folder)}/${sanitizeFirebaseKey(filename)}`), null);
}

export async function updatePresence(uid, email) {
  try {
    return await update(ref(db, `publicUsers/${uid}`), {
      uid,
      email,
      displayName: email.split("@")[0],
      lastSeen: serverTimestamp(),
      online: true,
      ipAddress: typeof ipFromUid === "function" ? ipFromUid(uid) : null
    });
  } catch (error) {
    console.warn("updatePresence denied/skipped:", error);
    return null;
  }
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
    ipAddress: ipFromUid(uid),
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
