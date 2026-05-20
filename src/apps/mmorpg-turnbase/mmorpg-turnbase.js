import {
  getGameData,
  saveGameData,
  updateWorldPlayer,
  watchWorldPlayers,
  pushWorldEvent,
  watchWorldEvents
} from "../../firebase/firebase.js";

const GAME_ID = "chronoRift";

const jobs = {
  Warrior: { hp: 160, mana: 40, atk: 18, def: 12, skill: "Shield Break" },
  Archer: { hp: 120, mana: 70, atk: 22, def: 7, skill: "Piercing Arrow" },
  Mage: { hp: 95, mana: 140, atk: 28, def: 4, skill: "Arcane Burst" },
  Support: { hp: 125, mana: 120, atk: 12, def: 8, skill: "Holy Pulse" }
};

const races = {
  Human: { bonus: "Balanced", hp: 10, mana: 10 },
  Dwarf: { bonus: "High Defense", hp: 25, mana: 0 },
  Demon: { bonus: "High Damage", hp: 0, mana: 25 },
  Ajin: { bonus: "Agile Beast Blood", hp: 15, mana: 5 },
  Elf: { bonus: "High Mana", hp: 0, mana: 35 }
};

let state = null;
let worldPlayers = {};
let worldEvents = {};

export async function MMORPGApp(container, context) {
  state = await getGameData(context.user.uid, GAME_ID);
  if (!state) renderCreate(container, context);
  else {
    await syncWorld(context);
    renderGame(container, context);
  }
}

function renderCreate(container, context) {
  container.innerHTML = `
    <div class="rpg-create">
      <section>
        <span class="chip">MMORPG Realtime</span>
        <h2>Create Character</h2>
        <p>Nickname, job, race, dan progress akan sync ke Firebase. User lain akan muncul di world map.</p>
        <form id="createCharForm">
          <input id="nick" maxlength="18" placeholder="Nickname" required />
          <select id="job">${Object.keys(jobs).map(j => `<option>${j}</option>`).join("")}</select>
          <select id="race">${Object.keys(races).map(r => `<option>${r}</option>`).join("")}</select>
          <button>Enter Chrono Rift</button>
        </form>
      </section>
    </div>
  `;

  container.querySelector("#createCharForm").onsubmit = async (e) => {
    e.preventDefault();
    const nickname = container.querySelector("#nick").value.trim();
    const job = container.querySelector("#job").value;
    const race = container.querySelector("#race").value;
    const base = jobs[job];
    const rb = races[race];

    state = {
      nickname,
      job,
      race,
      level: 1,
      floor: 1,
      exp: 0,
      gold: 250,
      hp: base.hp + rb.hp,
      maxHp: base.hp + rb.hp,
      mana: base.mana + rb.mana,
      maxMana: base.mana + rb.mana,
      atk: base.atk,
      def: base.def,
      skill: base.skill,
      rank: "F",
      zone: "Chrono Gate",
      weapon: "Novice Relic",
      armor: "Traveler Coat",
      inventory: { potion: 5, manaPotion: 3, crystal: 0, bossCore: 0 },
      quest: { title: "Clear Floor 3", target: 3, progress: 0 },
      party: {},
      battleLog: [],
      updatedAt: Date.now()
    };

    await saveGameData(context.user.uid, state, GAME_ID);
    await syncWorld(context);
    await pushWorldEvent({ type: "join", uid: context.user.uid, nickname, text: `${nickname} entered Chrono Rift.` });
    renderGame(container, context);
  };
}

function renderGame(container, context) {
  container.innerHTML = `
    <div class="rpg-app">
      <header class="rpg-top">
        <div>
          <span class="chip">Online World • Firebase Realtime</span>
          <h2>Chrono Rift Online</h2>
          <p>${state.nickname} • ${state.race} ${state.job} • Rank ${state.rank}</p>
        </div>
        <button id="rpgSync">Force Sync</button>
      </header>

      <section class="rpg-layout">
        <article class="rpg-card hero-card">
          <div class="avatar">${state.nickname.slice(0,2).toUpperCase()}</div>
          <h3>${escapeHtml(state.nickname)}</h3>
          <p>${state.job} / ${state.race}</p>
          ${meter("HP", state.hp, state.maxHp)}
          ${meter("Mana", state.mana, state.maxMana)}
          ${meter("EXP", state.exp, needExp())}
          <div class="stat-grid">
            <span>Floor <b>${state.floor}</b></span>
            <span>Gold <b>${state.gold}</b></span>
            <span>ATK <b>${state.atk}</b></span>
            <span>DEF <b>${state.def}</b></span>
          </div>
        </article>

        <article class="rpg-card">
          <h3>Dungeon Floor ${state.floor}</h3>
          <p>Enemy: <b>${enemyName()}</b> ${state.floor % 10 === 0 ? "👑 Boss Floor" : ""}</p>
          <div class="rpg-actions">
            <button data-act="attack">Attack</button>
            <button data-act="skill">${state.skill}</button>
            <button data-act="defend">Defend</button>
            <button data-act="potion">Potion</button>
            <button data-act="mana">Mana Potion</button>
            <button data-act="next">Next Floor</button>
          </div>
          <div class="battle-log">${(state.battleLog || []).map(x => `<p>${escapeHtml(x)}</p>`).join("") || "<p>Ready for battle.</p>"}</div>
        </article>

        <article class="rpg-card world-card">
          <h3>Online Players</h3>
          <div id="worldPlayers"></div>
        </article>

        <article class="rpg-card">
          <h3>Inventory & Equipment</h3>
          <div class="inventory-grid">
            ${Object.entries(state.inventory || {}).map(([k,v]) => `<div>${k}<b>x${v}</b></div>`).join("")}
          </div>
          <p><b>Weapon:</b> ${state.weapon}</p>
          <p><b>Armor:</b> ${state.armor}</p>
        </article>

        <article class="rpg-card">
          <h3>Quest</h3>
          <p>${state.quest.title}</p>
          <b>${state.quest.progress}/${state.quest.target}</b>
          <button id="claimQuest">Claim Quest</button>
        </article>

        <article class="rpg-card">
          <h3>World Events</h3>
          <div id="worldEvents"></div>
        </article>
      </section>
    </div>
  `;

  container.querySelectorAll("[data-act]").forEach(btn => {
    btn.onclick = async () => {
      await action(btn.dataset.act, context);
      await syncWorld(context);
      renderGame(container, context);
    };
  });

  container.querySelector("#claimQuest").onclick = async () => {
    await claimQuest(context);
    renderGame(container, context);
  };

  container.querySelector("#rpgSync").onclick = async () => {
    await save(context);
    await syncWorld(context);
    renderGame(container, context);
  };

  watchWorldPlayers((players) => {
    worldPlayers = players;
    const box = container.querySelector("#worldPlayers");
    if (!box) return;
    box.innerHTML = Object.entries(players).map(([uid,p]) => `
      <div class="player-online ${uid === context.user.uid ? "me" : ""}">
        <b>${escapeHtml(p.nickname || "unknown")}</b>
        <span>Lv.${p.level} • Floor ${p.floor} • ${p.job}</span>
      </div>
    `).join("");
  });

  watchWorldEvents((events) => {
    worldEvents = events;
    const box = container.querySelector("#worldEvents");
    if (!box) return;
    box.innerHTML = Object.values(events).reverse().slice(0,10).map(e => `<p>${escapeHtml(e.text || "")}</p>`).join("");
  });
}

async function action(type, context) {
  if (type === "potion") {
    if ((state.inventory.potion || 0) <= 0) return log("No potion.");
    state.inventory.potion--;
    state.hp = Math.min(state.maxHp, state.hp + 55);
    return save(context, "Potion used.");
  }

  if (type === "mana") {
    if ((state.inventory.manaPotion || 0) <= 0) return log("No mana potion.");
    state.inventory.manaPotion--;
    state.mana = Math.min(state.maxMana, state.mana + 45);
    return save(context, "Mana potion used.");
  }

  if (type === "next") {
    state.floor++;
    state.quest.progress = Math.min(state.quest.target, state.quest.progress + 1);
    state.rank = calcRank(state.floor);
    state.zone = state.floor % 10 === 0 ? "Boss Gate" : "Crystal Dungeon";
    await pushWorldEvent({ type: "floor", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} reached floor ${state.floor}.` });
    return save(context, `Moved to floor ${state.floor}.`);
  }

  const skill = type === "skill";
  if (skill && state.mana < 18) return log("Not enough mana.");
  if (skill) state.mana -= 18;

  const dmg = rand(state.atk + state.floor, state.atk + state.floor + (skill ? 38 : 20));
  const hit = Math.max(1, rand(8, 22 + Math.floor(state.floor/4)) - (type === "defend" ? state.def : Math.floor(state.def/2)));
  state.hp = Math.max(1, state.hp - hit);
  state.exp += dmg + state.floor * 4;
  state.gold += rand(12, 36) + state.floor;
  state.inventory.crystal = (state.inventory.crystal || 0) + 1;

  if (state.floor % 10 === 0 && dmg > 35) {
    state.inventory.bossCore = (state.inventory.bossCore || 0) + 1;
    state.weapon = "Rift Blade +" + Math.floor(state.floor/10);
  }

  while (state.exp >= needExp()) {
    state.exp -= needExp();
    state.level++;
    state.maxHp += 18;
    state.maxMana += 9;
    state.atk += 3;
    state.def += 2;
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    await pushWorldEvent({ type: "level", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} leveled up to ${state.level}.` });
  }

  return save(context, `${skill ? state.skill : type === "defend" ? "Defend counter" : "Attack"} dealt ${dmg}. Enemy hit ${hit}.`);
}

async function claimQuest(context) {
  if (state.quest.progress < state.quest.target) return log("Quest belum selesai.");
  state.gold += 500;
  state.inventory.potion += 3;
  state.quest.progress = 0;
  state.quest.target += 2;
  state.quest.title = `Clear Floor ${state.floor + state.quest.target}`;
  await pushWorldEvent({ type: "quest", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} claimed a quest reward.` });
  return save(context, "Quest reward claimed: 500 gold + 3 potion.");
}

async function save(context, message) {
  if (message) log(message);
  state.updatedAt = Date.now();
  await saveGameData(context.user.uid, state, GAME_ID);
}

async function syncWorld(context) {
  await updateWorldPlayer(context.user.uid, {
    nickname: state.nickname,
    level: state.level,
    floor: state.floor,
    job: state.job,
    race: state.race,
    rank: state.rank,
    email: context.user.email
  });
}

function log(text) {
  state.battleLog = [`[${new Date().toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit"})}] ${text}`, ...(state.battleLog || [])].slice(0, 8);
}

function needExp() { return 100 + (state.level - 1) * 55; }
function enemyName() {
  if (state.floor % 10 === 0) return "Abyss Floor Guardian";
  return ["Crystal Slime", "Void Goblin", "Rift Wolf", "Ancient Puppet"][state.floor % 4];
}
function calcRank(f) {
  if (f >= 500) return "SSS";
  if (f >= 300) return "SS";
  if (f >= 150) return "S";
  if (f >= 80) return "A";
  if (f >= 40) return "B";
  if (f >= 20) return "C";
  if (f >= 10) return "D";
  return "F";
}
function meter(label, value, max) {
  const pct = Math.max(0, Math.min(100, Math.round(value / max * 100)));
  return `<label>${label}: ${value}/${max}</label><div class="meter"><span style="width:${pct}%"></span></div>`;
}
function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function escapeHtml(v) { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
