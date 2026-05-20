export function MonitorApp(container) {
  const cpu = Math.floor(Math.random() * 45) + 8;
  const ram = Math.floor(Math.random() * 50) + 20;
  const disk = Math.floor(Math.random() * 60) + 10;

  container.innerHTML = `
    <div class="monitor-app">
      <h2>System Monitor</h2>
      ${bar("CPU", cpu)}
      ${bar("RAM", ram)}
      ${bar("Disk", disk)}
      <h3>Processes</h3>
      <table>
        <tr><th>PID</th><th>Name</th><th>Status</th></tr>
        <tr><td>1</td><td>systemd</td><td>running</td></tr>
        <tr><td>419</td><td>kwin-web</td><td>running</td></tr>
        <tr><td>728</td><td>firebase-sync</td><td>running</td></tr>
      </table>
    </div>
  `;
}

function bar(label, value) {
  return `
    <label>${label}: ${value}%</label>
    <div class="meter"><span style="width:${value}%"></span></div>
  `;
}
