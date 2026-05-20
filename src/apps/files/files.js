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
          ${Object.keys(fs).map(name => `
            <div class="file-item">
              <b>${typeof fs[name] === "object" ? "" : ""}</b>
              <span>${name}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}
