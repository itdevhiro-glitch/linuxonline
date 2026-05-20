import {
  getGameData,
  saveGameData,
  updateWorldPlayer,
  watchWorldPlayers,
  pushWorldEvent,
  watchWorldEvents,
  saveUserPatch
} from "../../firebase/firebase.js";

const GAME_ID = "chronoRift";
let state = null;
let currentPage = "overview";
let worldPlayers = {};
let worldEvents = {};

const JOBS = {
  Warrior: {
    icon: "🛡️",
    subclass: ["Berserker", "Paladin", "Sword Saint"],
    hp: 180,
    mana: 45,
    atk: 22,
    def: 16,
    crit: 5,
    skill: "Titan Break",
    ult: "Heaven Splitter"
  },
  Archer: {
    icon: "🏹",
    subclass: ["Sniper", "Ranger", "Wind Stalker"],
    hp: 130,
    mana: 85,
    atk: 28,
    def: 8,
    crit: 14,
    skill: "Piercing Rain",
    ult: "Eagle God Barrage"
  },
  Mage: {
    icon: "🔮",
    subclass: ["Elementalist", "Void Caster", "Chronomancer"],
    hp: 105,
    mana: 170,
    atk: 34,
    def: 5,
    crit: 9,
    skill: "Arcane Nova",
    ult: "Meteor Singularity"
  },
  Support: {
    icon: "✨",
    subclass: ["Oracle", "Saint", "Battle Priest"],
    hp: 140,
    mana: 145,
    atk: 16,
    def: 10,
    crit: 6,
    skill: "Holy Pulse",
    ult: "Divine Reversal"
  }
};

const RACES = {
  Human: { icon: "🧑", bonus: "Balanced Growth", hp: 15, mana: 15, atk: 2, def: 2 },
  Dwarf: { icon: "⛏️", bonus: "Iron Body", hp: 35, mana: 0, atk: 1, def: 7 },
  Demon: { icon: "😈", bonus: "Abyss Power", hp: 0, mana: 35, atk: 8, def: 0 },
  Ajin: { icon: "🐺", bonus: "Beast Instinct", hp: 20, mana: 10, atk: 4, def: 3 },
  Elf: { icon: "🧝", bonus: "Mana Bloodline", hp: 0, mana: 55, atk: 3, def: 1 }
};

const DUNGEONS = [
  { id: "crystal-cave", name: "Crystal Cave", min: 1, biome: "glacier", boss: "Crystal Leviathan", drop: "Crystal Shard" },
  { id: "ash-temple", name: "Ash Temple", min: 20, biome: "volcano", boss: "Flame Yaksha", drop: "Ash Relic" },
  { id: "moon-forest", name: "Moon Forest", min: 60, biome: "forest", boss: "Lunar Fenrir", drop: "Moon Fang" },
  { id: "void-tower", name: "Void Tower", min: 120, biome: "void", boss: "Null Seraph", drop: "Void Core" },
  { id: "god-rift", name: "God Rift", min: 300, biome: "celestial", boss: "Chronos Devourer", drop: "God Fragment" }
];

const ITEM_POOL = [
  { name: "Iron Saber", slot: "weapon", rarity: "F", atk: 4, def: 0 },
  { name: "Hunter Bow", slot: "weapon", rarity: "E", atk: 8, def: 0 },
  { name: "Mana Staff", slot: "weapon", rarity: "D", atk: 12, def: 0 },
  { name: "Dragon Pike", slot: "weapon", rarity: "C", atk: 18, def: 2 },
  { name: "Abyss Katana", slot: "weapon", rarity: "B", atk: 26, def: 3 },
  { name: "Garuda Plasma Blade", slot: "weapon", rarity: "A", atk: 38, def: 5 },
  { name: "Chrono Relic", slot: "weapon", rarity: "S", atk: 55, def: 9 },
  { name: "Traveler Coat", slot: "armor", rarity: "F", atk: 0, def: 3 },
  { name: "Knight Armor", slot: "armor", rarity: "D", atk: 0, def: 12 },
  { name: "Void Mantle", slot: "armor", rarity: "B", atk: 4, def: 24 },
  { name: "Seraph Guard", slot: "armor", rarity: "S", atk: 8, def: 42 }
];

export async function MMORPGApp(container, context) {
  state = await getGameData(context.user.uid, GAME_ID);
  if (!state) {
    renderCreate(container, context);
    return;
  }

  normalizeState(context);
  await syncWorld(context);
  renderShell(container, context);
}

function renderCreate(container, context) {
  container.innerHTML = `
    <div class="rpg-create-pro">
      <div class="rpg-create-bg"></div>
      <section class="rpg-create-panel">
        <span class="rpg-badge">MMORPG Online • Firebase Realtime</span>
        <h1>Chrono Rift Online</h1>
        <p>Bangun karakter, raid dungeon, trade item, naik rank F sampai SSS, dan ketemu player lain secara realtime.</p>

        <form id="createCharForm" class="create-grid">
          <label>Nickname
            <input id="nick" maxlength="18" placeholder="HiroBlade" required />
          </label>

          <label>Job
            <select id="job">${Object.entries(JOBS).map(([k,v]) => `<option value="${k}">${v.icon} ${k}</option>`).join("")}</select>
          </label>

          <label>Race
            <select id="race">${Object.entries(RACES).map(([k,v]) => `<option value="${k}">${v.icon} ${k}</option>`).join("")}</select>
          </label>

          <label>Starting Dungeon
            <select id="dungeon">${DUNGEONS.slice(0, 2).map(d => `<option value="${d.id}">${d.name}</option>`).join("")}</select>
          </label>

          <button>Enter The Rift</button>
        </form>

        <div class="class-preview" id="classPreview"></div>
      </section>
    </div>
  `;

  const jobInput = container.querySelector("#job");
  const raceInput = container.querySelector("#race");
  const preview = container.querySelector("#classPreview");

  const updatePreview = () => {
    const job = JOBS[jobInput.value];
    const race = RACES[raceInput.value];
    preview.innerHTML = `
      <div><b>${job.icon} ${jobInput.value}</b><span>Skill: ${job.skill}</span></div>
      <div><b>${race.icon} ${raceInput.value}</b><span>${race.bonus}</span></div>
      <div><b>Subclasses</b><span>${job.subclass.join(" • ")}</span></div>
    `;
  };

  jobInput.onchange = updatePreview;
  raceInput.onchange = updatePreview;
  updatePreview();

  container.querySelector("#createCharForm").onsubmit = async (e) => {
    e.preventDefault();

    const nickname = container.querySelector("#nick").value.trim();
    const jobName = jobInput.value;
    const raceName = raceInput.value;
    const dungeonId = container.querySelector("#dungeon").value;
    const job = JOBS[jobName];
    const race = RACES[raceName];

    state = {
      nickname,
      job: jobName,
      race: raceName,
      subclass: job.subclass[0],
      level: 1,
      floor: 1,
      rank: "F",
      exp: 0,
      gold: 500,
      gems: 25,
      hp: job.hp + race.hp,
      maxHp: job.hp + race.hp,
      mana: job.mana + race.mana,
      maxMana: job.mana + race.mana,
      atk: job.atk + race.atk,
      def: job.def + race.def,
      crit: job.crit,
      energy: 100,
      skill: job.skill,
      ultimate: job.ult,
      dungeonId,
      zone: dungeonById(dungeonId).name,
      weapon: { name: "Novice Relic", slot: "weapon", rarity: "F", atk: 3, def: 0 },
      armor: { name: "Traveler Coat", slot: "armor", rarity: "F", atk: 0, def: 3 },
      inventory: {
        potion: 8,
        manaPotion: 5,
        riftKey: 1
      },
      items: [],
      quests: [
        { id: "q1", title: "Clear 3 dungeon floors", progress: 0, target: 3, rewardGold: 350, rewardExp: 120, done: false },
        { id: "q2", title: "Collect 5 monster drops", progress: 0, target: 5, rewardGold: 500, rewardExp: 180, done: false }
      ],
      achievements: [],
      market: [],
      party: {},
      battle: makeEnemy(1, dungeonId),
      battleLog: ["Your journey begins at the Chrono Gate."],
      stats: {
        monstersKilled: 0,
        bossesKilled: 0,
        itemsDropped: 0,
        trades: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await save(context, "Character created.");
    await syncWorld(context);
    await pushWorldEvent({ type: "join", uid: context.user.uid, nickname, text: `${nickname} entered Chrono Rift Online.` });
    renderShell(container, context);
  };
}

function renderShell(container, context) {
  container.innerHTML = `
    <div class="rpg-pro">
      <header class="rpg-pro-header biome-${dungeonById(state.dungeonId).biome}">
        <div>
          <span class="rpg-badge">Online World • ${state.zone}</span>
          <h2>Chrono Rift Online</h2>
          <p>${escapeHtml(state.nickname)} • ${state.race} ${state.job} / ${state.subclass} • Rank ${state.rank}</p>
        </div>
        <div class="rpg-header-actions">
          <button id="syncRpg">Sync</button>
          <button id="restRpg">Camp Rest</button>
        </div>
      </header>

      <nav class="rpg-tabs">
        ${[
          ["overview", "Dashboard"],
          ["battle", "Battle"],
          ["dungeon", "Dungeon"],
          ["inventory", "Inventory"],
          ["market", "Market"],
          ["world", "World"],
          ["quests", "Quests"],
          ["leaderboard", "Leaderboard"]
        ].map(([id, label]) => `<button class="${currentPage === id ? "active" : ""}" data-page="${id}">${label}</button>`).join("")}
      </nav>

      <main id="rpgPage"></main>
    </div>
  `;

  container.querySelectorAll("[data-page]").forEach(btn => {
    btn.onclick = () => {
      currentPage = btn.dataset.page;
      renderShell(container, context);
    };
  });

  container.querySelector("#syncRpg").onclick = async () => {
    await save(context, "Manual sync complete.");
    await syncWorld(context);
    renderShell(container, context);
  };

  container.querySelector("#restRpg").onclick = async () => {
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    state.energy = 100;
    await save(context, "Camp rest: HP, Mana, and Energy restored.");
    renderShell(container, context);
  };

  const page = container.querySelector("#rpgPage");
  const renderers = {
    overview: renderOverview,
    battle: renderBattle,
    dungeon: renderDungeon,
    inventory: renderInventory,
    market: renderMarket,
    world: renderWorld,
    quests: renderQuests,
    leaderboard: renderLeaderboard
  };

  renderers[currentPage](page, context);
}

function renderOverview(page) {
  page.innerHTML = `
    <section class="rpg-dashboard">
      <article class="rpg-card hero-profile">
        <div class="hero-avatar rarity-${state.weapon.rarity}">${state.nickname.slice(0, 2).toUpperCase()}</div>
        <h3>${escapeHtml(state.nickname)}</h3>
        <p>${JOBS[state.job].icon} ${state.job} • ${RACES[state.race].icon} ${state.race}</p>
        ${meter("HP", state.hp, state.maxHp)}
        ${meter("Mana", state.mana, state.maxMana)}
        ${meter("Energy", state.energy, 100)}
        ${meter("EXP", state.exp, needExp())}
      </article>

      <article class="rpg-card stat-board">
        <h3>Character Stats</h3>
        <div class="rpg-stat-grid">
          <span>Level <b>${state.level}</b></span>
          <span>Floor <b>${state.floor}</b></span>
          <span>Rank <b>${state.rank}</b></span>
          <span>Gold <b>${state.gold}</b></span>
          <span>Gems <b>${state.gems}</b></span>
          <span>ATK <b>${totalAtk()}</b></span>
          <span>DEF <b>${totalDef()}</b></span>
          <span>Crit <b>${state.crit}%</b></span>
        </div>
      </article>

      <article class="rpg-card">
        <h3>Equipment</h3>
        ${equipmentLine(state.weapon)}
        ${equipmentLine(state.armor)}
        <p class="rpg-muted">Item rarity: F → E → D → C → B → A → S</p>
      </article>

      <article class="rpg-card">
        <h3>Progress</h3>
        <p>Monsters killed: <b>${state.stats.monstersKilled}</b></p>
        <p>Bosses killed: <b>${state.stats.bossesKilled}</b></p>
        <p>Items dropped: <b>${state.stats.itemsDropped}</b></p>
        <p>Trades: <b>${state.stats.trades}</b></p>
      </article>

      <article class="rpg-card wide">
        <h3>Recent Battle Log</h3>
        <div class="rpg-log">${state.battleLog.map(x => `<p>${escapeHtml(x)}</p>`).join("")}</div>
      </article>
    </section>
  `;
}

function renderBattle(page, context) {
  const enemy = state.battle || makeEnemy(state.floor, state.dungeonId);
  state.battle = enemy;

  page.innerHTML = `
    <section class="battle-stage biome-${dungeonById(state.dungeonId).biome}">
      <article class="combatant player">
        <div class="combat-avatar">${JOBS[state.job].icon}</div>
        <h3>${escapeHtml(state.nickname)}</h3>
        ${meter("HP", state.hp, state.maxHp)}
        ${meter("Mana", state.mana, state.maxMana)}
      </article>

      <div class="versus">VS</div>

      <article class="combatant enemy">
        <div class="combat-avatar">${enemy.boss ? "👑" : "👾"}</div>
        <h3>${enemy.name}</h3>
        <p>${enemy.boss ? "Boss" : "Monster"} • Lv.${enemy.level}</p>
        ${meter("Enemy HP", enemy.hp, enemy.maxHp)}
      </article>
    </section>

    <section class="rpg-card">
      <h3>Battle Commands</h3>
      <div class="battle-command-grid">
        <button data-act="attack">⚔️ Attack</button>
        <button data-act="skill">✨ ${state.skill}</button>
        <button data-act="ultimate">🌌 ${state.ultimate}</button>
        <button data-act="defend">🛡️ Defend</button>
        <button data-act="potion">🧪 Potion</button>
        <button data-act="mana">🔷 Mana Potion</button>
        <button data-act="auto">🤖 Auto Battle x3</button>
        <button data-act="flee">🏃 Flee</button>
      </div>
      <div class="rpg-log battle">${state.battleLog.map(x => `<p>${escapeHtml(x)}</p>`).join("")}</div>
    </section>
  `;

  page.querySelectorAll("[data-act]").forEach(btn => {
    btn.onclick = async () => {
      await battleAction(btn.dataset.act, context);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });
}

function renderDungeon(page, context) {
  page.innerHTML = `
    <section class="dungeon-grid">
      ${DUNGEONS.map(d => `
        <article class="dungeon-card biome-${d.biome} ${state.dungeonId === d.id ? "selected" : ""}">
          <span class="rpg-badge">Min Floor ${d.min}</span>
          <h3>${d.name}</h3>
          <p>Boss: <b>${d.boss}</b></p>
          <p>Signature drop: <b>${d.drop}</b></p>
          <button data-dungeon="${d.id}" ${state.floor < d.min ? "disabled" : ""}>
            ${state.dungeonId === d.id ? "Current Dungeon" : "Travel"}
          </button>
        </article>
      `).join("")}
    </section>

    <article class="rpg-card">
      <h3>Floor System</h3>
      <p>Every 10 floors has a boss. Higher floor means better EXP, gold, item rarity, and leaderboard rank.</p>
      <button id="nextFloor">Go Next Floor</button>
      <button id="bossRush">Boss Rush Key</button>
    </article>
  `;

  page.querySelectorAll("[data-dungeon]").forEach(btn => {
    btn.onclick = async () => {
      const d = dungeonById(btn.dataset.dungeon);
      state.dungeonId = d.id;
      state.zone = d.name;
      state.battle = makeEnemy(state.floor, state.dungeonId);
      await save(context, `Traveled to ${d.name}.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });

  page.querySelector("#nextFloor").onclick = async () => {
    state.floor++;
    state.rank = calcRank(state.floor);
    state.battle = makeEnemy(state.floor, state.dungeonId);
    incrementQuest("floor", 1);
    await pushWorldEvent({ type: "floor", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} reached floor ${state.floor}.` });
    await save(context, `Advanced to floor ${state.floor}.`);
    await syncWorld(context);
    renderShell(page.closest(".rpg-pro").parentElement, context);
  };

  page.querySelector("#bossRush").onclick = async () => {
    if ((state.inventory.riftKey || 0) <= 0) {
      log("You need Rift Key for Boss Rush.");
    } else {
      state.inventory.riftKey--;
      state.floor = Math.ceil(state.floor / 10) * 10;
      state.rank = calcRank(state.floor);
      state.battle = makeEnemy(state.floor, state.dungeonId, true);
      log("Boss Rush activated.");
    }
    await save(context);
    renderShell(page.closest(".rpg-pro").parentElement, context);
  };
}

function renderInventory(page, context) {
  page.innerHTML = `
    <section class="inventory-layout">
      <article class="rpg-card">
        <h3>Consumables</h3>
        <div class="rpg-inventory-grid">
          ${Object.entries(state.inventory).map(([k, v]) => `<div><span>${k}</span><b>x${v}</b></div>`).join("")}
        </div>
      </article>

      <article class="rpg-card">
        <h3>Equipment Bag</h3>
        <div class="item-list">
          ${(state.items || []).map((item, i) => `
            <div class="item-row rarity-${item.rarity}">
              <span>${item.name} [${item.rarity}]</span>
              <small>${item.slot} • ATK ${item.atk || 0} • DEF ${item.def || 0}</small>
              <button data-equip="${i}">Equip</button>
              <button data-sell="${i}">Sell</button>
            </div>
          `).join("") || "<p>No equipment yet. Fight monsters for drops.</p>"}
        </div>
      </article>

      <article class="rpg-card wide">
        <h3>Current Equipment</h3>
        ${equipmentLine(state.weapon)}
        ${equipmentLine(state.armor)}
      </article>
    </section>
  `;

  page.querySelectorAll("[data-equip]").forEach(btn => {
    btn.onclick = async () => {
      const item = state.items[Number(btn.dataset.equip)];
      if (!item) return;
      if (item.slot === "weapon") {
        state.items.push(state.weapon);
        state.weapon = item;
      } else {
        state.items.push(state.armor);
        state.armor = item;
      }
      state.items.splice(Number(btn.dataset.equip), 1);
      await save(context, `Equipped ${item.name}.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });

  page.querySelectorAll("[data-sell]").forEach(btn => {
    btn.onclick = async () => {
      const item = state.items[Number(btn.dataset.sell)];
      const price = rarityValue(item.rarity) * 45;
      state.gold += price;
      state.items.splice(Number(btn.dataset.sell), 1);
      await save(context, `Sold ${item.name} for ${price} gold.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });
}

function renderMarket(page, context) {
  state.market = state.market || [];

  page.innerHTML = `
    <section class="market-layout">
      <article class="rpg-card">
        <h3>NPC Shop</h3>
        <div class="shop-grid">
          <button data-buy="potion">Potion - 60g</button>
          <button data-buy="manaPotion">Mana Potion - 80g</button>
          <button data-buy="riftKey">Rift Key - 500g</button>
          <button data-buy="mystery">Mystery Gear - 750g</button>
        </div>
      </article>

      <article class="rpg-card">
        <h3>Player Trade Listing</h3>
        <p>Simulated listing tersimpan di save kamu. Cocok buat dikembangin jadi global market nanti.</p>
        <button id="listRandomItem">List Random Drop</button>
        <div class="item-list">
          ${state.market.map((m, i) => `
            <div class="item-row rarity-${m.rarity}">
              <span>${m.name}</span>
              <small>${m.price} gold</small>
              <button data-cancel="${i}">Cancel</button>
            </div>
          `).join("") || "<p>No listing.</p>"}
        </div>
      </article>
    </section>
  `;

  page.querySelectorAll("[data-buy]").forEach(btn => {
    btn.onclick = async () => {
      const k = btn.dataset.buy;
      const price = k === "potion" ? 60 : k === "manaPotion" ? 80 : k === "riftKey" ? 500 : 750;
      if (state.gold < price) return log("Not enough gold.");
      state.gold -= price;
      if (k === "mystery") {
        addDrop(true);
      } else {
        state.inventory[k] = (state.inventory[k] || 0) + 1;
      }
      await save(context, `Bought ${k}.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });

  page.querySelector("#listRandomItem").onclick = async () => {
    if (!state.items.length) return log("No item to list.");
    const item = state.items.shift();
    state.market.push({ ...item, price: rarityValue(item.rarity) * 120 });
    state.stats.trades++;
    await save(context, `Listed ${item.name} to market.`);
    renderShell(page.closest(".rpg-pro").parentElement, context);
  };

  page.querySelectorAll("[data-cancel]").forEach(btn => {
    btn.onclick = async () => {
      const item = state.market.splice(Number(btn.dataset.cancel), 1)[0];
      state.items.push(item);
      await save(context, `Canceled listing ${item.name}.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });
}

function renderWorld(page, context) {
  page.innerHTML = `
    <section class="world-layout">
      <article class="rpg-card world-map-card">
        <h3>Realtime World Map</h3>
        <div class="world-map" id="worldMap"></div>
      </article>

      <article class="rpg-card">
        <h3>Online Players</h3>
        <div id="worldPlayers" class="player-list">Loading...</div>
      </article>

      <article class="rpg-card wide">
        <h3>World Events</h3>
        <div id="worldEvents" class="rpg-log">Loading...</div>
      </article>
    </section>
  `;

  watchWorldPlayers((players) => {
    worldPlayers = players;
    const list = page.querySelector("#worldPlayers");
    const map = page.querySelector("#worldMap");
    if (!list || !map) return;

    const entries = Object.entries(players);
    list.innerHTML = entries.map(([uid, p]) => `
      <div class="player-online ${uid === context.user.uid ? "me" : ""}">
        <b>${escapeHtml(p.nickname || "unknown")}</b>
        <span>Lv.${p.level} • Floor ${p.floor} • ${p.job} • ${p.rank}</span>
      </div>
    `).join("") || "<p>No online players.</p>";

    map.innerHTML = entries.map(([uid, p], i) => `
      <div class="map-player ${uid === context.user.uid ? "me" : ""}" style="left:${12 + (i * 23) % 78}%; top:${18 + (i * 31) % 62}%;">
        <span>${uid === context.user.uid ? "You" : escapeHtml(p.nickname || "P")}</span>
      </div>
    `).join("");
  });

  watchWorldEvents((events) => {
    worldEvents = events;
    const box = page.querySelector("#worldEvents");
    if (!box) return;
    box.innerHTML = Object.values(events).reverse().slice(0, 20).map(e => `<p>${escapeHtml(e.text || "")}</p>`).join("") || "<p>No events.</p>";
  });
}

function renderQuests(page, context) {
  page.innerHTML = `
    <section class="quest-layout">
      ${(state.quests || []).map((q, i) => `
        <article class="rpg-card quest-card ${q.done ? "done" : ""}">
          <h3>${q.title}</h3>
          ${meter("Progress", q.progress, q.target)}
          <p>Reward: ${q.rewardGold} gold + ${q.rewardExp} EXP</p>
          <button data-claim="${i}" ${q.progress < q.target ? "disabled" : ""}>Claim Reward</button>
        </article>
      `).join("")}
    </section>
  `;

  page.querySelectorAll("[data-claim]").forEach(btn => {
    btn.onclick = async () => {
      const q = state.quests[Number(btn.dataset.claim)];
      if (!q || q.progress < q.target) return;
      state.gold += q.rewardGold;
      gainExp(q.rewardExp);
      q.progress = 0;
      q.target += 2;
      await pushWorldEvent({ type: "quest", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} completed quest: ${q.title}.` });
      await save(context, `Quest complete: ${q.title}.`);
      renderShell(page.closest(".rpg-pro").parentElement, context);
    };
  });
}

function renderLeaderboard(page) {
  const players = Object.values(worldPlayers || {}).sort((a, b) => (b.floor || 0) - (a.floor || 0) || (b.level || 0) - (a.level || 0));
  page.innerHTML = `
    <section class="rpg-card">
      <h3>Leaderboard</h3>
      <table class="leaderboard-table">
        <tr><th>#</th><th>Player</th><th>Job</th><th>Level</th><th>Floor</th><th>Rank</th></tr>
        ${players.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(p.nickname || "unknown")}</td>
            <td>${escapeHtml(p.job || "-")}</td>
            <td>${p.level || 1}</td>
            <td>${p.floor || 1}</td>
            <td>${p.rank || "F"}</td>
          </tr>
        `).join("") || `<tr><td colspan="6">Open World tab once to load online players.</td></tr>`}
      </table>
    </section>
  `;
}

async function battleAction(type, context) {
  if (type === "auto") {
    for (let i = 0; i < 3; i++) {
      await battleAction("attack", context, false);
      if (state.hp <= 1) break;
    }
    await save(context);
    return;
  }

  if (type === "flee") {
    state.energy = Math.max(0, state.energy - 8);
    state.battle = makeEnemy(state.floor, state.dungeonId);
    return save(context, "You escaped and found a new enemy.");
  }

  if (type === "potion") {
    if ((state.inventory.potion || 0) <= 0) return log("No potion left.");
    state.inventory.potion--;
    state.hp = Math.min(state.maxHp, state.hp + 75);
    return save(context, "Potion used.");
  }

  if (type === "mana") {
    if ((state.inventory.manaPotion || 0) <= 0) return log("No mana potion left.");
    state.inventory.manaPotion--;
    state.mana = Math.min(state.maxMana, state.mana + 65);
    return save(context, "Mana potion used.");
  }

  const enemy = state.battle || makeEnemy(state.floor, state.dungeonId);
  const isSkill = type === "skill";
  const isUlt = type === "ultimate";
  const isDefend = type === "defend";

  if (isSkill && state.mana < 22) return log("Not enough mana.");
  if (isUlt && state.mana < 60) return log("Not enough mana for ultimate.");
  if (state.energy < 5) return log("Not enough energy. Use Camp Rest.");

  if (isSkill) state.mana -= 22;
  if (isUlt) state.mana -= 60;
  state.energy = Math.max(0, state.energy - (isUlt ? 16 : 6));

  const crit = rand(1, 100) <= state.crit;
  let dmg = rand(totalAtk(), totalAtk() + 18 + state.floor);
  if (isSkill) dmg = Math.floor(dmg * 1.65);
  if (isUlt) dmg = Math.floor(dmg * 3.2);
  if (isDefend) dmg = Math.floor(dmg * 0.55);
  if (crit) dmg = Math.floor(dmg * 1.8);

  enemy.hp = Math.max(0, enemy.hp - dmg);

  if (enemy.hp <= 0) {
    const boss = enemy.boss;
    const gold = rand(70, 150) + state.floor * (boss ? 12 : 4);
    const exp = rand(90, 180) + state.floor * (boss ? 18 : 7);

    state.gold += gold;
    gainExp(exp);
    state.stats.monstersKilled++;
    if (boss) state.stats.bossesKilled++;

    incrementQuest("kill", 1);
    incrementQuest("drop", 1);

    const dropped = addDrop(boss);
    log(`${crit ? "CRITICAL! " : ""}${enemy.name} defeated. +${gold}g +${exp} EXP${dropped ? `, drop: ${dropped.name} [${dropped.rarity}]` : ""}.`);

    if (boss) {
      state.inventory.riftKey = (state.inventory.riftKey || 0) + 1;
      await pushWorldEvent({ type: "boss", uid: context.user.uid, nickname: state.nickname, text: `${state.nickname} defeated ${enemy.name} on floor ${state.floor}!` });
    }

    state.battle = makeEnemy(state.floor, state.dungeonId);
    await save(context);
    await syncWorld(context);
    return;
  }

  const enemyDmg = Math.max(1, rand(enemy.atk, enemy.atk + 12) - (isDefend ? totalDef() : Math.floor(totalDef() * 0.45)));
  state.hp = Math.max(1, state.hp - enemyDmg);

  log(`${crit ? "CRITICAL! " : ""}${isUlt ? state.ultimate : isSkill ? state.skill : isDefend ? "Counter Guard" : "Attack"} dealt ${dmg}. ${enemy.name} hit ${enemyDmg}.`);
  await save(context);
}

function normalizeState(context) {
  state.inventory = state.inventory || {};
  state.items = state.items || [];
  state.market = state.market || [];
  state.stats = state.stats || { monstersKilled: 0, bossesKilled: 0, itemsDropped: 0, trades: 0 };
  state.quests = state.quests || [
    { id: "q1", title: "Clear 3 dungeon floors", progress: 0, target: 3, rewardGold: 350, rewardExp: 120, done: false },
    { id: "q2", title: "Collect 5 monster drops", progress: 0, target: 5, rewardGold: 500, rewardExp: 180, done: false }
  ];
  state.weapon = typeof state.weapon === "string" ? { name: state.weapon, slot: "weapon", rarity: "F", atk: 3, def: 0 } : state.weapon;
  state.armor = typeof state.armor === "string" ? { name: state.armor, slot: "armor", rarity: "F", atk: 0, def: 3 } : state.armor;
  state.dungeonId = state.dungeonId || "crystal-cave";
  state.zone = dungeonById(state.dungeonId).name;
  state.subclass = state.subclass || JOBS[state.job]?.subclass?.[0] || "Adventurer";
  state.skill = state.skill || JOBS[state.job]?.skill || "Power Strike";
  state.ultimate = state.ultimate || JOBS[state.job]?.ult || "Limit Break";
  state.battle = state.battle || makeEnemy(state.floor || 1, state.dungeonId);
  state.battleLog = state.battleLog || [];
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
    zone: state.zone,
    hp: state.hp,
    maxHp: state.maxHp,
    email: context.user.email
  });
}

function makeEnemy(floor, dungeonId, forceBoss = false) {
  const d = dungeonById(dungeonId);
  const boss = forceBoss || floor % 10 === 0;
  const names = {
    glacier: ["Crystal Slime", "Frost Goblin", "Ice Puppet", "Shard Wolf"],
    volcano: ["Ash Imp", "Magma Hound", "Burning Golem", "Lava Wraith"],
    forest: ["Moon Treant", "Lunar Fox", "Dream Mantis", "Wild Ajin Shade"],
    void: ["Null Drone", "Void Eater", "Dark Seraphim", "Space Lich"],
    celestial: ["God Fragment", "Angel Automata", "Chrono Beast", "Reality Devourer"]
  };
  const list = names[d.biome] || names.glacier;
  const name = boss ? d.boss : list[floor % list.length];

  return {
    name,
    level: floor + (boss ? 8 : 0),
    boss,
    hp: (boss ? 260 : 95) + floor * (boss ? 24 : 11),
    maxHp: (boss ? 260 : 95) + floor * (boss ? 24 : 11),
    atk: (boss ? 28 : 12) + Math.floor(floor * 1.8),
    def: (boss ? 16 : 5) + Math.floor(floor / 3)
  };
}

function addDrop(force = false) {
  const chance = force ? 100 : rand(1, 100);
  if (chance < 35) return null;

  const rarityRoll = rand(1, 100) + Math.min(40, Math.floor(state.floor / 8));
  const rarity = rarityRoll > 125 ? "S" : rarityRoll > 105 ? "A" : rarityRoll > 85 ? "B" : rarityRoll > 65 ? "C" : rarityRoll > 45 ? "D" : rarityRoll > 25 ? "E" : "F";
  const candidates = ITEM_POOL.filter(x => x.rarity === rarity);
  const base = candidates.length ? candidates[rand(0, candidates.length - 1)] : ITEM_POOL[rand(0, ITEM_POOL.length - 1)];
  const item = {
    ...base,
    name: `${base.name} +${Math.max(0, Math.floor(state.floor / 25))}`,
    atk: (base.atk || 0) + Math.floor(state.floor / 15),
    def: (base.def || 0) + Math.floor(state.floor / 18),
    id: `item_${Date.now()}_${rand(100, 999)}`
  };
  state.items.push(item);
  state.stats.itemsDropped++;
  const d = dungeonById(state.dungeonId);
  state.inventory[d.drop] = (state.inventory[d.drop] || 0) + 1;
  return item;
}

function gainExp(amount) {
  state.exp += amount;
  while (state.exp >= needExp()) {
    state.exp -= needExp();
    state.level++;
    state.maxHp += 18;
    state.maxMana += 10;
    state.atk += 3;
    state.def += 2;
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    log(`Level up! You are now level ${state.level}.`);
  }
}

function incrementQuest(type, amount) {
  for (const q of state.quests || []) {
    if (type === "floor" && q.title.toLowerCase().includes("floor")) q.progress = Math.min(q.target, q.progress + amount);
    if (type === "drop" && q.title.toLowerCase().includes("drop")) q.progress = Math.min(q.target, q.progress + amount);
    if (type === "kill" && q.title.toLowerCase().includes("monster")) q.progress = Math.min(q.target, q.progress + amount);
  }
}

function log(text) {
  state.battleLog = [`[${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}] ${text}`, ...(state.battleLog || [])].slice(0, 12);
}

function dungeonById(id) {
  return DUNGEONS.find(d => d.id === id) || DUNGEONS[0];
}

function needExp() {
  return 100 + (state.level - 1) * 65;
}

function totalAtk() {
  return state.atk + (state.weapon?.atk || 0) + (state.armor?.atk || 0);
}

function totalDef() {
  return state.def + (state.weapon?.def || 0) + (state.armor?.def || 0);
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

function rarityValue(r) {
  return { F: 1, E: 2, D: 3, C: 5, B: 8, A: 13, S: 21 }[r] || 1;
}

function equipmentLine(item) {
  return `
    <div class="equipment-line rarity-${item.rarity}">
      <b>${item.name}</b>
      <span>${item.slot} • ${item.rarity} • ATK ${item.atk || 0} • DEF ${item.def || 0}</span>
    </div>
  `;
}

function meter(label, value, max) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return `<label class="rpg-meter-label">${label}: ${value}/${max}</label><div class="rpg-meter"><span style="width:${pct}%"></span></div>`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeHtml(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
