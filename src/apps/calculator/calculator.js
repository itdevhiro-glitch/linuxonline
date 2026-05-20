export function CalculatorApp(container) {
  container.innerHTML = `
    <div class="calculator-app">
      <input id="calcDisplay" readonly value="0" />
      <div class="calc-grid">
        ${["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+","C","(",")","%"].map(x => `<button data-key="${x}">${x}</button>`).join("")}
      </div>
      <p>Supports + - * / parentheses and percent.</p>
    </div>
  `;

  const display = container.querySelector("#calcDisplay");
  let expr = "";

  container.querySelectorAll("[data-key]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key;
      if (key === "C") {
        expr = "";
        display.value = "0";
        return;
      }
      if (key === "=") {
        try {
          if (!/^[0-9+\-*/(). %]+$/.test(expr)) throw new Error("invalid");
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${expr.replaceAll("%", "/100")})`)();
          expr = String(result);
          display.value = expr;
        } catch {
          display.value = "Error";
          expr = "";
        }
        return;
      }
      expr += key;
      display.value = expr;
    };
  });
}
