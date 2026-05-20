import { saveUserPatch } from "../../firebase/firebase.js";
import { applyWallpaper } from "../../core/desktop.js";

function convertUhdPaperUrl(url) {
  if (!url.includes("uhdpaper.com")) return url;
  // Situs seperti uhdpaper sering berupa halaman HTML, bukan direct image.
  // App tetap menerima URL halaman, tapi browser tidak bisa jadikan background kalau bukan file gambar.
  return url;
}

export function WallpaperApp(container, context) {
  const current = context.data.settings?.wallpaper || "";
  container.innerHTML = `
    <div class="wallpaper-app">
      <h2>Wallpaper Studio</h2>
      <p>Masukkan link gambar langsung. Setiap user punya wallpaper berbeda di Firebase.</p>
      <form id="wallpaperForm">
        <input id="wallpaperInput" value="${escapeHtml(current)}" placeholder="https://domain.com/image.jpg / .png / .webp" />
        <button>Apply Wallpaper</button>
      </form>

      <div class="wallpaper-note">
        <b>Catatan:</b> link seperti uhdpaper page biasanya bukan direct image. Kalau tidak tampil, buka link itu, klik kanan gambarnya, copy image address, lalu paste di sini.
      </div>

      <div class="preset-wallpapers">
        <button data-wall="linear-gradient(135deg, #070711, #261447 48%, #0e7490)" data-type="gradient">Garuda Violet</button>
        <button data-wall="linear-gradient(135deg, #020617, #312e81 45%, #701a75)" data-type="gradient">Night Plasma</button>
        <button data-wall="linear-gradient(135deg, #111827, #7f1d1d 50%, #f97316)" data-type="gradient">Dragon Fire</button>
      </div>
    </div>
  `;

  container.querySelector("#wallpaperForm").onsubmit = async (e) => {
    e.preventDefault();
    const url = convertUhdPaperUrl(container.querySelector("#wallpaperInput").value.trim());
    if (!url) return;
    context.data.settings.wallpaper = url;
    context.data.settings.wallpaperType = "image";
    await saveUserPatch(context.user.uid, {
      "settings/wallpaper": url,
      "settings/wallpaperType": "image"
    });
    applyWallpaper(context.data);
  };

  container.querySelectorAll("[data-wall]").forEach(btn => {
    btn.onclick = async () => {
      const wall = btn.dataset.wall;
      const type = btn.dataset.type;
      context.data.settings.wallpaper = wall;
      context.data.settings.wallpaperType = type;
      await saveUserPatch(context.user.uid, {
        "settings/wallpaper": wall,
        "settings/wallpaperType": type
      });
      applyWallpaper(context.data);
    };
  });
}

function escapeHtml(v) {
  return String(v).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
}
