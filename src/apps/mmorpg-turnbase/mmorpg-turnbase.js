import { getGameData, saveGameData } from "../../firebase/firebase.js";

const GAME_ID = "mmorpgTurnbase";

const defaultGame = (email) => ({
  nickname: "",
  level: 1,
  exp: 0,
  gold: 150,
  hp: 120,
  maxHp: 120,
  mana: 60,
  maxMana: 60,
  zone: "Novice Shrine",
  className: "Wanderer",
  weapon: "Rusty Katana",
  armor: "Cloth Robe",
  quest: "Defeat 3 Slimes",
  questProgress: 0,
  battlesWon: 0,
  inventory: {
    potion: 3,
    manaPotion: 2,
    slimeCore: 0
  },
  party: [
    { name: "You", hp: 120, role: "Leader" },
    { name: "Airi", hp: 90, role: "Healer" },
    { name: "Raka", hp: 110, role: "Guardian" }
  ],
  createdFrom: email,
  updatedAt: new Date().toISOString()
});

let state = null;
let logLines = [];

export async function MMORPGTurnbaseApp(container, context) {
  container.innerHTML = `<div class="mmorpg-loading">Loading MMORPG save from Firebase...</div>`;

  const saved = await getGameData(context.user.uid, GAME_ID);
  state = saved || defaultGame(context.user.email);

  render(container, context);
}

function render(container, context) {
  if (!state.nickname) {
    renderNicknameSetup(container, context);
    return;
  }

  container.innerHTML = `
    <div class="mmorpg-app">
      <header class="mmorpg-hero">
        <div>
          <span class="mmorpg-chip">Firebase Sync: /users/${context.user.uid}/games/${GAME_ID}</span>
          <h2>Chrono Rift: Turnbase Online</h2>
          <p>Welcome back, <b>${escapeHtml(state.nickname)}</b>. Your save is connected to this Garuda Web OS account.</p>
        </div>
        <button id="syncGameBtn">Sync Save</button>
      </header>

      <section class="mmorpg-grid">
        <article class="mmorpg-card player-card">
          <div class="avatar-orb">${state.nickname.slice(0, 2).toUpperCase()}</div>
          <h3>${escapeHtml(state.nickname)}</h3>
          <p>${state.className} • Lv. ${state.level} • ${state.zone}</p>
          ${meter("HP", state.hp, state.maxHp)}
          ${meter("Mana", state.mana, state.maxMana)}
          ${meter("EXP", state.exp, nextLevelExp())}
          <div class="stat-row"><span>Gold</span><b>${state.gold}</b></div>
          <div class="stat-row"><span>Weapon</span><b>${state.weapon}</b></div>
          <div class="stat-row"><span>Armor</span><b>${state.armor}</b></div>
        </article>

        <article class="mmorpg-card">
          <h3>Battle Arena</h3>
          <p>Enemy: <b>Crystal Slime</b></p>
          <div class="battle-actions">
            <button data-action="attack">Attack</button>
            <button data-action="skill">Mana Slash</button>
            <button data-action="potion">Potion</button>
            <button data-action="rest">Camp Rest</button>
          </div>
          <div class="battle-log" id="battleLog">${logLines.map(line => `<p>${escapeHtml(line)}</p>`).join("") || "<p>No battle log yet.</p>"}</div>
        </article>

        <article class="mmorpg-card">
          <h3>Quest</h3>
          <p>${state.quest}</p>
          <div class="quest-box">
            <b>${state.questProgress} / 3</b>
            <span>Slimes defeated</span>
          </div>
          <button id="claimQuestBtn">Claim Reward</button>
        </article>

        <article class="mmorpg-card">
          <h3>Inventory</h3>
          <div class="inventory-grid">
            <div>🧪 Potion <b>x${state.inventory.potion || 0}</b></div>
            <div>🔷 Mana Potion <b>x${state.inventory.manaPotion || 0}</b></div>
            <div>💠 Slime Core <b>x${state.inventory.slimeCore || 0}</b></div>
          </div>
        </article>

        <article class="mmorpg-card">
          <h3>Party</h3>
          <div class="party-list">
            ${state.party.map(member => `
              <div>
                <b>${escapeHtml(member.name)}</b>
                <span>${member.role} • HP ${member.hp}</span>
              </div>
            `).join("")}
          </div>
        </article>

        <article class="mmorpg-card">
          <h3>Original Upload</h3>
          <p>File game original tetap disimpan di repo sebagai referensi.</p>
          <a class="mmorpg-link" href="./public/apps/mmorpg-turnbase-original/mmorpg_turnbase/index.html" target="_blank">Open original game build</a>
        </article>
      </section>
    </div>
  `;

  container.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", async () => {
      await handleBattle(button.dataset.action, context);
      render(container, context);
    });
  });

  container.querySelector("#claimQuestBtn").addEventListener("click", async () => {
    await claimQuest(context);
    render(container, context);
  });

  container.querySelector("#syncGameBtn").addEventListener("click", async () => {
    await persist(context);
    log("Manual sync complete.");
    render(container, context);
  });
}

function renderNicknameSetup(container, context) {
  container.innerHTML = `
    <div class="nickname-screen">
      <div class="nickname-card">
        <span class="mmorpg-chip">First Launch Setup</span>
        <h2>Create Your MMORPG Nickname</h2>
        <p>Nickname ini akan disimpan di database Linux kamu dan sinkron dengan akun Firebase UID.</p>
        <form id="nicknameForm">
          <input id="nicknameInput" maxlength="18" placeholder="Contoh: HiroBlade" required />
          <button type="submit">Start Adventure</button>
        </form>
        <small>Save path: users/${context.user.uid}/games/${GAME_ID}</small>
      </div>
    </div>
  `;

  container.querySelector("#nicknameForm").addEventListener("submit", async event => {
    event.preventDefault();
    const nickname = container.querySelector("#nicknameInput").value.trim();
    if (!nickname) return;
    state.nickname = nickname;
    state.party[0].name = nickname;
    await persist(context);
    render(container, context);
  });
}

async function handleBattle(action, context) {
  if (action === "rest") {
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    log("Camp rest complete. HP and Mana restored.");
    await persist(context);
    return;
  }

  if (action === "potion") {
    if ((state.inventory.potion || 0) <= 0) {
      log("No potion left.");
      return;
    }
    state.inventory.potion -= 1;
    state.hp = Math.min(state.maxHp, state.hp + 45);
    log("Used potion. HP restored.");
    await persist(context);
    return;
  }

  let damage = action === "skill" ? random(32, 54) : random(18, 35);

  if (action === "skill") {
    if (state.mana < 15) {
      log("Not enough mana for Mana Slash.");
      return;
    }
    state.mana -= 15;
  }

  const enemyHit = random(5, 18);
  state.hp = Math.max(1, state.hp - enemyHit);
  state.exp += damage;
  state.gold += random(8, 22);
  state.inventory.slimeCore = (state.inventory.slimeCore || 0) + 1;
  state.questProgress = Math.min(3, (state.questProgress || 0) + 1);
  state.battlesWon += 1;

  log(`${action === "skill" ? "Mana Slash" : "Attack"} dealt ${damage} damage. Crystal Slime hit back ${enemyHit}.`);

  while (state.exp >= nextLevelExp()) {
    state.exp -= nextLevelExp();
    state.level += 1;
    state.maxHp += 18;
    state.maxMana += 8;
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    log(`Level up! You are now level ${state.level}.`);
  }

  await persist(context);
}

async function claimQuest(context) {
  if ((state.questProgress || 0) < 3) {
    log("Quest not complete yet.");
    return;
  }

  state.questProgress = 0;
  state.gold += 250;
  state.inventory.potion = (state.inventory.potion || 0) + 2;
  state.weapon = state.level >= 3 ? "Garuda Plasma Blade" : state.weapon;
  log("Quest reward claimed: 250 gold, 2 potions.");
  await persist(context);
}

async function persist(context) {
  state.updatedAt = new Date().toISOString();
  await saveGameData(context.user.uid, state, GAME_ID);
}

function nextLevelExp() {
  return 100 + (state.level - 1) * 45;
}

function meter(label, value, max) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return `
    <label>${label}: ${value}/${max}</label>
    <div class="meter"><span style="width:${percent}%"></span></div>
  `;
}

function log(text) {
  logLines.unshift(`[${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}] ${text}`);
  logLines = logLines.slice(0, 8);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
