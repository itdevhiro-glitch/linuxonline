import { ROOT_UID } from "./firebase/config.js";
import { login, register, logout, watchAuth, getUserDesktop, createDefaultDesktop } from "./firebase/firebase.js";
import { boot } from "./core/boot.js";
import { createDesktop } from "./core/desktop.js";
import { apps } from "./core/registry.js";

const bootScreen = document.querySelector("#boot-screen");
const authScreen = document.querySelector("#auth-screen");
const desktopScreen = document.querySelector("#desktop");
const authForm = document.querySelector("#authForm");
const registerBtn = document.querySelector("#registerBtn");
const authMessage = document.querySelector("#authMessage");
const logoutBtn = document.querySelector("#logoutBtn");
const roleBadge = document.querySelector("#roleBadge");

let currentUser = null;

boot([
  "Loading linux-zen simulated kernel...",
  "Starting systemd units...",
  "Mounting /home per Firebase UID...",
  "Starting KWin web compositor...",
  "Ready."
], () => {
  bootScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authMessage.textContent = "Logging in...";
  try {
    await login(email.value, password.value);
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

registerBtn.addEventListener("click", async () => {
  authMessage.textContent = "Creating account...";
  try {
    await register(email.value, password.value);
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", () => logout());

watchAuth(async (user) => {
  currentUser = user;

  if (!user) {
    desktopScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");
    return;
  }

  authScreen.classList.add("hidden");
  desktopScreen.classList.remove("hidden");

  let data = await getUserDesktop(user.uid);
  if (!data) data = await createDefaultDesktop(user.uid, user.email);

  const isRoot = user.uid === ROOT_UID;
  roleBadge.textContent = isRoot ? "root" : "user";

  createDesktop({
    user,
    data,
    isRoot,
    apps
  });
});
