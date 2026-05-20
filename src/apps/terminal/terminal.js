import { saveUserPatch, sanitizeFirebaseKey, createFileNode } from "../../firebase/firebase.js";

export function TerminalApp(container, context) {
  container.innerHTML = `
    <div class="terminal">
      <div class="terminal-output"></div>
      <form class="terminal-input">
        <span>${context.isRoot ? "root" : context.user.email}@garuda-web ~ $</span>
        <input autofocus />
      </form>
    </div>
  `;

  const output = container.querySelector(".terminal-output");
  const form = container.querySelector("form");
  const input = container.querySelector("input");

  print(output, "Garuda Web OS Konsole. Type 'help'.");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = "";
    print(output, `$ ${command}`);

    const result = await runCommand(command, context);
    print(output, result);
  });
}

function print(output, text) {
  const row = document.createElement("pre");
  row.textContent = text;
  output.appendChild(row);
  output.scrollTop = output.scrollHeight;
}

async function runCommand(command, context) {
  const [cmd, ...args] = command.split(" ");

  const commands = {
    help: `Available commands:
help, whoami, id, neofetch, ls, pwd, uname -a, pacman -S <pkg>,
systemctl status, ip a, clear, sudo <cmd>, touch <file>`,

    whoami: context.isRoot ? "root" : context.user.email,

    id: `uid=${context.user.uid} role=${context.isRoot ? "root" : "user"}`,

    pwd: "/home/user",

    "uname": "Garuda-WebOS linux-zen-simulated x86_64 GNU/Linux",

    ls: "Desktop  Documents  Downloads  Music  Pictures  Videos",

    neofetch: `
                   .%;888:8898898:
                 x;XxXB%89b8:b8%b88:
              .8Xxd                8X:.
            .8Xx;                    8x:.
          .tt8x          Garuda       x88;
         .@8x8;        Web OS Sim      8x8;
         8x88x                          888
OS: Garuda Web OS
Kernel: linux-zen simulated
Shell: fish simulated
Desktop: KDE Plasma / KWin web
User: ${context.user.email}
Role: ${context.isRoot ? "root" : "user"}
UID: ${context.user.uid}`,

    ip: `1: lo: <LOOPBACK,UP> mtu 65536
2: wlan0: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 192.168.1.${Math.floor(Math.random() * 200) + 20}/24`,

    systemctl: `● NetworkManager.service - active
● sddm.service - active
● firebase-sync.service - active
○ bluetooth.service - inactive`
  };

  if (!command) return "";
  if (command === "clear") return "";
  if (cmd === "sudo") {
    if (!context.isRoot) return "Permission denied: user is not root.";
    return `sudo accepted: ${args.join(" ")}`;
  }

if (cmd === "touch") {
    const filename = args.join(" ") || "untitled.txt";
    const safeKey = sanitizeFirebaseKey(filename);

    await saveUserPatch(context.user.uid, {
      [`filesystem/home/Documents/${safeKey}`]: createFileNode(filename)
    });

    return `created /home/user/Documents/${filename}`;
  }

  if (cmd === "pacman" && args[0] === "-S") {
    const pkg = args[1];
    if (!pkg) return "error: no package specified";
    await saveUserPatch(context.user.uid, {
      [`packages/${sanitizeFirebaseKey(pkg)}`]: true
    });
    return `resolving dependencies...
looking for conflicting packages...
installing ${pkg}...
done.`;
  }

  if (cmd === "uname" && args[0] === "-a") return commands.uname;
  if (cmd === "ip" && args[0] === "a") return commands.ip;
  if (cmd === "systemctl") return commands.systemctl;
  return commands[cmd] || `${cmd}: command not found`;
}
