function seedMarket(floor=1){
  let market = JSON.parse(localStorage.getItem('floorbound-market-v1') || 'null');
  if(!market || market.length < 8){
    market = Array.from({length:14},(_,i)=> createItem(Math.max(1, floor + i*3), GAME_CONFIG.itemSlots[i%3], ['Warrior','Archer','Mage','Support'][i%4]));
    localStorage.setItem('floorbound-market-v1', JSON.stringify(market));
  }
  return market;
}
function saveMarket(m){ localStorage.setItem('floorbound-market-v1', JSON.stringify(m)); }
function sellItem(player, id){ const idx=player.inventory.findIndex(i=>i.id===id); if(idx<0) return; const item=player.inventory.splice(idx,1)[0]; player.gold += item.price; log(player,`Menjual ${item.name} seharga ${item.price} gold.`); }
function buyItem(player, id){ const m=seedMarket(player.floor); const idx=m.findIndex(i=>i.id===id); if(idx<0) return; const item=m[idx]; if(player.gold<item.price) return log(player,'Gold kurang untuk membeli item.'); player.gold-=item.price; player.inventory.push(item); m.splice(idx,1); saveMarket(m); log(player,`Membeli ${item.name}.`); }
function equipItem(player, id){ const idx=player.inventory.findIndex(i=>i.id===id); if(idx<0) return; const item=player.inventory.splice(idx,1)[0]; const old=player.equipment[item.slot]; if(old) player.inventory.push(old); player.equipment[item.slot]=item; const s=totalStats(player); player.hp=Math.min(player.hp,s.maxHp); player.mp=Math.min(player.mp,s.maxMp); log(player,`Equip ${item.name} pada slot ${item.slot}.`); }
