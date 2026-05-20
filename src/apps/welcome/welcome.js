export function WelcomeApp(container, context) {
  container.innerHTML = `
    <div class="welcome-app">
      <div class="welcome-banner">
        <span></span>
        <div>
          <h2>Welcome to Garuda Web OS</h2>
          <p>Ini desktop simulasi Linux yang interaktif. Klik icon sekali untuk select, double click untuk membuka aplikasi.</p>
        </div>
      </div>

      <div class="welcome-grid">
        <div>
          <h3>Desktop</h3>
          <p>Icon aplikasi ada di layar seperti Linux desktop asli.</p>
        </div>
        <div>
          <h3>Launcher</h3>
          <p>Klik tombol Garuda di panel bawah untuk buka daftar app.</p>
        </div>
        <div>
          <h3>Window Manager</h3>
          <p>Window bisa digeser, minimize, maximize, dan close.</p>
        </div>
        <div>
          <h3>Firebase Sync</h3>
          <p>Data desktop dan game disimpan per UID login.</p>
        </div>
      </div>

      <p class="welcome-user">Logged in as <b>${context.user.email}</b> • role: <b>${context.isRoot ? "root" : "user"}</b></p>
    </div>
  `;
}
