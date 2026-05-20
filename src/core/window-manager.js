let zIndex = 20;
let windowOffset = 0;

export function openWindow(app, context) {
  const layer = document.querySelector("#window-layer");
  const taskbar = document.querySelector("#taskbar");

  const existing = document.querySelector(`[data-window-id="${app.id}"]`);
  if (existing && !app.id.startsWith("properties-")) {
    existing.classList.remove("minimized");
    existing.style.zIndex = ++zIndex;
    return;
  }

  const win = document.createElement("article");
  win.className = "window";
  win.dataset.windowId = app.id;
  win.style.zIndex = ++zIndex;
  win.style.left = `${150 + windowOffset}px`;
  win.style.top = `${82 + windowOffset}px`;
  windowOffset = (windowOffset + 28) % 160;

  win.innerHTML = `
    <header class="window-titlebar">
      <span>${app.icon} ${app.name}</span>
      <div>
        <button data-action="minimize" title="Minimize">—</button>
        <button data-action="maximize" title="Maximize">□</button>
        <button data-action="close" title="Close">×</button>
      </div>
    </header>
    <section class="window-body"></section>
  `;

  const body = win.querySelector(".window-body");
  app.component(body, context);

  win.addEventListener("mousedown", () => {
    win.style.zIndex = ++zIndex;
  });

  win.querySelector('[data-action="close"]').addEventListener("click", () => {
    win.remove();
    task.remove();
  });

  win.querySelector('[data-action="minimize"]').addEventListener("click", () => {
    win.classList.add("minimized");
  });

  win.querySelector('[data-action="maximize"]').addEventListener("click", () => {
    win.classList.toggle("maximized");
  });

  layer.appendChild(win);

  const task = document.createElement("button");
  task.textContent = `${app.icon} ${app.name}`;
  task.addEventListener("click", () => {
    win.classList.toggle("minimized");
    win.style.zIndex = ++zIndex;
  });
  taskbar.appendChild(task);

  makeDraggable(win);
}

function makeDraggable(win) {
  const bar = win.querySelector(".window-titlebar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) return;
    if (win.classList.contains("maximized")) return;
    dragging = true;
    offsetX = event.clientX - win.offsetLeft;
    offsetY = event.clientY - win.offsetTop;
  });

  window.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    win.style.left = `${event.clientX - offsetX}px`;
    win.style.top = `${event.clientY - offsetY}px`;
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });
}
