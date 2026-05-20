function getRank(floor){ return GAME_CONFIG.ranks.find(r => floor >= r.min && floor <= r.max)?.name || 'SSS'; }
function expToNext(level){ return Math.floor(80 + Math.pow(level, 1.72) * 35); }
function activeSubclass(player){
  const tree = GAME_CONFIG.jobs[player.job].subclasses;
  let active = null; tree.forEach(s => { if(player.floor >= s.at) active = s; }); return active;
}
function totalStats(player){
  const job = GAME_CONFIG.jobs[player.job].base;
  const race = GAME_CONFIG.races[player.race];
  const lvl = player.level;
  const stats = {
    maxHp: job.hp + race.hp + lvl*12,
    maxMp: job.mp + (race.mag*3) + lvl*5,
    atk: job.atk + race.atk + lvl*3,
    def: job.def + race.def + lvl*2,
    mag: job.mag + race.mag + lvl*3,
    spd: job.spd + race.spd + lvl*1.5
  };
  const sub = activeSubclass(player); if(sub) Object.entries(sub.bonus).forEach(([k,v])=> { stats[k === 'hp' ? 'maxHp' : k === 'mp' ? 'maxMp' : k] += v; });
  Object.values(player.equipment).filter(Boolean).forEach(item => Object.entries(item.stats).forEach(([k,v])=> stats[k]+=v));
  return Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,Math.floor(v)]));
}
function createPlayer(name, job, race){
  const p = { name, job, race, level:1, exp:0, floor:1, gold:250, potions:5, inventory:[], equipment:{weapon:null,armor:null,accessory:null}, enemy:null, log:[] };
  p.inventory.push(createItem(1, 'weapon', job)); p.inventory.push(createItem(1, 'armor', job)); p.hp = totalStats(p).maxHp; p.mp = totalStats(p).maxMp; return p;
}
function gainExp(player, amount){
  player.exp += amount; let up = 0;
  while(player.exp >= expToNext(player.level)){ player.exp -= expToNext(player.level); player.level++; up++; }
  if(up){ const s = totalStats(player); player.hp = s.maxHp; player.mp = s.maxMp; log(player, `LEVEL UP +${up}! HP dan MP dipulihkan.`); }
}
function log(player, text){ player.log.unshift(`[F${player.floor}] ${text}`); player.log = player.log.slice(0,80); }
