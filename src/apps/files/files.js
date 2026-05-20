function getDisplayName(key, value) {
  if (value && typeof value === "object" && typeof value.name === "string") {
    return value.name;
  }

  return key;
}

function isFolder(value) {
  if (!value || typeof value !== "object") return false;
  return !("content" in value) && !("type" in value);
}

export function FilesApp(container, context) {
  const fs = context.data.filesystem?.home || {};

  container.innerHTML = `
    <div class="files-app">
      <aside>
        <button>Home</button>
        <button>Desktop</button>
        <button>Documents</button>
        <button>Downloads</button>
        <button>Pictures</button>
      </aside>

      <section>
        <h3>/home/${context.user.email}</h3>

        <div class="file-grid">
          ${Object.entries(fs).map(([key, value]) => `
            <div class="file-item">
              <b>${isFolder(value) ? "" : ""}</b>
              <span>${getDisplayName(key, value)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}
