import { ROOT_UID } from "./firebase/config.js";
import {
  login,
  register,
  logout,
  watchAuth,
  getUserDesktop,
  createDefaultDesktop,
  updatePresence
} from "./firebase/firebase.js";
import { boot } from "./core/boot.js";
import { createDesktop } from "./core/desktop.js";
import { openWindow } from "./core/window-manager.js";
import { apps } from "./core/registry.js";

const bootScreen = document.querySelector("#boot-screen");
const authScreen = document.querySelector("#auth-screen");
const desktopScreen = document.querySelector("#desktop");
const authForm = document.querySelector("#authForm");
const registerBtn = document.querySelector("#registerBtn");
const authMessage = document.querySelector("#authMessage");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");

function setAuthLoading(isLoading, message = "Ready.") {
  if (loginBtn) {
    loginBtn.disabled = isLoading;
    loginBtn.textContent = isLoading ? "Processing..." : "Login";
  }
  if (registerBtn) registerBtn.disabled = isLoading;
  if (authMessage) authMessage.textContent = message;
}

function showDesktop() {
  authScreen.classList.add("hidden");
  desktopScreen.classList.remove("hidden");
  setAuthLoading(false, "Ready.");
}

boot(() => {
  bootScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAuthLoading(true, "Logging in...");
  try {
    await login(email.value.trim(), password.value);
    // onAuthStateChanged handles desktop render
  } catch (error) {
    console.error(error);
    setAuthLoading(false, readableAuthError(error));
  }
});

registerBtn.addEventListener("click", async () => {
  setAuthLoading(true, "Creating account...");
  try {
    await register(email.value.trim(), password.value);
    // onAuthStateChanged handles desktop render
  } catch (error) {
    console.error(error);
    setAuthLoading(false, readableAuthError(error));
  }
});

logoutBtn.addEventListener("click", () => logout());

watchAuth(async (user) => {
  if (!user) {
    desktopScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");
    setAuthLoading(false, "Ready.");
    return;
  }

  setAuthLoading(true, "Loading desktop...");

  let data = null;

  try {
    data = await getUserDesktop(user.uid);
  } catch (error) {
    console.warn("getUserDesktop failed:", error);
  }

  if (!data) {
    try {
      data = await createDefaultDesktop(user.uid, user.email);
    } catch (error) {
      console.warn("createDefaultDesktop failed, using offline fallback:", error);
      data = createOfflineFallback(user);
    }
  }

  try {
    await updatePresence(user.uid, user.email);
  } catch (error) {
    // Jangan bikin login stuck cuma gara-gara /publicUsers rules belum cocok.
    console.warn("Presence update skipped:", error);
  }

  const context = {
    user,
    data,
    isRoot: user.uid === ROOT_UID,
    apps
  };

  showDesktop();
  createDesktop(context);

  setTimeout(() => {
    const kernelApp = apps.find(app => app.id === "kernel") || apps[0];
    if (kernelApp) openWindow(kernelApp, context);
  }, 250);
});

function createOfflineFallback(user) {
  const ip = ipFromUid(user.uid);
  return {
    profile: {
      uid: user.uid,
      email: user.email,
      displayName: user.email?.split("@")[0] || "user",
      distro: "Garuda Web Linux",
      kernel: "linux-zen-web fallback",
      shell: "fish",
      hostname: `garuda-${user.uid.slice(0, 6).toLowerCase()}`,
      ipAddress: ip
    },
    settings: {
      theme: "garuda-dr460nized",
      wallpaper: "linear-gradient(135deg, #070711, #261447 48%, #0e7490)",
      wallpaperType: "gradient",
      accent: "violet"
    },
    filesystem: {
      home: {
        Desktop: {},
        Documents: {},
        Downloads: {},
        Pictures: {},
        Music: {},
        Videos: {}
      }
    },
    packages: {},
    services: {
      NetworkManager_service: "active",
      firebase_sync_service: "degraded",
      desktop_service: "active"
    }
  };
}

function ipFromUid(uid = "") {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  const a = 10 + (hash % 220);
  const b = 20 + ((hash >>> 8) % 200);
  return `192.168.${a}.${b}`;
}

function readableAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential")) return "Email/password salah atau user belum terdaftar.";
  if (code.includes("user-not-found")) return "User belum terdaftar. Klik Register dulu.";
  if (code.includes("wrong-password")) return "Password salah.";
  if (code.includes("email-already-in-use")) return "Email sudah terdaftar. Klik Login.";
  if (code.includes("weak-password")) return "Password minimal 6 karakter.";
  if (code.includes("unauthorized-domain")) return "Domain belum ditambahkan di Firebase Authorized domains.";
  if (code.includes("network-request-failed")) return "Koneksi internet bermasalah.";
  return error?.message || "Auth error.";
}
