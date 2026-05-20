import { openWindow } from "./window-manager.js";

let selectedIcon = null;

export function createDesktop(context) {
  const iconArea = document.querySelector("#desktop-icons");
  const launcher = document.querySelector("#launcher");
  const launcherBtn = document.querySelector("#launcherBtn");
  const launcherApps = document.querySelector("#launcherApps");
  const clock = document.querySelector("#clock");

  iconArea.innerHTML = "";
  launcherApps.innerHTML = "";

  const desktopApps = [
    ...context.apps,
    {
      id: "home-shortcut",
      name: "Home",
      icon: "",
      component: context.apps.find(app => app.id === "files").component
    },
    {
      id: "trash-shortcut",
      name: "Trash",
      icon: "",
      component: (container) => {
        container.innerHTML = `
          <div class="empty-trash">
            <h2>Trash</h2>
            <p>Trash is empty.</p>
          </div>
        `;
      }
    }
  ];

  desktopApps.forEach((app, index) => {
    const icon = document.createElement("button");
    icon.className = "desktop-icon";
    icon.style.top = `${28 + (index % 8) * 98}px`;
    icon.style.left = `${28 + Math.floor(index / 8) * 118}px`;
    icon.innerHTML = `<b>${app.icon}</b><span>${app.name}</span>`;
    icon.title = `Open ${app.name}`;

    icon.addEventListener("click", () => {
      if (selectedIcon) selectedIcon.classList.remove("selected");
      selectedIcon = icon;
      icon.classList.add("selected");
    });

    icon.addEventListener("dblclick", () => {
      openWindow(app, context);
    });

    icon.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showContextMenu(event.clientX, event.clientY, [
        ["Open", () => openWindow(app, context)],
        ["Properties", () => openPropertiesWindow(app, context)]
      ]);
    });

    iconArea.appendChild(icon);
  });

  context.apps.forEach(app => {
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

  document.querySelector("#desktop").addEventListener("click", (event) => {
    if (!event.target.closest(".desktop-icon") && selectedIcon) {
      selectedIcon.classList.remove("selected");
      selectedIcon = null;
    }
  });

  document.querySelector("#desktop").addEventListener("contextmenu", (event) => {
    if (event.target.closest(".desktop-icon") || event.target.closest(".window") || event.target.closest("#panel")) return;
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, [
      ["Open Terminal", () => openWindow(context.apps.find(app => app.id === "terminal"), context)],
      ["Open File Manager", () => openWindow(context.apps.find(app => app.id === "files"), context)],
      ["Refresh Desktop", () => createDesktop(context)]
    ]);
  });

  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }, 1000);
}

function showContextMenu(x, y, items) {
  document.querySelectorAll(".context-menu").forEach(menu => menu.remove());

  const menu = document.createElement("div");
  menu.className = "context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  items.forEach(([label, handler]) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", () => {
      menu.remove();
      handler();
    });
    menu.appendChild(button);
  });

  document.body.appendChild(menu);

  setTimeout(() => {
    window.addEventListener("click", () => menu.remove(), { once: true });
  }, 0);
}

function openPropertiesWindow(app, context) {
  openWindow({
    id: `properties-${app.id}`,
    name: `${app.name} Properties`,
    icon: "",
    component: (container) => {
      container.innerHTML = `
        <div class="properties-app">
          <h2>${app.icon} ${app.name}</h2>
          <p><b>Type:</b> Desktop Application</p>
          <p><b>App ID:</b> ${app.id}</p>
          <p><b>Owner:</b> ${context.user.email}</p>
          <p><b>UID:</b> ${context.user.uid}</p>
        </div>
      `;
    }
  }, context);
}
