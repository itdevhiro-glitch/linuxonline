const ITEM_NAMES = {
  weapon:['Iron Fang','Moon Edge','Ashen Bow','Rune Staff','Sacred Tome','Dragonbone Axe','Void Grimoire','Crystal Spear'],
  armor:['Traveler Coat','Chainmail','Dwarf Plate','Shadow Robe','Ajin Vest','Elf Guard','Demon Scale','Saint Mantle'],
  accessory:['Copper Ring','Wolf Charm','Mana Core','Lucky Feather','Obsidian Seal','Royal Crest','Phoenix Gem','Abyss Eye']
};
function itemClassByFloor(floor){
  if(floor>=300) return 'S'; if(floor>=200) return 'A'; if(floor>=120) return 'B'; if(floor>=70) return 'C'; if(floor>=35) return 'D'; if(floor>=15) return 'E'; return 'F';
}
function classMult(cls){ return {F:1,E:1.35,D:1.8,C:2.4,B:3.2,A:4.3,S:6}[cls] || 1; }
function createItem(floor, slot, job='Warrior'){
  const cls = itemClassByFloor(floor + Math.floor(Math.random()*12)); const mult = classMult(cls); const lvl = Math.max(1, floor);
  const name = ITEM_NAMES[slot][Math.floor(Math.random()*ITEM_NAMES[slot].length)];
  const stats = { maxHp:0, maxMp:0, atk:0, def:0, mag:0, spd:0 };
  if(slot==='weapon') { stats.atk = Math.floor((6+lvl*.45)*mult); stats.mag = GAME_CONFIG.jobs[job].weapon.includes('Staff') || job==='Mage' ? Math.floor((4+lvl*.35)*mult) : 0; }
  if(slot==='armor') { stats.def = Math.floor((5+lvl*.4)*mult); stats.maxHp = Math.floor((18+lvl*2)*mult); }
  if(slot==='accessory') { stats.spd = Math.floor((2+lvl*.18)*mult); stats.maxMp = Math.floor((12+lvl*1.2)*mult); stats.mag = Math.floor((2+lvl*.2)*mult); }
  return { id:crypto.randomUUID(), name:`${cls}-${name}`, slot, class:cls, floor, price:Math.floor((60+lvl*15)*mult), stats };
}
function statText(item){ return Object.entries(item.stats).filter(([_,v])=>v>0).map(([k,v])=>`${k}+${v}`).join(' · '); }
