export function FilesApp(container, context) {
  const home = context.data.filesystem?.home || {};
  container.innerHTML = `
    <div class="files-app">
      <aside>
        <button> Home</button>
        <button> Documents</button>
        <button> Downloads</button>
        <button> Pictures</button>
      </aside>
      <section>
        <h3>/home/${context.user.email}</h3>
        <div class="file-grid">
          ${Object.entries(home).map(([key, value]) => `
            <div class="file-item">
              <b>${typeof value === "object" && !value.type ? "" : ""}</b>
              <span>${value?.name || key}</span>
              <small>${typeof value === "object" && !value.type ? "folder" : value?.type || "file"}</small>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}
