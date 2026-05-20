export function boot(lines, done) {
  const bootLog = document.querySelector("#bootLog");
  let index = 0;

  const timer = setInterval(() => {
    if (index < lines.length) {
      const row = document.createElement("div");
      row.textContent = `[ OK ] ${lines[index]}`;
      bootLog.appendChild(row);
      index++;
      return;
    }

    clearInterval(timer);
    done();
  }, 180);
}
