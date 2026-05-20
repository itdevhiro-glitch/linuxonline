renderChoices(); bindUI();
createForm.onsubmit = e => { e.preventDefault(); player = createPlayer(playerName.value.trim(), jobSelect.value, raceSelect.value); onboarding.classList.remove('active'); game.classList.add('active'); log(player,'Karakter dibuat. Dungeon dimulai.'); render(); };
loadBtn.onclick = () => { const save=Store.load(); if(!save) return alert('Belum ada save.'); player=save; onboarding.classList.remove('active'); game.classList.add('active'); render(); };
