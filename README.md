# Garuda Web OS Simulator

Simulasi OS Linux berbasis web dengan vibe Garuda Linux / Arch. Project ini dibuat untuk dipost ke GitHub dan bisa dijalankan sebagai static web.

## Fitur

- Login dan register pakai Firebase Email/Password Auth
- Desktop berbeda untuk setiap UID user
- Root/admin UID: `yQSxfhW6uTaXuIgEpNrrz9QtXi62`
- Simulasi terminal Linux
- Simulasi command:
  - `help`
  - `whoami`
  - `id`
  - `neofetch`
  - `ls`
  - `pwd`
  - `uname -a`
  - `ip a`
  - `systemctl status`
  - `pacman -S nama_package`
  - `sudo command`
  - `touch nama_file`
- File manager sederhana
- Package manager sederhana
- System monitor
- Settings app
- Window manager draggable/minimize/maximize
- Firebase Realtime Database per-user

## Struktur Folder

```txt
garuda-web-os/
├─ index.html
├─ firebase.json
├─ database.rules.json
├─ README.md
├─ public/
│  └─ assets/
│     ├─ icons/
│     └─ wallpapers/
└─ src/
   ├─ apps/
   │  ├─ files/
   │  ├─ package-manager/
   │  ├─ settings/
   │  ├─ system-monitor/
   │  └─ terminal/
   ├─ core/
   │  ├─ boot.js
   │  ├─ desktop.js
   │  ├─ registry.js
   │  └─ window-manager.js
   ├─ firebase/
   │  ├─ config.js
   │  └─ firebase.js
   └─ styles/
      ├─ base.css
      ├─ desktop.css
      └─ window.css
```

## Cara Jalankan Lokal

Karena pakai ES Module, jangan langsung buka file `index.html` kalau browser memblokir module import. Jalankan local server:

```bash
python -m http.server 5500
```

Lalu buka:

```txt
http://localhost:5500
```

## Setup Firebase

1. Buka Firebase Console
2. Masuk project `latihan-san`
3. Aktifkan Authentication
4. Enable provider **Email/Password**
5. Masuk Realtime Database
6. Paste isi `database.rules.json` ke Rules
7. Publish rules

## Deploy ke GitHub Pages

Project ini static, jadi bisa dipush ke GitHub. Untuk GitHub Pages:

1. Upload semua file ke repository
2. Masuk Settings repository
3. Pages
4. Source: Deploy from branch
5. Branch: `main`
6. Folder: `/root`
7. Save

## Deploy ke Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting database
firebase deploy
```

## Catatan Keamanan

Firebase config di frontend memang boleh terlihat, tapi Rules wajib benar. Data user dikunci berdasarkan UID:

```json
".read": "auth != null && auth.uid === $uid",
".write": "auth != null && auth.uid === $uid"
```

Root hanya UID:

```txt
yQSxfhW6uTaXuIgEpNrrz9QtXi62
```


## App Tambahan: Chrono Rift MMORPG

Game `mmorpg_turnbase` dari upload user sudah dimasukkan sebagai aplikasi native bernama **Chrono Rift MMORPG**.

Integrasi database:

```txt
users/{uid}/games/mmorpgTurnbase
```

Data yang tersimpan:
- nickname dari input saat pertama kali membuka app
- level
- exp
- gold
- hp/mana
- inventory
- quest progress
- party
- updatedAt

Karena path-nya berada di dalam `users/{uid}`, rules lama tetap aman dan otomatis per-user.


## Desktop Interaktif

Versi ini sudah memakai desktop sungguhan:

- Icon aplikasi tampil langsung di desktop
- Klik sekali untuk select
- Double click untuk membuka aplikasi
- Right click desktop untuk context menu
- Window bisa digeser
- Window bisa minimize, maximize, close
- Taskbar menampilkan aplikasi yang terbuka
- Launcher tetap tersedia dari tombol Garuda di panel bawah

Aplikasi MMORPG sudah muncul sebagai icon **Chrono Rift MMORPG** di desktop dan launcher.
