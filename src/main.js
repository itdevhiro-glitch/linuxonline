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
  loginBtn.disabled = isLoading;
  registerBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Processing..." : "Login";
  authMessage.textContent = message;
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
  } catch (error) {
    setAuthLoading(false, readableAuthError(error));
  }
});

registerBtn.addEventListener("click", async () => {
  setAuthLoading(true, "Creating account...");
  try {
    await register(email.value.trim(), password.value);
  } catch (error) {
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

  try {
    let data = await getUserDesktop(user.uid);
    if (!data) data = await createDefaultDesktop(user.uid, user.email);
    await updatePresence(user.uid, user.email);

    const context = {
      user,
      data,
      isRoot: user.uid === ROOT_UID,
      apps
    };

    authScreen.classList.add("hidden");
    desktopScreen.classList.remove("hidden");
    setAuthLoading(false, "Ready.");
    createDesktop(context);

    setTimeout(() => {
      openWindow(apps.find(app => app.id === "kernel"), context);
    }, 250);
  } catch (error) {
    console.error(error);
    setAuthLoading(false, error.message);
    authMessage.textContent = error.message;
  }
});

function readableAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential")) return "Email/password salah atau user belum terdaftar.";
  if (code.includes("email-already-in-use")) return "Email sudah terdaftar. Klik Login.";
  if (code.includes("weak-password")) return "Password minimal 6 karakter.";
  if (code.includes("unauthorized-domain")) return "Domain belum ditambahkan di Firebase Authorized domains.";
  return error?.message || "Auth error.";
}
