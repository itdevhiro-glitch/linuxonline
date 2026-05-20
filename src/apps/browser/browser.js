export function BrowserApp(container) {
  container.innerHTML = `
    <div class="browser-app">
      <h2>FireDragon Browser</h2>
      <p>Mini browser placeholder. Banyak situs tidak bisa dibuka di iframe karena security headers.</p>
      <form id="browserForm">
        <input id="browserUrl" placeholder="https://example.com" />
        <button>Open</button>
      </form>
      <iframe id="browserFrame" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
    </div>
  `;
  container.querySelector("#browserForm").onsubmit = e => {
    e.preventDefault();
    let url = container.querySelector("#browserUrl").value.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    container.querySelector("#browserFrame").src = url;
  };
}
