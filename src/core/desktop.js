import { openWindow } from "./window-manager.js";

export function createDesktop(context) {
  const iconArea = document.querySelector("#desktop-icons");
  const launcher = document.querySelector("#launcher");
  const launcherBtn = document.querySelector("#launcherBtn");
  const launcherApps = document.querySelector("#launcherApps");
  const clock = document.querySelector("#clock");

  iconArea.innerHTML = "";
  launcherApps.innerHTML = "";

  context.apps.forEach(app => {
    const icon = document.createElement("button");
    icon.className = "desktop-icon";
    icon.innerHTML = `<b>${app.icon}</b><span>${app.name}</span>`;
    icon.addEventListener("dblclick", () => openWindow(app, context));
    iconArea.appendChild(icon);

    const item = document.createElement("button");
    item.className = "launcher-item";
    item.innerHTML = `<b>${app.icon}</b><span>${app.name}</span>`;
    item.addEventListener("click", () => {
      launcher.classList.add("hidden");
      openWindow(app, context);
    });
    launcherApps.appendChild(item);
  });

  launcherBtn.onclick = () => launcher.classList.toggle("hidden");

  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }, 1000);
}
