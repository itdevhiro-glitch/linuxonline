let zIndex = 20;

export function openWindow(app, context) {
  const layer = document.querySelector("#window-layer");
  const taskbar = document.querySelector("#taskbar");

  const win = document.createElement("article");
  win.className = "window";
  win.style.zIndex = ++zIndex;
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

  win.addEventListener("mousedown", () => {
    win.style.zIndex = ++zIndex;
  });

  win.querySelector('[data-action="close"]').addEventListener("click", () => {
    win.remove();
    task.remove();
  });

  win.querySelector('[data-action="minimize"]').addEventListener("click", () => {
    win.classList.toggle("minimized");
  });

  win.querySelector('[data-action="maximize"]').addEventListener("click", () => {
    win.classList.toggle("maximized");
  });

  layer.appendChild(win);

  const task = document.createElement("button");
  task.textContent = `${app.icon} ${app.name}`;
  task.addEventListener("click", () => win.classList.toggle("minimized"));
  taskbar.appendChild(task);

  makeDraggable(win);
}

function makeDraggable(win) {
  const bar = win.querySelector(".window-titlebar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("mousedown", (event) => {
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
