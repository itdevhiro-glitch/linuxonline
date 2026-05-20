import {
  saveUserPatch,
  sanitizeFirebaseKey,
  saveFile,
  readFile,
  removeFile,
  ipFromUid
} from "../../firebase/firebase.js";

export function TerminalApp(container, context) {
  container.innerHTML = `
    <div class="terminal">
      <div class="terminal-output"></div>
      <form class="terminal-input">
        <span>${context.isRoot ? "root" : context.user.email}@${context.data.profile?.hostname || "garuda-web"} ~ $</span>
        <input autofocus spellcheck="false" autocomplete="off" />
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
    try {
      const result = await runCommand(command, context, output);
      if (result === "__CLEAR__") output.innerHTML = "";
      else if (result !== undefined && result !== null) print(output, result);
    } catch (err) {
      print(output, `error: ${err.message}`);
    }
  };
}

function print(output, text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  output.appendChild(pre);
  output.scrollTop = output.scrollHeight;
}

function parsePath(input = "") {
  let path = input.trim() || "Documents";
  path = path.replace(/^~\/?/, "");
  path = path.replace(/^\/home\/user\/?/, "");
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { folder: "Documents", filename: "" };
  if (parts.length === 1) {
    const folders = ["Desktop", "Documents", "Downloads", "Pictures", "Music", "Videos"];
    if (folders.includes(parts[0])) return { folder: parts[0], filename: "" };
    return { folder: "Documents", filename: parts[0] };
  }
  return { folder: parts[0], filename: parts.slice(1).join("_") };
}

function listFolder(context, folder) {
  const home = context.data.filesystem?.home || {};
  const target = folder ? home[folder] : home;
  if (!target) return `${folder}: no such file or directory`;
  return Object.entries(target).map(([key, value]) => {
    if (value?.name) return value.name;
    return key;
  }).join("  ") || "";
}

async function runCommand(command, context, output) {
  const tokens = command.split(" ").filter(Boolean);
  const [cmd, ...args] = tokens;
  if (!command) return "";
  if (command === "clear") return "__CLEAR__";

  if (cmd === "help") return `Commands:
help                         Show command list
whoami                       Show current user
id                           Show UID and role
neofetch                     Show distro info
ls [folder]                  List folder
pwd                          Show current path
uname -a                     Show kernel
pacman -S <pkg>              Install simulated package
systemctl status             Show services
ip a                         Show unique per-user IP
clear                        Clear terminal
sudo <cmd>                   Root-only command
touch <file>                 Create file in Documents
cat <file>                   Read file from Documents
write <file> <text>          Write text file
rm <file>                    Remove file from Documents
save-email <subject> <body>  Save text as Downloads email file
calc <expression>            Calculate expression`;

  if (cmd === "whoami") return context.isRoot ? "root" : context.user.email;
  if (cmd === "id") return `uid=${context.user.uid}\nrole=${context.isRoot ? "root" : "user"}\ngroups=${context.isRoot ? "root,wheel,users" : "users"}`;
  if (cmd === "pwd") return "/home/user";

  if (cmd === "ls") {
    const { folder } = parsePath(args[0] || "");
    return listFolder(context, args[0] ? folder : "");
  }

  if (cmd === "uname" && args[0] === "-a") {
    return `Garuda-Web-Linux ${context.data.profile?.kernel || "linux-zen-web 7.0.7-sim"} x86_64 GNU/Linux`;
  }

  if (cmd === "ip" && args[0] === "a") {
    const ip = context.data.profile?.ipAddress || ipFromUid(context.user.uid);
    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo

2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet ${ip}/24 brd ${ip.split(".").slice(0,3).join(".")}.255 scope global dynamic wlan0
    ether ${fakeMac(context.user.uid)} txqueuelen 1000`;
  }

  if (cmd === "systemctl") {
    if (args[0] !== "status") return "usage: systemctl status";
    return Object.entries(context.data.services || {})
      .map(([k,v]) => `● ${k.replaceAll("_",".")} - ${v}`)
      .join("\n");
  }

  if (cmd === "sudo") {
    if (!context.isRoot) return "Permission denied: this UID is not root/wheel.";
    return `sudo accepted: ${args.join(" ") || "no command"}`;
  }

  if (cmd === "touch") {
    const filename = args.join(" ") || "untitled.txt";
    const { folder, filename: parsedFile } = parsePath(filename);
    const file = parsedFile || filename;
    await saveFile(context.user.uid, folder, file, "", "text");
    localSetFile(context, folder, file, "");
    return `created /home/user/${folder}/${file}`;
  }

  if (cmd === "cat") {
    const filename = args.join(" ");
    if (!filename) return "usage: cat <file>";
    const { folder, filename: file } = parsePath(filename);
    const data = await readFile(context.user.uid, folder, file);
    return data ? data.content || "" : `${filename}: no such file`;
  }

  if (cmd === "write") {
    const filename = args[0];
    const content = args.slice(1).join(" ");
    if (!filename) return "usage: write <file> <text>";
    const { folder, filename: file } = parsePath(filename);
    await saveFile(context.user.uid, folder, file, content, "text");
    localSetFile(context, folder, file, content);
    return `written /home/user/${folder}/${file}`;
  }

  if (cmd === "rm") {
    const filename = args.join(" ");
    if (!filename) return "usage: rm <file>";
    const { folder, filename: file } = parsePath(filename);
    await removeFile(context.user.uid, folder, file);
    if (context.data.filesystem?.home?.[folder]) {
      delete context.data.filesystem.home[folder][sanitizeFirebaseKey(file)];
    }
    return `removed /home/user/${folder}/${file}`;
  }

  if (cmd === "save-email") {
    const subject = args[0] || "untitled";
    const body = args.slice(1).join(" ") || "(empty email)";
    const filename = `email_${Date.now()}_${sanitizeFirebaseKey(subject)}.txt`;
    const content = `Subject: ${subject}\nFrom: ${context.user.email}\n\n${body}`;
    await saveFile(context.user.uid, "Downloads", filename, content, "email");
    localSetFile(context, "Downloads", filename, content, "email");
    return `saved email to /home/user/Downloads/${filename}`;
  }

  if (cmd === "pacman" && args[0] === "-S") {
    const pkg = args[1];
    if (!pkg) return "error: no target specified";
    const safe = sanitizeFirebaseKey(pkg);
    await saveUserPatch(context.user.uid, { [`packages/${safe}`]: true });
    context.data.packages = context.data.packages || {};
    context.data.packages[safe] = true;
    return `resolving dependencies...
looking for conflicting packages...
Packages (1) ${pkg}-1.0.0
installing ${pkg}...
running post-transaction hooks...
done.`;
  }

  if (cmd === "calc") {
    const exp = args.join(" ");
    if (!/^[0-9+\-*/(). %]+$/.test(exp)) return "calc only accepts numbers and operators.";
    // eslint-disable-next-line no-new-func
    return String(Function(`"use strict"; return (${exp.replaceAll("%", "/100")})`)());
  }

  if (cmd === "neofetch") return `
                   .%;888:8898898:
                 x;XxXB%89b8:b8%b88:
              .8Xxd                8X:.
            .8Xx;     GARUDA       8x:.
OS: Garuda Web Linux Pro
Kernel: ${context.data.profile?.kernel || "linux-zen-web"}
DE: Plasma Web Shell
WM: KWin JS
Shell: ${context.data.profile?.shell || "fish"}
Host: ${context.data.profile?.hostname || "garuda-web"}
IP: ${context.data.profile?.ipAddress || ipFromUid(context.user.uid)}
User: ${context.user.email}
UID: ${context.user.uid}
Role: ${context.isRoot ? "root" : "user"}`;

  return `${cmd}: command not found`;
}

function localSetFile(context, folder, filename, content, type = "text") {
  context.data.filesystem = context.data.filesystem || { home: {} };
  context.data.filesystem.home = context.data.filesystem.home || {};
  context.data.filesystem.home[folder] = context.data.filesystem.home[folder] || {};
  context.data.filesystem.home[folder][sanitizeFirebaseKey(filename)] = {
    name: filename,
    type,
    content,
    updatedAt: new Date().toISOString()
  };
}

function fakeMac(uid) {
  let out = [];
  for (let i = 0; i < 6; i++) {
    const code = uid.charCodeAt(i % uid.length) || i * 17;
    out.push((code % 255).toString(16).padStart(2, "0"));
  }
  return out.join(":");
}
