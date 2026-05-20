function makeEnemy(floor){
  const boss = floor % 10 === 0;
  const name = boss ? GAME_CONFIG.bossNames[Math.floor(floor/10)%GAME_CONFIG.bossNames.length] : GAME_CONFIG.monsterFamilies[Math.floor(Math.random()*GAME_CONFIG.monsterFamilies.length)];
  const mult = boss ? 2.8 : 1;
  return { name: boss ? `BOSS: ${name}` : name, boss, maxHp:Math.floor((70+floor*18)*mult), hp:Math.floor((70+floor*18)*mult), atk:Math.floor((10+floor*3.8)*mult), def:Math.floor((4+floor*1.1)*mult), spd:Math.floor(5+floor*.4), exp:Math.floor((45+floor*18)*(boss?4.5:1)), gold:Math.floor((25+floor*8)*(boss?5:1)) };
}
function ensureEnemy(player){ if(!player.enemy || player.enemy.hp<=0) player.enemy = makeEnemy(player.floor); }
function playerDamage(player, type='basic'){
  const s = totalStats(player); let raw = s.atk;
  if(type==='skill1') raw = player.job==='Mage' ? s.mag*1.7 : player.job==='Support' ? s.mag*1.25+s.atk*.5 : s.atk*1.55;
  if(type==='skill2') raw = player.job==='Mage' ? s.mag*2.45 : player.job==='Support' ? s.mag*1.9 : s.atk*2.1;
  const crit = Math.random() < Math.min(.35, .05 + s.spd/550); return Math.floor((raw - player.enemy.def*.35) * (crit?1.8:1) * (0.85+Math.random()*.3));
}
function enemyDamage(player){ const s = totalStats(player); return Math.max(1, Math.floor((player.enemy.atk - s.def*.45) * (0.85+Math.random()*.35))); }
function useSkillCost(player, type){ const cost = type==='skill2'?28:14; if(type==='basic') return true; if(player.mp < cost){ log(player,'MP kurang untuk skill.'); return false; } player.mp -= cost; return true; }
function combatTurn(player, action){
  ensureEnemy(player); if(action==='potion'){ if(player.potions<=0) return log(player,'Potion habis.'); const heal=Math.floor(totalStats(player).maxHp*.42); player.potions--; player.hp=Math.min(totalStats(player).maxHp, player.hp+heal); log(player,`Potion dipakai, heal ${heal}.`); }
  else { if(!useSkillCost(player, action)) return; const dmg=Math.max(1, playerDamage(player, action)); player.enemy.hp -= dmg; log(player,`${action==='basic'?'Attack':action==='skill1'?'Skill I':'Skill II'} memberi ${dmg} damage ke ${player.enemy.name}.`); }
  if(player.enemy.hp<=0) return clearFloor(player);
  const edmg = enemyDamage(player); player.hp -= edmg; log(player,`${player.enemy.name} menyerang balik ${edmg} damage.`);
  if(player.hp<=0){ player.hp = Math.floor(totalStats(player).maxHp*.5); player.gold = Math.max(0, player.gold - Math.floor(player.gold*.12)); log(player,'Kalah. Kamu mundur, kehilangan 12% gold, HP dipulihkan 50%.'); }
}
function clearFloor(player){
  const e = player.enemy; gainExp(player, e.exp); player.gold += e.gold; player.floor++;
  if(Math.random() < (e.boss?.95:.45)){ const slot = GAME_CONFIG.itemSlots[Math.floor(Math.random()*3)]; const item = createItem(player.floor, slot, player.job); player.inventory.push(item); log(player,`Drop item: ${item.name} (${item.slot}).`); }
  if(player.floor % 7 === 0){ player.potions++; log(player,'Bonus supply: +1 potion.'); }
  log(player,`${e.name} dikalahkan. EXP +${e.exp}, Gold +${e.gold}. Lanjut Floor ${player.floor}.`);
  player.enemy = makeEnemy(player.floor); Store.pushBoard(player);
}
