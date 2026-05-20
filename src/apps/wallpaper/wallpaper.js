import { saveUserPatch, saveFile } from "../../firebase/firebase.js";
import { applyWallpaper } from "../../core/desktop.js";

export function WallpaperApp(container, context) {
  const current = context.data.settings?.wallpaper || "";

  container.innerHTML = `
    <div class="wallpaper-app">
      <h2>Wallpaper Studio</h2>
      <p>Paste direct image URL atau embed HTML seperti <code>&lt;a&gt;&lt;img src="..."&gt;&lt;/a&gt;</code>. Wallpaper tersimpan per user.</p>

      <form id="wallpaperForm">
        <textarea id="wallpaperInput" placeholder="Paste direct image URL atau embed HTML dari wallpaper website...">${escapeHtml(current)}</textarea>
        <div class="wallpaper-actions">
          <button type="submit">Apply Wallpaper</button>
          <button type="button" id="saveWallpaperText">Save Embed to Pictures</button>
        </div>
      </form>

      <section class="wallpaper-preview">
        <h3>Preview URL</h3>
        <code id="wallpaperDetected">No image detected yet.</code>
        <div id="wallpaperPreviewBox"></div>
      </section>

      <div class="wallpaper-note">
        <b>Support:</b>
        <p>1. Direct image: <code>https://site.com/image.jpg</code></p>
        <p>2. Embed HTML: <code>&lt;img src='https://...' /&gt;</code></p>
        <p>3. Kalau paste halaman uhdpaper biasa, browser tidak selalu bisa ambil gambar otomatis karena CORS. Yang paling aman pakai embed HTML yang ada tag img src.</p>
      </div>

      <div class="preset-wallpapers">
        <button type="button" data-wall="linear-gradient(135deg, #070711, #261447 48%, #0e7490)" data-type="gradient">Garuda Violet</button>
        <button type="button" data-wall="linear-gradient(135deg, #020617, #312e81 45%, #701a75)" data-type="gradient">Night Plasma</button>
        <button type="button" data-wall="linear-gradient(135deg, #111827, #7f1d1d 50%, #f97316)" data-type="gradient">Dragon Fire</button>
      </div>
    </div>
  `;

  const input = container.querySelector("#wallpaperInput");
  const detected = container.querySelector("#wallpaperDetected");
  const preview = container.querySelector("#wallpaperPreviewBox");

  function updatePreview() {
    const parsed = extractImageUrl(input.value.trim());
    detected.textContent = parsed || "No image detected.";
    preview.style.backgroundImage = parsed ? `url("${parsed}")` : "none";
  }

  input.addEventListener("input", updatePreview);
  updatePreview();

  container.querySelector("#wallpaperForm").onsubmit = async (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    const imageUrl = extractImageUrl(raw);

    if (!imageUrl) {
      detected.textContent = "Gagal: tidak nemu URL gambar. Paste embed yang punya <img src='...'> atau direct image URL.";
      return;
    }

    context.data.settings = context.data.settings || {};
    context.data.settings.wallpaper = imageUrl;
    context.data.settings.wallpaperType = "image";

    await saveUserPatch(context.user.uid, {
      "settings/wallpaper": imageUrl,
      "settings/wallpaperType": "image",
      "settings/wallpaperEmbedRaw": raw
    });

    applyWallpaper(context.data);
    detected.textContent = `Applied: ${imageUrl}`;
  };

  container.querySelector("#saveWallpaperText").onclick = async () => {
    const raw = input.value.trim();
    if (!raw) return;
    await saveFile(context.user.uid, "Pictures", `wallpaper_embed_${Date.now()}.html`, raw, "html");
    detected.textContent = "Embed saved to Pictures folder.";
  };

  container.querySelectorAll("[data-wall]").forEach(btn => {
    btn.onclick = async () => {
      const wall = btn.dataset.wall;
      const type = btn.dataset.type;

      context.data.settings = context.data.settings || {};
      context.data.settings.wallpaper = wall;
      context.data.settings.wallpaperType = type;

      await saveUserPatch(context.user.uid, {
        "settings/wallpaper": wall,
        "settings/wallpaperType": type
      });

      applyWallpaper(context.data);
      input.value = wall;
      updatePreview();
    };
  });
}

export function extractImageUrl(raw = "") {
  if (!raw) return "";

  const text = raw.trim();

  // Decode common HTML entities from copied embed snippets.
  const normalized = text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

  // Prefer img src from embed HTML.
  const imgSrcMatch =
    normalized.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i) ||
    normalized.match(/src\s*=\s*["']([^"']+)["']/i);

  if (imgSrcMatch?.[1]) return imgSrcMatch[1].trim();

  // Markdown image support: ![](url)
  const markdownImg = normalized.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownImg?.[1]) return markdownImg[1].trim();

  // Direct image URL.
  const direct = normalized.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/i);
  if (direct?.[0]) return direct[0].trim();

  // Blogger/Google image proxy often has no extension but works as image.
  const googleProxy = normalized.match(/https?:\/\/lh3\.googleusercontent\.com\/[^\s"'<>]+/i);
  if (googleProxy?.[0]) return googleProxy[0].trim();

  return "";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
