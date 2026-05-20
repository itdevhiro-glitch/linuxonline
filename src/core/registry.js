import { TerminalApp } from "../apps/terminal/terminal.js";
import { FilesApp } from "../apps/files/files.js";
import { SettingsApp } from "../apps/settings/settings.js";
import { MonitorApp } from "../apps/system-monitor/monitor.js";
import { PackageManagerApp } from "../apps/package-manager/package-manager.js";

export const apps = [
  {
    id: "terminal",
    name: "Konsole",
    icon: "",
    component: TerminalApp
  },
  {
    id: "files",
    name: "Dolphin Files",
    icon: "",
    component: FilesApp
  },
  {
    id: "settings",
    name: "System Settings",
    icon: "",
    component: SettingsApp
  },
  {
    id: "monitor",
    name: "System Monitor",
    icon: "",
    component: MonitorApp
  },
  {
    id: "packages",
    name: "Pamac / Pacman",
    icon: "󰏖",
    component: PackageManagerApp
  }
];
