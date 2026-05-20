export function WelcomeApp(container, context) {
  const services = context.data.services || {};
  container.innerHTML = `
    <div class="kernel-center">
      <section class="kernel-hero">
        <div class="kernel-orb"></div>
        <div>
          <span class="chip">linux-zen-web realtime</span>
          <h2>Garuda Web Linux Pro</h2>
          <p>Desktop simulator dengan Firebase filesystem, realtime chat, internal mail, custom wallpaper, dan MMORPG online.</p>
        </div>
      </section>

      <section class="dashboard-grid">
        <article>
          <h3>Kernel</h3>
          <b>${context.data.profile?.kernel || "linux-zen-web"}</b>
          <p>Arch-based simulated kernel with Firebase runtime.</p>
        </article>
        <article>
          <h3>User</h3>
          <b>${context.user.email}</b>
          <p>${context.isRoot ? "Root administrator" : "Standard user"} • UID synced desktop.</p>
        </article>
        <article>
          <h3>Realtime Services</h3>
          ${Object.entries(services).map(([k,v]) => `<p><span class="service-dot ${v}"></span>${k.replaceAll("_", ".")} — ${v}</p>`).join("")}
        </article>
        <article>
          <h3>Tips</h3>
          <p>Double click icon buat buka aplikasi. Wallpaper, game, chat, dan mail beda per akun.</p>
        </article>
      </section>
    </div>
  `;
}
