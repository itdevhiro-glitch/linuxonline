export function SettingsApp(container, context) {
  container.innerHTML = `
    <div class="settings-app">
      <h2>System Settings</h2>
      <p><b>Theme:</b> ${context.data.settings?.theme || "garuda-dr460nized"}</p>
      <p><b>Wallpaper:</b> ${context.data.settings?.wallpaper || "default"}</p>
      <p><b>Panel:</b> ${context.data.settings?.panelPosition || "bottom"}</p>
      <p><b>Role:</b> ${context.isRoot ? "root/admin" : "standard user"}</p>
      <p><b>UID:</b> ${context.user.uid}</p>
    </div>
  `;
}
