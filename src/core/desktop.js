import { openWindow } from "./window-manager.js";

let selected = null;

export function applyWallpaper(data) {
  const wallpaper = document.querySelector("#desktop-wallpaper");
  const settings = data?.settings || {};
  const value = settings.wallpaper || "linear-gradient(135deg, #070711, #261447 48%, #0e7490)";
  if (settings.wallpaperType === "image") {
    wallpaper.style.backgroundImage = `linear-gradient(rgba(5,5,12,.20), rgba(5,5,12,.72)), url("${value}")`;
  } else {
    wallpaper.style.backgroundImage = value;
  }
}

export function createDesktop(context) {
  applyWallpaper(context.data);

  const iconArea = document.querySelector("#desktop-icons");
  const launcher = document.querySelector("#launcher");
  const launcherBtn = document.querySelector("#launcherBtn");
  const launcherApps = document.querySelector("#launcherApps");
  const clock = document.querySelector("#clock");
  const roleBadge = document.querySelector("#roleBadge");
  const widgetRole = document.querySelector("#widgetRole");

  roleBadge.textContent = context.isRoot ? "root" : "user";
  widgetRole.textContent = context.isRoot ? "root/admin" : "standard user";

  iconArea.innerHTML = "";
  launcherApps.innerHTML = "";

  context.apps.forEach((app, index) => {
    const icon = document.createElement("button");
    icon.className = "desktop-icon";
    icon.style.left = `${26 + Math.floor(index / 7) * 120}px`;
    icon.style.top = `${24 + (index % 7) * 98}px`;
    icon.innerHTML = `<b>${app.icon}</b><span>${app.name}</span>`;

    icon.onclick = () => {
      selected?.classList.remove("selected");
      selected = icon;
      selected.classList.add("selected");
    };

    icon.ondblclick = () => openWindow(app, context);

    icon.oncontextmenu = (e) => {
      e.preventDefault();
      openWindow(app, context);
    };

    iconArea.appendChild(icon);

    const item = document.createElement("button");
    item.className = "launcher-item";
    item.innerHTML = `<b>${app.icon}</b><span>${app.name}</span>`;
    item.onclick = () => {
      launcher.classList.add("hidden");
      openWindow(app, context);
    };
    launcherApps.appendChild(item);
  });

  launcherBtn.onclick = () => launcher.classList.toggle("hidden");

  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }, 1000);
}
