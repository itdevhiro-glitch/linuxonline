import { WelcomeApp } from "../apps/kernel/kernel.js";
import { TerminalApp } from "../apps/terminal/terminal.js";
import { FilesApp } from "../apps/files/files.js";
import { SettingsApp } from "../apps/settings/settings.js";
import { WallpaperApp } from "../apps/wallpaper/wallpaper.js";
import { MMORPGApp } from "../apps/mmorpg-turnbase/mmorpg-turnbase.js";
import { ChatApp } from "../apps/chat/chat.js";
import { MailApp } from "../apps/mail/mail.js";
import { BrowserApp } from "../apps/browser/browser.js";

export const apps = [
  { id: "kernel", name: "Kernel Center", icon: "", component: WelcomeApp, width: "900px" },
  { id: "terminal", name: "Konsole", icon: "", component: TerminalApp, width: "760px" },
  { id: "files", name: "Dolphin Files", icon: "", component: FilesApp, width: "840px" },
  { id: "mmorpg", name: "Chrono Rift Online", icon: "⚔️", component: MMORPGApp, width: "980px" },
  { id: "chat", name: "Realtime Chat", icon: "󰭹", component: ChatApp, width: "850px" },
  { id: "mail", name: "Web Mail", icon: "󰇮", component: MailApp, width: "900px" },
  { id: "wallpaper", name: "Wallpaper Studio", icon: "󰸉", component: WallpaperApp, width: "820px" },
  { id: "settings", name: "System Settings", icon: "", component: SettingsApp, width: "780px" },
  { id: "browser", name: "FireDragon", icon: "󰈹", component: BrowserApp, width: "900px" }
];
