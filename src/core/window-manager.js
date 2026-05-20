let zIndex = 50;
let offset = 0;

export function openWindow(app, context) {
  const existing = document.querySelector(`[data-window-id="${app.id}"]`);
  if (existing && !app.multi) {
    existing.classList.remove("minimized");
    existing.style.zIndex = ++zIndex;
    return;
  }

  const layer = document.querySelector("#window-layer");
  const taskbar = document.querySelector("#taskbar");
  const win = document.createElement("article");
  win.className = "window";
  win.dataset.windowId = app.id;
  win.style.left = `${130 + offset}px`;
  win.style.top = `${70 + offset}px`;
  win.style.width = app.width || "820px";
  win.style.minHeight = app.height || "500px";
  win.style.zIndex = ++zIndex;
  offset = (offset + 28) % 170;

  win.innerHTML = `
    <header class="window-titlebar">
      <span>${app.icon} ${app.name}</span>
      <div>
        <button data-action="minimize">—</button>
        <button data-action="maximize">□</button>
        <button data-action="close">×</button>
      </div>
    </header>
    <section class="window-body"></section>
  `;

  const body = win.querySelector(".window-body");
  app.component(body, context);

  win.addEventListener("mousedown", () => win.style.zIndex = ++zIndex);
  win.querySelector('[data-action="close"]').onclick = () => {
    win.remove();
    task.remove();
  };
  win.querySelector('[data-action="minimize"]').onclick = () => win.classList.add("minimized");
  win.querySelector('[data-action="maximize"]').onclick = () => win.classList.toggle("maximized");

  layer.appendChild(win);

  const task = document.createElement("button");
  task.textContent = `${app.icon} ${app.name}`;
  task.onclick = () => {
    win.classList.toggle("minimized");
    win.style.zIndex = ++zIndex;
  };
  taskbar.appendChild(task);

  makeDraggable(win);
}

function makeDraggable(win) {
  const bar = win.querySelector(".window-titlebar");
  let active = false;
  let ox = 0;
  let oy = 0;

  bar.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || win.classList.contains("maximized")) return;
    active = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
  });

  window.addEventListener("mousemove", (e) => {
    if (!active) return;
    win.style.left = `${e.clientX - ox}px`;
    win.style.top = `${e.clientY - oy}px`;
  });

  window.addEventListener("mouseup", () => active = false);
}
