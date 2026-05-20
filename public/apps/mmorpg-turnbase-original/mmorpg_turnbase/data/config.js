const GAME_CONFIG = {
  ranks: [
    { name:'F', min:1, max:24 }, { name:'E', min:25, max:49 }, { name:'D', min:50, max:79 },
    { name:'C', min:80, max:119 }, { name:'B', min:120, max:179 }, { name:'A', min:180, max:259 },
    { name:'S', min:260, max:349 }, { name:'SS', min:350, max:499 }, { name:'SSS', min:500, max:1000 }
  ],
  races: {
    Human: { hp: 20, atk: 3, def: 3, mag: 3, spd: 3, desc:'Seimbang, mudah naik level, cocok semua job.' },
    Dwarf: { hp: 35, atk: 4, def: 8, mag: -2, spd: -2, desc:'Tanky, kuat memakai heavy weapon dan armor.' },
    Demon: { hp: 15, atk: 7, def: 0, mag: 9, spd: 1, desc:'Damage tinggi, cocok burst dan lifesteal.' },
    Ajin: { hp: 10, atk: 5, def: 1, mag: 2, spd: 8, desc:'Cepat, evasion tinggi, cocok critical build.' },
    Elf: { hp: 5, atk: 2, def: 0, mag: 10, spd: 5, desc:'Magic dan akurasi tinggi, cocok ranged/caster.' }
  },
  jobs: {
    Warrior: {
      desc:'Frontliner dengan defense dan damage stabil.', weapon:['Sword','Axe','Greatsword'],
      base:{ hp:135, mp:35, atk:18, def:13, mag:3, spd:6 },
      subclasses:[
        { at:20, name:'Knight', bonus:{hp:35,def:10}, skill:'Guard Break' },
        { at:60, name:'Berserker', bonus:{atk:16,hp:25}, skill:'Rage Cleave' },
        { at:140, name:'Warlord', bonus:{atk:24,def:16}, skill:'King Strike' }
      ]
    },
    Archer: {
      desc:'Cepat, critical tinggi, bagus untuk farming.', weapon:['Bow','Crossbow','Dagger'],
      base:{ hp:95, mp:55, atk:15, def:7, mag:5, spd:17 },
      subclasses:[
        { at:20, name:'Ranger', bonus:{spd:8,atk:6}, skill:'Piercing Shot' },
        { at:60, name:'Sniper', bonus:{atk:18,spd:10}, skill:'Deadeye' },
        { at:140, name:'Windstalker', bonus:{spd:22,atk:18}, skill:'Tempest Volley' }
      ]
    },
    Mage: {
      desc:'Caster dengan magic burst besar tapi rapuh.', weapon:['Staff','Wand','Grimoire'],
      base:{ hp:75, mp:120, atk:5, def:4, mag:24, spd:8 },
      subclasses:[
        { at:20, name:'Elementalist', bonus:{mag:14,mp:30}, skill:'Flame Lance' },
        { at:60, name:'Arcanist', bonus:{mag:25,mp:55}, skill:'Arcane Nova' },
        { at:140, name:'Archmage', bonus:{mag:42,mp:90}, skill:'Meteor Archive' }
      ]
    },
    Support: {
      desc:'Healer-buffer, aman untuk push floor panjang.', weapon:['Mace','Tome','Wand'],
      base:{ hp:105, mp:95, atk:8, def:9, mag:16, spd:9 },
      subclasses:[
        { at:20, name:'Cleric', bonus:{mag:10,def:6}, skill:'Blessed Heal' },
        { at:60, name:'Oracle', bonus:{mag:18,mp:35}, skill:'Divine Seal' },
        { at:140, name:'Saint', bonus:{mag:30,def:18}, skill:'Heaven Mend' }
      ]
    }
  },
  itemClasses:['F','E','D','C','B','A','S'],
  itemSlots:['weapon','armor','accessory'],
  monsterFamilies:['Goblin','Slime','Wolf','Skeleton','Lizardman','Golem','Wraith','Orc','Harpy','Mimic','Dark Knight','Crystal Drake'],
  bossNames:['Ogre King','Abyss Hydra','Lich Baron','Inferno Behemoth','Frost Valkyrie','Demon Archon','Void Seraph','Ancient Dragon']
};
