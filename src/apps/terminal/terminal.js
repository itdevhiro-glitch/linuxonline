import { saveUserPatch, sanitizeFirebaseKey } from "../../firebase/firebase.js";

export function TerminalApp(container, context) {
  container.innerHTML = `
    <div class="terminal">
      <div class="terminal-output"></div>
      <form class="terminal-input">
        <span>${context.isRoot ? "root" : context.user.email}@garuda-web ~ $</span>
        <input autofocus spellcheck="false" />
      </form>
    </div>
  `;

  const output = container.querySelector(".terminal-output");
  const form = container.querySelector("form");
  const input = container.querySelector("input");

  print(output, "Garuda Web Konsole. Type: help");

  form.onsubmit = async (event) => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = "";
    print(output, `$ ${command}`);
    const result = await runCommand(command, context);
    if (result === "__CLEAR__") output.innerHTML = "";
    else print(output, result);
  };
}

function print(output, text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  output.appendChild(pre);
  output.scrollTop = output.scrollHeight;
}

async function runCommand(command, context) {
  const [cmd, ...args] = command.split(" ");
  if (!command) return "";
  if (command === "clear") return "__CLEAR__";

  if (cmd === "help") return `Commands:
help, clear, neofetch, whoami, id, pwd, ls, uname -a, ip a,
systemctl status, pacman -S <package>, touch <filename>, wallpaper <url>, sudo <command>`;

  if (cmd === "whoami") return context.isRoot ? "root" : context.user.email;
  if (cmd === "id") return `uid=${context.user.uid}\nrole=${context.isRoot ? "root" : "user"}`;
  if (cmd === "pwd") return "/home/user";
  if (cmd === "ls") return "Desktop  Documents  Downloads  Pictures  Music  Videos";
  if (cmd === "uname" && args[0] === "-a") return "Garuda-Web-Linux linux-zen-web 7.0.7-sim x86_64 GNU/Linux";
  if (cmd === "ip" && args[0] === "a") return "wlan0: inet 192.168.1." + (Math.floor(Math.random()*200)+20) + "/24\nlo: inet 127.0.0.1/8";
  if (cmd === "systemctl") return Object.entries(context.data.services || {}).map(([k,v]) => `● ${k.replaceAll("_",".")} ${v}`).join("\n");

  if (cmd === "sudo") {
    if (!context.isRoot) return "Permission denied: this UID is not root.";
    return `sudo accepted: ${args.join(" ")}`;
  }

  if (cmd === "touch") {
    const filename = args.join(" ") || "untitled.txt";
    const safe = sanitizeFirebaseKey(filename);
    await saveUserPatch(context.user.uid, {
      [`filesystem/home/Documents/${safe}`]: {
        name: filename,
        type: "text",
        content: ""
      }
    });
    return `created /home/user/Documents/${filename}`;
  }

  if (cmd === "pacman" && args[0] === "-S") {
    const pkg = args[1];
    if (!pkg) return "error: no target specified";
    const safe = sanitizeFirebaseKey(pkg);
    await saveUserPatch(context.user.uid, { [`packages/${safe}`]: true });
    return `resolving dependencies...\ninstalling ${pkg}...\ndone.`;
  }

  if (cmd === "wallpaper") {
    const url = args.join(" ");
    if (!url.startsWith("http")) return "usage: wallpaper https://image-url";
    await saveUserPatch(context.user.uid, {
      "settings/wallpaper": url,
      "settings/wallpaperType": "image"
    });
    return "wallpaper updated. logout/login or reopen page to refresh.";
  }

  if (cmd === "neofetch") return `
                   .%;888:8898898:
                 x;XxXB%89b8:b8%b88:
              .8Xxd                8X:.
            .8Xx;     GARUDA       8x:.
OS: Garuda Web Linux Pro
Kernel: linux-zen-web 7.0.7-sim
DE: Plasma Web Shell
WM: KWin JS
Shell: fish simulated
User: ${context.user.email}
UID: ${context.user.uid}
Role: ${context.isRoot ? "root" : "user"}`;

  return `${cmd}: command not found`;
}
