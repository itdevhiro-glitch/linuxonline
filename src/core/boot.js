export function boot(done) {
  const bootLog = document.querySelector("#bootLog");
  const lines = [
    "Loading linux-zen-web kernel modules...",
    "Mounting Firebase user filesystem...",
    "Starting systemd simulated target graphical.target...",
    "Starting NetworkManager.service...",
    "Starting realtime_chat.service...",
    "Starting mmorpg_world.service...",
    "Starting mail.service...",
    "Starting KWin web compositor...",
    "Starting Plasma desktop shell...",
    "Boot complete."
  ];

  let index = 0;
  const timer = setInterval(() => {
    if (index >= lines.length) {
      clearInterval(timer);
      setTimeout(done, 220);
      return;
    }
    const row = document.createElement("div");
    row.innerHTML = `<span>[ OK ]</span> ${lines[index]}`;
    bootLog.appendChild(row);
    bootLog.scrollTop = bootLog.scrollHeight;
    index++;
  }, 120);
}
