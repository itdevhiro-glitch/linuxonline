const $ = s => document.querySelector(s);
let player = null;
function renderChoices(){
  jobSelect.innerHTML=Object.keys(GAME_CONFIG.jobs).map(j=>`<option>${j}</option>`).join('');
  raceSelect.innerHTML=Object.keys(GAME_CONFIG.races).map(r=>`<option>${r}</option>`).join('');
  const update=()=>{ const j=GAME_CONFIG.jobs[jobSelect.value], r=GAME_CONFIG.races[raceSelect.value]; choicePreview.innerHTML=`<b>${jobSelect.value}</b> — ${j.desc}<br><b>${raceSelect.value}</b> — ${r.desc}<br><small>Subclass: ${j.subclasses.map(s=>`${s.name}@F${s.at}`).join(' → ')}</small>`; };
  jobSelect.onchange=update; raceSelect.onchange=update; update();
}
function itemCard(item, actionText='', action=''){
  return `<div class="item-card class-${item.class}"><div><b>${item.name}</b><small>${item.slot.toUpperCase()} · Class ${item.class} · ${statText(item)} · ${item.price}G</small></div>${action?`<button data-action="${action}" data-id="${item.id}">${actionText}</button>`:''}</div>`;
}
function render(){ if(!player) return; ensureEnemy(player); Store.save(player); seedMarket(player.floor);
  const s=totalStats(player), e=player.enemy; charTitle.textContent=`${player.name} · ${player.race} ${player.job} · Lv.${player.level}`; floorLabel.textContent=`Floor ${player.floor}`; rankBadge.textContent=getRank(player.floor);
  playerHpBar.style.width=`${Math.max(0,player.hp/s.maxHp*100)}%`; enemyHpBar.style.width=`${Math.max(0,e.hp/e.maxHp*100)}%`;
  monsterCard.innerHTML=`<p class="eyebrow">${e.boss?'Boss Encounter':'Monster Encounter'}</p><h2>${e.name}</h2><p>HP ${Math.max(0,e.hp)}/${e.maxHp} · ATK ${e.atk} · DEF ${e.def} · Reward ${e.exp} EXP / ${e.gold} Gold</p>`;
  battleLog.innerHTML=player.log.map(x=>`<p>${x}</p>`).join('');
  statsBox.innerHTML=Object.entries({Rank:getRank(player.floor),Floor:player.floor,Level:player.level,EXP:`${player.exp}/${expToNext(player.level)}`,Gold:player.gold,Potion:player.potions,HP:`${player.hp}/${s.maxHp}`,MP:`${player.mp}/${s.maxMp}`,ATK:s.atk,DEF:s.def,MAG:s.mag,SPD:s.spd}).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
  subclassBox.innerHTML=GAME_CONFIG.jobs[player.job].subclasses.map(sc=>`<div class="sub ${player.floor>=sc.at?'open':'locked'}"><b>${sc.name}</b><span>Unlock Floor ${sc.at}</span><p>Skill: ${sc.skill}</p></div>`).join('');
  equipBox.innerHTML=GAME_CONFIG.itemSlots.map(slot=> player.equipment[slot]? itemCard(player.equipment[slot]) : `<div class="empty-slot">${slot}: empty</div>`).join('');
  inventoryBox.innerHTML=player.inventory.length?player.inventory.map(i=>itemCard(i,'Equip','equip')).join(''):'<p>Inventory kosong.</p>';
  sellBox.innerHTML=player.inventory.length?player.inventory.map(i=>itemCard(i,'Sell','sell')).join(''):'<p>Tidak ada barang untuk dijual.</p>';
  marketBox.innerHTML=seedMarket(player.floor).map(i=>itemCard(i,'Buy','buy')).join('');
  const board=Store.board(); leaderboardBox.innerHTML=`<table><thead><tr><th>#</th><th>Name</th><th>Build</th><th>Floor</th><th>Rank</th><th>Lv</th></tr></thead><tbody>${board.map((b,i)=>`<tr><td>${i+1}</td><td>${b.name}</td><td>${b.race} ${b.job}</td><td>${b.floor}</td><td>${b.rank}</td><td>${b.level}</td></tr>`).join('')}</tbody></table>`;
}
function bindUI(){
  document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{ document.querySelectorAll('.tab,.tab-page').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $(`#tab-${btn.dataset.tab}`).classList.add('active'); render(); });
  attackBtn.onclick=()=>{combatTurn(player,'basic');render();}; skill1Btn.onclick=()=>{combatTurn(player,'skill1');render();}; skill2Btn.onclick=()=>{combatTurn(player,'skill2');render();}; potionBtn.onclick=()=>{combatTurn(player,'potion');render();};
  document.body.addEventListener('click',e=>{ const b=e.target.closest('button[data-action]'); if(!b)return; if(b.dataset.action==='equip')equipItem(player,b.dataset.id); if(b.dataset.action==='sell')sellItem(player,b.dataset.id); if(b.dataset.action==='buy')buyItem(player,b.dataset.id); render(); });
}
