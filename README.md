# Garuda Web Linux Pro

GitHub-ready web Linux simulator dengan Firebase Auth + Realtime Database.

## Fix utama

- Login tidak stuck: tombol login/register punya loading state dan error handling.
- Firebase key ilegal seperti `welcome.txt` sudah diubah aman menjadi key `welcome_txt`, nama asli tetap disimpan di field `name`.
- Desktop interaktif: icon, launcher, taskbar, window draggable/minimize/maximize.
- Wallpaper per user via link gambar di Wallpaper Studio.
- MMORPG online realtime: player lain muncul di world map, event world realtime, save per UID.
- Chat realtime global.
- Internal Web Mail berbasis Firebase user list.
- Terminal command lebih aman dengan sanitize key.

## Firebase Setup

1. Authentication → Sign-in method → enable Email/Password.
2. Authentication → Settings → Authorized domains → tambahkan domain GitHub Pages kamu:
   `itdevhiro-glitch.github.io`
3. Realtime Database → Rules → paste `database.rules.json`.
4. Deploy/push ke GitHub.

## Path data

- Desktop user: `users/{uid}`
- Game save: `users/{uid}/games/chronoRift`
- Online players: `world/chronoRift/players`
- Chat: `chatRooms/global/messages`
- Mail: `mail/{uid}/inbox` dan `mail/{uid}/sent`
- Public user list: `publicUsers/{uid}`

## Catatan Wallpaper

URL seperti `https://www.uhdpaper.com/...html` biasanya halaman web, bukan direct image. Kalau tidak tampil sebagai wallpaper, buka halamannya, klik kanan gambar, lalu Copy Image Address dan paste di Wallpaper Studio.
