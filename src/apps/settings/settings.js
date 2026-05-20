export function SettingsApp(container, context) {
  const settings = context.data.settings || {};
  container.innerHTML = `
    <div class="settings-app">
      <h2>System Settings</h2>
      <div class="settings-grid">
        <p><b>Theme</b><span>${settings.theme}</span></p>
        <p><b>Accent</b><span>${settings.accent}</span></p>
        <p><b>Wallpaper Type</b><span>${settings.wallpaperType}</span></p>
        <p><b>Role</b><span>${context.isRoot ? "root" : "user"}</span></p>
        <p><b>UID</b><span>${context.user.uid}</span></p>
      </div>
      <p>Buka Wallpaper Studio untuk custom wallpaper per user.</p>
    </div>
  `;
}
