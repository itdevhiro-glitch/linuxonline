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


## Functional OS Update

Terminal command yang sekarang aktif:

```bash
help
whoami
id
neofetch
ls
ls Documents
pwd
uname -a
pacman -S <pkg>
systemctl status
ip a
clear
sudo <cmd>
touch <file>
cat <file>
write <file> <text>
rm <file>
save-email <subject> <body>
calc <expression>
```

Tambahan aplikasi:

- Text Editor: buka/simpan file text ke Firebase filesystem.
- Calculator: kalkulator GUI.
- Mail: tombol Save to Downloads untuk menyimpan email ke folder Downloads.
- IP user unik dibuat dari UID Firebase dan muncul di `ip a`, neofetch, public users, dan game online.


## Login Stuck Fix

Versi ini tidak akan stuck di Processing hanya karena `/publicUsers` atau presence gagal.
Flow login:
1. Firebase Auth berhasil
2. App coba load `users/{uid}`
3. Kalau belum ada, app create default desktop
4. Kalau presence/publicUsers ditolak rules, desktop tetap dibuka dan warning hanya muncul di console

Tetap paste `database.rules.json` terbaru agar chat/mail/game online bekerja penuh.

## Wallpaper Embed

Wallpaper Studio sekarang support:
- Direct image URL
- Embed HTML berisi `<img src="...">`
- Blogger/Google image proxy seperti `https://lh3.googleusercontent.com/...`

Contoh yang bisa dipaste langsung:

```html
<a href='https://www.uhdpaper.com/2025/10/ruby-mecha-maiden-4k-wallpaper-6095i.html'><img src='https://lh3.googleusercontent.com/blogger_img_proxy/AEn0k_us0no3osWLVS8JHycy2npDAsSOJJ2Q5pHVhUrjbeY74UxM_aTQFk8PODB8uq3uHZis79pYWmlvX9cnPM8r0lpbaXGwL2q-9A7OC61e3bbKqJKkWp0UN84ASoaKuftwHa1KUd3RBuCxdM7qOZhVmjGrrKo=w919-h516-p-k-no-nu'/></a>
```
