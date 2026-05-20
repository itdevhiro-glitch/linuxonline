const Store = {
  key:'floorbound-save-v1', boardKey:'floorbound-board-v1',
  save(data){ localStorage.setItem(this.key, JSON.stringify(data)); },
  load(){ try { return JSON.parse(localStorage.getItem(this.key)); } catch { return null; } },
  board(){ return JSON.parse(localStorage.getItem(this.boardKey) || '[]'); },
  pushBoard(player){
    const board = this.board().filter(x => x.name !== player.name);
    board.push({ name:player.name, job:player.job, race:player.race, floor:player.floor, rank:getRank(player.floor), level:player.level, gold:player.gold });
    board.sort((a,b)=> b.floor-a.floor || b.level-a.level || b.gold-a.gold);
    localStorage.setItem(this.boardKey, JSON.stringify(board.slice(0,20)));
  }
};
