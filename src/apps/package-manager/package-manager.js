import { saveUserPatch } from "../../firebase/firebase.js";

const packages = ["firefox", "code", "docker", "neofetch", "htop", "wireshark", "obsidian", "steam"];

export function PackageManagerApp(container, context) {
  render(container, context);
}

function render(container, context) {
  container.innerHTML = `
    <div class="packages-app">
      <h2>Pacman Package Manager</h2>
      <p>Simulasi install package. Data tersimpan per UID di Firebase.</p>
      <div class="package-list">
        ${packages.map(pkg => `
          <div class="package-row">
            <span>󰏖 ${pkg}</span>
            <button data-pkg="${pkg}">
              ${context.data.packages?.[pkg] ? "Installed" : "Install"}
            </button>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  container.querySelectorAll("[data-pkg]").forEach(button => {
    button.addEventListener("click", async () => {
      await saveUserPatch(context.user.uid, {
        [`packages/${button.dataset.pkg}`]: true
      });
      button.textContent = "Installed";
    });
  });
}
