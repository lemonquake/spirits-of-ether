import { create } from 'zustand';

export const ENEMY_TEMPLATES = {
  slime: {
    type: 'slime',
    name: 'Void Slime',
    maxHp: 120,
    attack: 10,
    defense: 4,
    speed: 10,
    skills: [
      { id: 'slime_tackle', name: 'Acid Tackle', type: 'attack' },
      { id: 'slime_acid', name: 'Slime Spit', type: 'spell' },
      { id: 'slime_shield', name: 'Acid Bubble', type: 'def' }
    ]
  },
  skeleton_grunt: {
    type: 'skeleton_grunt',
    name: 'Skeleton Grunt',
    maxHp: 200,
    attack: 16,
    defense: 10,
    speed: 12,
    skills: [
      { id: 'bone_slash', name: 'Bone Slash', type: 'attack' },
      { id: 'void_summon', name: 'Void Summon', type: 'spell' },
      { id: 'shield_wall', name: 'Shield Wall', type: 'def' }
    ]
  },
  finster_krab: {
    type: 'finster_krab',
    name: 'Finster Krab',
    maxHp: 160,
    attack: 12,
    defense: 8,
    speed: 10,
    skills: [
      { id: 'claw_pinch', name: 'Claw Pinch', type: 'attack' },
      { id: 'bubble_foam', name: 'Bubble Foam', type: 'spell' },
      { id: 'hard_shell', name: 'Hard Shell', type: 'def' }
    ]
  },
  torchoise: {
    type: 'torchoise',
    name: 'Volcanic Torchoise',
    maxHp: 220,
    attack: 14,
    defense: 14,
    speed: 7,
    skills: [
      { id: 'flame_charge', name: 'Flame Charge', type: 'attack' },
      { id: 'lava_spit', name: 'Lava Spit', type: 'spell' },
      { id: 'withdraw', name: 'Withdraw', type: 'def' }
    ]
  },
  sand_snake: {
    type: 'sand_snake',
    name: 'Sand Snake',
    maxHp: 130,
    attack: 16,
    defense: 5,
    speed: 15,
    skills: [
      { id: 'venomous_bite', name: 'Venomous Bite', type: 'attack' },
      { id: 'sand_storm', name: 'Sandstorm', type: 'spell' },
      { id: 'coil', name: 'Coil', type: 'def' }
    ]
  }
};

export const ENCOUNTERS = {
  enemy_void_1: [
    { type: 'slime', levelOffset: 0 },
    { type: 'slime', levelOffset: -1 }
  ],
  enemy_void_2: [
    { type: 'skeleton_grunt', levelOffset: 0 },
    { type: 'slime', levelOffset: 0 }
  ],
  enemy_void_3: [
    { type: 'skeleton_grunt', levelOffset: 0 },
    { type: 'skeleton_grunt', levelOffset: 0 }
  ],
  enemy_krab_1: [
    { type: 'finster_krab', levelOffset: 0 },
    { type: 'finster_krab', levelOffset: -1 }
  ],
  enemy_krab_2: [
    { type: 'finster_krab', levelOffset: 0 },
    { type: 'sand_snake', levelOffset: 0 }
  ],
  enemy_torchoise_1: [
    { type: 'torchoise', levelOffset: 0 },
    { type: 'slime', levelOffset: 0 }
  ],
  enemy_boss_anomaly: [
    { type: 'torchoise', levelOffset: 1 },
    { type: 'sand_snake', levelOffset: 0 },
    { type: 'skeleton_grunt', levelOffset: 0 }
  ]
};

const processKills = (oldEnemies, newEnemies, quest) => {
  if (!quest || quest.state !== 'ACTIVE') return quest;
  const updatedQuest = { ...quest };
  newEnemies.forEach((newEnemy) => {
    const oldEnemy = oldEnemies.find(e => e.id === newEnemy.id);
    if (oldEnemy && oldEnemy.hp > 0 && newEnemy.hp <= 0) {
      updatedQuest.slainCount = Math.min(updatedQuest.targetCount, (updatedQuest.slainCount || 0) + 1);
    }
  });
  return updatedQuest;
};

export const recalculateCharacterStats = (char, inventory) => {
  const updatedChar = { ...char };
  updatedChar.stats = { ...updatedChar.baseStats };
  updatedChar.maxHp = updatedChar.baseMaxHp;
  updatedChar.maxMp = updatedChar.baseMaxMp;

  // Find equipped weapon
  const weapon = inventory.find(i => i.type === 'weapon' && i.equipped && i.targetChar === char.name);
  if (weapon && weapon.stats) {
    Object.keys(weapon.stats).forEach(stat => {
      if (stat === 'maxHp') updatedChar.maxHp += weapon.stats[stat];
      else if (stat === 'maxMp') updatedChar.maxMp += weapon.stats[stat];
      else updatedChar.stats[stat] = (updatedChar.baseStats[stat] || 0) + weapon.stats[stat];
    });
  }

  // Find equipped accessory
  const accessory = inventory.find(i => i.type === 'accessory' && i.equipped && i.targetChar === char.name);
  if (accessory && accessory.stats) {
    Object.keys(accessory.stats).forEach(stat => {
      if (stat === 'maxHp') updatedChar.maxHp += accessory.stats[stat];
      else if (stat === 'maxMp') updatedChar.maxMp += accessory.stats[stat];
      else updatedChar.stats[stat] = (updatedChar.baseStats[stat] || 0) + accessory.stats[stat];
    });
  }

  // Clamp current hp/mp
  updatedChar.hp = Math.min(updatedChar.hp, updatedChar.maxHp);
  updatedChar.mp = Math.min(updatedChar.mp, updatedChar.maxMp);

  return updatedChar;
};

// Initial inventory state to calculate starting stats
export const INITIAL_INVENTORY = [
  { id: 'ether_elixir', name: 'Ether Elixir', type: 'consumable', count: 5, effect: 'MP +50', description: 'A glowing vial containing liquid ether. Tastes like cold stardust.', value: 50, valueType: 'mp' },
  { id: 'health_flask', name: 'Health Flask', type: 'consumable', count: 4, effect: 'HP +70', description: 'Condensed spirit energy that heals flesh and spirit.', value: 70, valueType: 'hp' },
  { id: 'celestial_feather', name: 'Celestial Feather', type: 'consumable', count: 2, effect: 'Revive (50% HP)', description: 'A warm, glowing feather from an astral beast. Revives fallen allies.', value: 0, valueType: 'revive' },
  { id: 'ether_blade', name: 'Ether Blade', type: 'weapon', count: 1, stats: { attack: 12 }, description: 'A sword forged from crystallized ether. Vibrates with magical resonance.', targetChar: 'Azrin', equipped: true },
  { id: 'astral_staff', name: 'Astral Staff', type: 'weapon', count: 1, stats: { ether: 15 }, description: 'A staff made of starlight crystal, channeling ether perfectly.', targetChar: 'Azrael', equipped: true },
  { id: 'glowing_pendant', name: 'Glowing Pendant', type: 'accessory', count: 1, stats: { defense: 6, maxMp: 15 }, description: 'Emits a soothing aura that increases defense and max MP.', equipped: false }
];

const INITIAL_CHARACTERS = {
  Azrin: {
    name: 'Azrin',
    title: 'Ether Blade Master',
    level: 5,
    sp: 0,
    hp: 120,
    baseMaxHp: 120,
    maxHp: 120,
    mp: 60,
    baseMaxMp: 60,
    maxMp: 60,
    xp: 45,
    maxXp: 100,
    baseStats: {
      attack: 24,
      defense: 12,
      speed: 15,
      ether: 8,
    },
    stats: {
      attack: 24,
      defense: 12,
      speed: 15,
      ether: 8,
    },
    skills: [
      { id: 'ether_slash', name: 'Ether Slash', level: 1, mpCost: 15, damageMultiplier: 1.8, description: 'Infuses blade with raw ether for a quick slashing strike (deals 1.8x Ether dmg) and reduces enemy defense.', type: 'attack' },
      { id: 'blade_dance', name: 'Blade Dance', level: 1, mpCost: 30, damageMultiplier: 2.5, description: 'A rapid flurry of visual strikes dealing heavy damage (deals 2.5x Ether dmg) and boosts attack.', type: 'attack' },
      { id: 'ether_shield', name: 'Ether Shield', level: 1, mpCost: 10, buffValue: 10, description: 'Calls an ether shield to boost defense by 10 for 3 turns.', type: 'heal' }
    ],
    effects: [],
    equippedWeapon: 'ether_blade',
    equippedAccessory: null,
    avatarColor: '#4e9eff',
    lore: 'A fiercely determined warrior who controls physical ether energy. Her sword strikes are charged with the flow of spirits.'
  },
  Azrael: {
    name: 'Azrael',
    title: 'Astral Spiritweaver',
    level: 5,
    sp: 0,
    hp: 90,
    baseMaxHp: 90,
    maxHp: 90,
    mp: 120,
    baseMaxMp: 120,
    maxMp: 120,
    xp: 45,
    maxXp: 100,
    baseStats: {
      attack: 10,
      defense: 8,
      speed: 18,
      ether: 28,
    },
    stats: {
      attack: 10,
      defense: 8,
      speed: 18,
      ether: 28,
    },
    skills: [
      { id: 'astral_heal', name: 'Astral Heal', level: 1, mpCost: 12, healValue: 40, description: 'Calls upon the cosmos to heal an ally for 40 HP and grants Regen.', type: 'heal' },
      { id: 'nova_flare', name: 'Nova Flare', level: 1, mpCost: 20, damageMultiplier: 2.2, description: 'Summons ether fire to burn all foes for 3 turns (deals 2.2x Ether dmg).', type: 'attack' },
      { id: 'spirit_surge', name: 'Spirit Surge', level: 1, mpCost: 15, buffValue: 12, description: 'Channels starlight to boost ether power by 12 for 2 turns.', type: 'heal' }
    ],
    effects: [],
    equippedWeapon: 'astral_staff',
    equippedAccessory: null,
    avatarColor: '#b975ff',
    lore: 'Soft-spoken but carrying immense astral power. She can bridge the void to conjure healing stars or explosive flares.'
  }
};

// Calculate initial equipped stats
INITIAL_CHARACTERS.Azrin = recalculateCharacterStats(INITIAL_CHARACTERS.Azrin, INITIAL_INVENTORY);
INITIAL_CHARACTERS.Azrael = recalculateCharacterStats(INITIAL_CHARACTERS.Azrael, INITIAL_INVENTORY);

export const useGameStore = create((set, get) => ({
  // Core game states
  phase: 'MENU', // 'MENU' | 'EXPLORING' | 'COMBAT' | 'GAME_OVER'
  controlScheme: 'NORMAL', // 'NORMAL' | 'MOBILE'
  joystick: { x: 0, y: 0 },
  isPaused: false,
  activeCharacterIndex: 0, // 0 for Azrin, 1 for Azrael (in exploration or combat UI selection)
  defeatedEnemies: [], // IDs of enemies defeated in the overworld
  respawnQueue: [],
  quest: {
    state: 'NOT_STARTED', // 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED'
    slainCount: 0,
    targetCount: 5
  },
  dialogue: {
    active: false,
    speakerName: '',
    avatarType: '', // 'dadilo_alex'
    lines: [],
    currentLineIndex: 0,
    onComplete: null
  },
  playerPosition: [0, 0.5, 0], // Store player coordinates to return to after combat
  gold: 150,
  stamina: 100,
  maxStamina: 100,
  movementMode: 'WALK', // 'WALK' | 'RUN'
  isStaminaExhausted: false,

  // Characters
  characters: INITIAL_CHARACTERS,

  // Inventory
  inventory: INITIAL_INVENTORY,

  combat: {
    enemies: [], // Active enemies in current fight
    turnOrder: [], // list of character names/enemy ids
    activeTurnIndex: 0, // whose turn it is
    logs: [], // array of string text logs
    isPlayerTurn: true,
    targetIndex: 0, // index of enemy selected for attack
    battleResult: null, // 'victory' | 'defeat' | null
    animatingAction: null, // { attacker, action, target } for 3D anim triggers
    isTargeting: false,
    pendingAction: null,
    currentTargetUnit: null,
    floatingTexts: [],
    battlePhase: 'DECISION', // 'DECISION' | 'ACTION'
    decisionIndex: 0,
    queue: [],
    currentActor: null,
    nextActor: null,
    lastActionSummary: null
  },

  // State modifiers
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  startDialogue: (speakerName, avatarType, lines, onComplete) => set((state) => ({
    dialogue: {
      active: true,
      speakerName,
      avatarType,
      lines,
      currentLineIndex: 0,
      onComplete
    }
  })),
  nextDialogueLine: () => {
    const { dialogue } = get();
    if (!dialogue.active) return;
    if (dialogue.currentLineIndex + 1 >= dialogue.lines.length) {
      set((state) => ({
        dialogue: { ...state.dialogue, active: false }
      }));
      if (dialogue.onComplete) dialogue.onComplete();
    } else {
      set((state) => ({
        dialogue: { ...state.dialogue, currentLineIndex: state.dialogue.currentLineIndex + 1 }
      }));
    }
  },
  prevDialogueLine: () => {
    const { dialogue } = get();
    if (!dialogue.active) return;
    set((state) => ({
      dialogue: { ...state.dialogue, currentLineIndex: Math.max(0, dialogue.currentLineIndex - 1) }
    }));
  },
  acceptQuest: () => set((state) => ({
    quest: {
      ...state.quest,
      state: 'ACTIVE',
      slainCount: 0
    }
  })),
  completeQuest: () => set((state) => {
    const hasBook = state.inventory.some(i => i.id === 'book_of_claves');
    const updatedInventory = hasBook 
      ? state.inventory 
      : [...state.inventory, { 
          id: 'book_of_claves', 
          name: 'Book of the Claves', 
          type: 'consumable', 
          count: 1, 
          effect: 'Teach Passives', 
          description: 'An ancient magical tome. Using this teaches both Azrin and Azrael the passive skill "Mana Regeneration".', 
          value: 0, 
          valueType: 'learn_passive' 
        }];
    return {
      gold: state.gold + 300,
      inventory: updatedInventory,
      quest: {
        ...state.quest,
        state: 'COMPLETED'
      }
    };
  }),
  updateRespawns: () => {
    const { respawnQueue, defeatedEnemies } = get();
    if (respawnQueue.length === 0) return;
    const now = Date.now();
    const readyToRespawn = respawnQueue.filter(r => now >= r.respawnAt);
    if (readyToRespawn.length === 0) return;
    const readyIds = readyToRespawn.map(r => r.id);
    set((state) => ({
      respawnQueue: state.respawnQueue.filter(r => now < r.respawnAt),
      defeatedEnemies: state.defeatedEnemies.filter(id => !readyIds.includes(id))
    }));
  },
  setPhase: (phase) => set({ phase }),
  setControlScheme: (controlScheme) => set({ controlScheme }),
  setJoystick: (joystick) => set({ joystick }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setStamina: (stamina) => set({ stamina }),
  setMovementMode: (movementMode) => set({ movementMode }),
  setStaminaExhausted: (isStaminaExhausted) => set({ isStaminaExhausted }),
  toggleMovementMode: () => set((state) => {
    if (state.isStaminaExhausted) return { movementMode: 'WALK' };
    return { movementMode: state.movementMode === 'WALK' ? 'RUN' : 'WALK' };
  }),
  upgradeSkill: (charName, skillId) => set((state) => {
    const char = state.characters[charName];
    if (!char || char.sp === undefined || char.sp <= 0) return {};

    const updatedSkills = char.skills.map(skill => {
      if (skill.id !== skillId) return skill;
      const newLevel = (skill.level || 1) + 1;
      const updatedSkill = { ...skill, level: newLevel };

      if (skillId === 'mana_regeneration') {
        updatedSkill.description = `Regenerates ${newLevel} mana per 3 seconds.`;
      } else if (skillId === 'ether_slash') {
        updatedSkill.damageMultiplier = parseFloat((1.8 + 0.2 * (newLevel - 1)).toFixed(1));
        updatedSkill.description = `Infuses blade with raw ether for a quick slashing strike (deals ${updatedSkill.damageMultiplier}x Ether dmg) and reduces enemy defense.`;
      } else if (skillId === 'blade_dance') {
        updatedSkill.damageMultiplier = parseFloat((2.5 + 0.3 * (newLevel - 1)).toFixed(1));
        updatedSkill.description = `A rapid flurry of visual strikes dealing heavy damage (deals ${updatedSkill.damageMultiplier}x Ether dmg) and boosts attack.`;
      } else if (skillId === 'ether_shield') {
        updatedSkill.buffValue = 10 + 2 * (newLevel - 1);
        updatedSkill.description = `Calls an ether shield to boost defense by ${updatedSkill.buffValue} for 3 turns.`;
      } else if (skillId === 'astral_heal') {
        updatedSkill.healValue = 40 + 10 * (newLevel - 1);
        updatedSkill.description = `Calls upon the cosmos to heal an ally for ${updatedSkill.healValue} HP and grants Regen.`;
      } else if (skillId === 'nova_flare') {
        updatedSkill.damageMultiplier = parseFloat((2.2 + 0.2 * (newLevel - 1)).toFixed(1));
        updatedSkill.description = `Summons ether fire to burn all foes for 3 turns (deals ${updatedSkill.damageMultiplier}x Ether dmg).`;
      } else if (skillId === 'spirit_surge') {
        updatedSkill.buffValue = 12 + 3 * (newLevel - 1);
        updatedSkill.description = `Channels starlight to boost ether power by ${updatedSkill.buffValue} for 2 turns.`;
      }

      return updatedSkill;
    });

    const updatedChar = {
      ...char,
      sp: char.sp - 1,
      skills: updatedSkills
    };

    return {
      characters: {
        ...state.characters,
        [charName]: updatedChar
      }
    };
  }),

  // Inventory Actions
  useItem: (itemId, targetName) => set((state) => {
    const itemIndex = state.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return {};

    const item = state.inventory[itemIndex];
    if (item.type !== 'consumable' || item.count <= 0) return {};

    const targetChar = state.characters[targetName];
    if (!targetChar && item.valueType !== 'learn_passive') return {};

    const updatedChar = targetChar ? { ...targetChar } : null;
    let logMsg = '';
    let updatedCharacters = null;

    if (item.valueType === 'learn_passive') {
      const alreadyHas = Object.values(state.characters).some(c => 
        c.skills.some(s => s.id === 'mana_regeneration')
      );
      if (alreadyHas) return {}; // Already learned

      updatedCharacters = { ...state.characters };
      Object.keys(updatedCharacters).forEach(name => {
        const c = updatedCharacters[name];
        if (!c.skills.some(s => s.id === 'mana_regeneration')) {
          updatedCharacters[name] = {
            ...c,
            skills: [
              ...c.skills,
              { 
                id: 'mana_regeneration', 
                name: 'Mana Regeneration', 
                level: 1, 
                type: 'passive', 
                description: 'Regenerates 1 mana per 3 seconds.' 
              }
            ]
          };
        }
      });
      logMsg = `Used ${item.name}! Both Azrin and Azrael learned "Mana Regeneration"!`;
    } else if (item.valueType === 'hp') {
      if (updatedChar.hp <= 0) {
        return {}; // Can't heal dead characters with standard heal
      }
      updatedChar.hp = Math.min(updatedChar.maxHp, updatedChar.hp + item.value);
      logMsg = `Used ${item.name} on ${targetName}. Restored ${item.value} HP.`;
    } else if (item.valueType === 'mp') {
      updatedChar.mp = Math.min(updatedChar.maxMp, updatedChar.mp + item.value);
      logMsg = `Used ${item.name} on ${targetName}. Restored ${item.value} MP.`;
    } else if (item.valueType === 'revive') {
      if (updatedChar.hp > 0) return {}; // Can't revive living characters
      updatedChar.hp = Math.round(updatedChar.maxHp * 0.5);
      logMsg = `Used ${item.name} on ${targetName}. Revived with ${updatedChar.hp} HP!`;
    }

    // Decrement item count
    const updatedInventory = [...state.inventory];
    if (item.count === 1) {
      updatedInventory.splice(itemIndex, 1);
    } else {
      updatedInventory[itemIndex] = { ...item, count: item.count - 1 };
    }

    return {
      characters: updatedCharacters || {
        ...state.characters,
        [targetName]: updatedChar
      },
      inventory: updatedInventory,
      combat: state.phase === 'COMBAT' ? {
        ...state.combat,
        logs: [logMsg, ...state.combat.logs]
      } : state.combat
    };
  }),

  equipItem: (itemId, targetName) => set((state) => {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || (item.type !== 'weapon' && item.type !== 'accessory')) return {};

    const char = state.characters[targetName];
    if (!char) return {};

    // For weapons, verify target suitability (weapons are character-specific in this design)
    if (item.type === 'weapon' && item.targetChar && item.targetChar !== targetName) {
      return {}; // wrong character
    }

    const updatedInventory = state.inventory.map(invItem => {
      // Unequip item of the same type currently equipped on this character
      if (invItem.type === item.type && invItem.targetChar === targetName && invItem.equipped) {
        return { ...invItem, equipped: false };
      }
      // Equip the new item
      if (invItem.id === itemId) {
        return { ...invItem, equipped: true, targetChar: targetName };
      }
      return invItem;
    });

    const updatedChar = { ...char };
    if (item.type === 'weapon') {
      updatedChar.equippedWeapon = itemId;
    } else {
      updatedChar.equippedAccessory = itemId;
    }

    // Recalculate stats based on equipment
    const finalChar = recalculateCharacterStats(updatedChar, updatedInventory);

    return {
      inventory: updatedInventory,
      characters: {
        ...state.characters,
        [targetName]: finalChar
      }
    };
  }),

  // COMBAT Actions
  startCombat: (enemyId, enemyName, maxHp, attack, defense, speed) => set((state) => {
    let team = [];
    if (ENCOUNTERS[enemyId]) {
      team = ENCOUNTERS[enemyId].map((member, i) => {
        const template = ENEMY_TEMPLATES[member.type];
        const levelOffset = member.levelOffset || 0;
        const scaleFactor = 1 + levelOffset * 0.12;
        return {
          id: `${enemyId}_${i}`,
          type: member.type,
          name: `${template.name} ${String.fromCharCode(65 + i)}`,
          hp: Math.round(template.maxHp * scaleFactor),
          maxHp: Math.round(template.maxHp * scaleFactor),
          attack: Math.round(template.attack * scaleFactor),
          defense: Math.round(template.defense * scaleFactor),
          speed: Math.round(template.speed * scaleFactor),
          effects: [],
          skills: template.skills
        };
      });
    } else {
      team = [{
        id: enemyId,
        type: 'slime',
        name: enemyName,
        hp: maxHp,
        maxHp: maxHp,
        attack,
        defense,
        speed,
        effects: [],
        skills: ENEMY_TEMPLATES.slime.skills
      }];
    }

    const updatedCharacters = { ...state.characters };
    Object.keys(updatedCharacters).forEach(name => {
      updatedCharacters[name] = { ...updatedCharacters[name], effects: [] };
    });

    const participants = [
      { name: 'Azrin', speed: state.characters.Azrin.stats.speed },
      { name: 'Azrael', speed: state.characters.Azrael.stats.speed },
      ...team.map(enemy => ({ name: enemy.name, speed: enemy.speed, isEnemy: true, id: enemy.id }))
    ];

    participants.sort((a, b) => b.speed - a.speed);
    const turnOrder = participants.map(p => p.isEnemy ? p.id : p.name);
    
    const party = ['Azrin', 'Azrael'];
    let firstAliveHeroIdx = 0;
    while (firstAliveHeroIdx < party.length) {
      const name = party[firstAliveHeroIdx];
      if (updatedCharacters[name] && updatedCharacters[name].hp > 0) {
        break;
      }
      firstAliveHeroIdx++;
    }
    const firstHero = party[firstAliveHeroIdx] || 'Azrin';
    const activeTurnIndex = turnOrder.indexOf(firstHero) !== -1 ? turnOrder.indexOf(firstHero) : 0;

    const battleLog = [`An aggressive enemy squad approaches! Planning Phase: Select actions.`];

    return {
      phase: 'COMBAT',
      characters: updatedCharacters,
      combat: {
        encounterId: enemyId,
        enemies: team,
        turnOrder,
        activeTurnIndex,
        logs: battleLog,
        isPlayerTurn: true,
        targetIndex: 0,
        battleResult: null,
        animatingAction: null,
        isTargeting: false,
        pendingAction: null,
        currentTargetUnit: null,
        floatingTexts: [],
        battlePhase: 'DECISION',
        decisionIndex: firstAliveHeroIdx,
        queue: [],
        currentActor: null,
        nextActor: null,
        lastActionSummary: null
      }
    };
  }),

  startTargeting: (actionType, details) => set((state) => {
    const activeUnit = state.combat.turnOrder[state.combat.activeTurnIndex];
    
    // Determine default target based on action type
    let targetUnit;
    const isHeal = actionType === 'skill' && state.characters[activeUnit].skills.find(s => s.id === details?.skillId)?.type === 'heal';
    const isItemHeal = actionType === 'item' && state.inventory.find(i => i.id === details?.itemId)?.valueType === 'hp';
    const isItemMp = actionType === 'item' && state.inventory.find(i => i.id === details?.itemId)?.valueType === 'mp';
    const isItemRevive = actionType === 'item' && state.inventory.find(i => i.id === details?.itemId)?.valueType === 'revive';
    const isEtherShield = actionType === 'skill' && details?.skillId === 'ether_shield';
    
    const isHeroTarget = isHeal || isItemHeal || isItemMp || isItemRevive || isEtherShield;
    
    if (isHeroTarget) {
      // Default to self or first alive hero
      targetUnit = activeUnit;
    } else {
      // It's an attack skill or physical attack
      // Check if it's Nova Flare (multi-target)
      if (actionType === 'skill' && details?.skillId === 'nova_flare') {
        targetUnit = 'all_enemies';
      } else {
        // Default to first alive enemy
        const aliveEnemy = state.combat.enemies.find(e => e.hp > 0);
        targetUnit = aliveEnemy ? aliveEnemy.id : null;
      }
    }
    
    return {
      combat: {
        ...state.combat,
        isTargeting: true,
        pendingAction: { type: actionType, details },
        currentTargetUnit: targetUnit
      }
    };
  }),

  cancelTargeting: () => set((state) => ({
    combat: {
      ...state.combat,
      isTargeting: false,
      pendingAction: null,
      currentTargetUnit: null
    }
  })),

  selectTargetUnit: (unitId) => set((state) => ({
    combat: {
      ...state.combat,
      currentTargetUnit: unitId
    }
  })),

  confirmTargeting: () => {
    const { combat, queueSelectedAction, cancelTargeting } = get();
    if (!combat.pendingAction || !combat.currentTargetUnit) return;
    const { type, details } = combat.pendingAction;
    
    queueSelectedAction(type, { ...details, targetUnit: combat.currentTargetUnit });
    cancelTargeting();
  },

  selectEnemyTarget: (index) => set((state) => ({
    combat: { ...state.combat, targetIndex: index }
  })),

  queueSelectedAction: (actionType, details) => {
    set((state) => {
      const party = ['Azrin', 'Azrael'];
      const activeDecisionHero = party[state.combat.decisionIndex];
      if (!activeDecisionHero) return {};

      const newAction = {
        attacker: activeDecisionHero,
        type: actionType,
        details: { ...details }
      };

      const newQueue = [...state.combat.queue, newAction];
      
      // Decrement item count immediately if using an item
      let updatedInventory = state.inventory;
      if (actionType === 'item' && details.itemId) {
        const itemIndex = state.inventory.findIndex(i => i.id === details.itemId);
        if (itemIndex !== -1 && state.inventory[itemIndex].count > 0) {
          updatedInventory = [...state.inventory];
          const item = updatedInventory[itemIndex];
          if (item.count === 1) {
            updatedInventory.splice(itemIndex, 1);
          } else {
            updatedInventory[itemIndex] = { ...item, count: item.count - 1 };
          }
        }
      }

      return {
        inventory: updatedInventory,
        combat: {
          ...state.combat,
          queue: newQueue
        }
      };
    });

    get().advanceDecision();
  },

  undoLastDecision: () => {
    set((state) => {
      const party = ['Azrin', 'Azrael'];
      const currentQueue = [...state.combat.queue];
      if (currentQueue.length === 0) return {};

      // Get the popped action
      const poppedAction = currentQueue.pop();
      
      // Find the previous decision index in the party that is alive
      let prevIndex = state.combat.decisionIndex - 1;
      while (prevIndex >= 0) {
        const heroName = party[prevIndex];
        if (state.characters[heroName] && state.characters[heroName].hp > 0) {
          break;
        }
        prevIndex--;
      }

      if (prevIndex < 0) return {}; // Safety check

      // Restore item count if it was an item action
      let updatedInventory = state.inventory;
      if (poppedAction.type === 'item' && poppedAction.details.itemId) {
        updatedInventory = [...state.inventory];
        const itemIdx = updatedInventory.findIndex(i => i.id === poppedAction.details.itemId);
        if (itemIdx !== -1) {
          updatedInventory[itemIdx] = {
            ...updatedInventory[itemIdx],
            count: updatedInventory[itemIdx].count + 1
          };
        } else {
          // Re-add from INITIAL_INVENTORY templates
          const template = INITIAL_INVENTORY.find(i => i.id === poppedAction.details.itemId);
          if (template) {
            updatedInventory.push({ ...template, count: 1 });
          }
        }
      }

      const prevHero = party[prevIndex];
      const activeTurnIndex = state.combat.turnOrder.indexOf(prevHero);

      return {
        inventory: updatedInventory,
        combat: {
          ...state.combat,
          queue: currentQueue,
          decisionIndex: prevIndex,
          activeTurnIndex,
          isPlayerTurn: true
        }
      };
    });
  },

  advanceDecision: () => {
    const { combat, characters } = get();
    const party = ['Azrin', 'Azrael'];
    
    // Find next index in party that is alive
    let nextIndex = combat.decisionIndex + 1;
    while (nextIndex < party.length) {
      const heroName = party[nextIndex];
      if (characters[heroName] && characters[heroName].hp > 0) {
        break;
      }
      nextIndex++;
    }

    if (nextIndex < party.length) {
      // Set next hero as active deciding unit
      const nextHero = party[nextIndex];
      const activeTurnIndex = combat.turnOrder.indexOf(nextHero);
      
      set((state) => ({
        combat: {
          ...state.combat,
          decisionIndex: nextIndex,
          activeTurnIndex,
          isPlayerTurn: true
        }
      }));
    } else {
      // All player heroes have chosen. Now let enemy AI queue its action!
      get().queueEnemyActions();
    }
  },

  queueEnemyActions: () => {
    const { combat, characters } = get();
    const newQueue = [...combat.queue];

    combat.turnOrder.forEach((unitId) => {
      if (unitId.startsWith('enemy_') || combat.enemies.some(e => e.id === unitId)) {
        const enemy = combat.enemies.find(e => e.id === unitId);
        if (enemy && enemy.hp > 0) {
          const aliveHeroes = Object.keys(characters).filter(name => characters[name].hp > 0);
          if (aliveHeroes.length > 0) {
            const targetHero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
            const roll = Math.random();
            let actionType = 'attack';
            let skillId = null;
            let skillDetails = {};
            const template = ENEMY_TEMPLATES[enemy.type] || ENEMY_TEMPLATES.slime;

            if (roll < 0.60) {
              const skill = template.skills.find(s => s.type === 'attack');
              actionType = 'attack';
              skillId = skill ? skill.id : null;
              skillDetails = { targetUnit: targetHero, skillId };
            } else if (roll < 0.80) {
              const skill = template.skills.find(s => s.type === 'def');
              actionType = 'def';
              skillId = skill ? skill.id : null;
              skillDetails = { targetUnit: enemy.id, skillId };
            } else {
              const skill = template.skills.find(s => s.type === 'spell');
              actionType = 'skill';
              skillId = skill ? skill.id : null;
              if (skillId === 'sand_storm') {
                skillDetails = { targetUnit: 'all_heroes', skillId };
              } else {
                skillDetails = { targetUnit: targetHero, skillId };
              }
            }

            newQueue.push({
              attacker: unitId,
              type: actionType,
              details: skillDetails
            });
          }
        }
      }
    });

    // Sort queue based on turnOrder speed index
    newQueue.sort((a, b) => combat.turnOrder.indexOf(a.attacker) - combat.turnOrder.indexOf(b.attacker));

    // Transition to ACTION phase
    set((state) => ({
      combat: {
        ...state.combat,
        queue: newQueue,
        battlePhase: 'ACTION',
        activeExecutionIndex: 0,
        currentActor: null,
        nextActor: null,
        lastActionSummary: null
      }
    }));

    // Start execution after a small delay to let phase shift render
    setTimeout(() => {
      get().runExecutionStep();
    }, 800);
  },

  runExecutionStep: () => {
    const { combat, characters } = get();
    const { queue, activeExecutionIndex } = combat;

    // Check if queue is finished
    if (activeExecutionIndex >= queue.length) {
      get().startNewRound();
      return;
    }

    // Set current actor and next actor
    const currentAction = queue[activeExecutionIndex];
    const nextAction = activeExecutionIndex + 1 < queue.length ? queue[activeExecutionIndex + 1] : null;

    set((state) => ({
      combat: {
        ...state.combat,
        currentActor: currentAction.attacker,
        nextActor: nextAction ? nextAction.attacker : null
      }
    }));

    const attacker = currentAction.attacker;
    const isHero = !attacker.startsWith('enemy_');
    const attackerObj = isHero ? characters[attacker] : combat.enemies.find(e => e.id === attacker);

    // If attacker is dead, log skip and advance
    if (!attackerObj || attackerObj.hp <= 0) {
      const skipLog = `${isHero ? attacker : attackerObj.name} is defeated and cannot act!`;
      set((state) => ({
        combat: {
          ...state.combat,
          logs: [skipLog, ...state.combat.logs],
          lastActionSummary: {
            attacker: isHero ? attacker : attackerObj.name,
            type: 'skip',
            targets: [],
            logMsg: skipLog
          }
        }
      }));

      setTimeout(() => {
        get().advanceExecution();
      }, 1800);
      return;
    }

    // Redirect target if the targeted unit is dead!
    let targetUnit = currentAction.details?.targetUnit;
    let isRedirected = false;

    if (targetUnit) {
      if (targetUnit === 'all_enemies') {
        // Nova flare is multi-target, check if any enemies are alive
        const anyEnemyAlive = combat.enemies.some(e => e.hp > 0);
        if (!anyEnemyAlive) {
          // No targets left, skip
          const skipLog = `${isHero ? attacker : attackerObj.name} has no valid targets to strike!`;
          set((state) => ({
            combat: {
              ...state.combat,
              logs: [skipLog, ...state.combat.logs],
              lastActionSummary: {
                attacker: isHero ? attacker : attackerObj.name,
                type: 'skip',
                targets: [],
                logMsg: skipLog
              }
            }
          }));
          setTimeout(() => {
            get().advanceExecution();
          }, 1800);
          return;
        }
      } else {
        // Single target
        const isTargetHero = !targetUnit.startsWith('enemy_');
        const targetObj = isTargetHero ? characters[targetUnit] : combat.enemies.find(e => e.id === targetUnit);

        if (!targetObj || targetObj.hp <= 0) {
          // Target is dead! Redirect
          if (isTargetHero) {
            const aliveHeroes = Object.keys(characters).filter(name => characters[name].hp > 0);
            if (aliveHeroes.length > 0) {
              targetUnit = aliveHeroes[0]; // Redirect to first alive hero
              isRedirected = true;
            } else {
              targetUnit = null;
            }
          } else {
            const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
            if (aliveEnemies.length > 0) {
              targetUnit = aliveEnemies[0].id; // Redirect to first alive enemy
              isRedirected = true;
            } else {
              targetUnit = null;
            }
          }
        }
      }
    }

    if (!targetUnit && currentAction.details?.targetUnit !== 'all_enemies') {
      // No target left, skip
      const skipLog = `${isHero ? attacker : attackerObj.name} has no valid targets to strike!`;
      set((state) => ({
        combat: {
          ...state.combat,
          logs: [skipLog, ...state.combat.logs],
          lastActionSummary: {
            attacker: isHero ? attacker : attackerObj.name,
            type: 'skip',
            targets: [],
            logMsg: skipLog
          }
        }
      }));
      setTimeout(() => {
        get().advanceExecution();
      }, 1800);
      return;
    }

    // Update details with redirected target
    const resolvedAction = {
      ...currentAction,
      details: {
        ...currentAction.details,
        targetUnit
      }
    };

    // Execute the action math and trigger animation
    get().executeQueuedActionMath(resolvedAction, isRedirected);
  },

  executeQueuedActionMath: (action, isRedirected) => {
    const { combat, characters, inventory } = get();
    const attacker = action.attacker;
    const isEnemy = attacker.startsWith('enemy_');
    const targetUnit = action.details?.targetUnit;
    const type = action.type;
    const details = action.details;

    let logMsg = '';
    const newFloatingTexts = [...combat.floatingTexts];
    
    // Helpers
    const getPos = (nameOrId) => {
      if (nameOrId === 'Azrin') return [-2.5, 1.8, -2.0];
      if (nameOrId === 'Azrael') return [-2.5, 1.8, -0.8];
      
      const enemyIdx = combat.enemies.findIndex(e => e.id === nameOrId);
      if (enemyIdx !== -1) {
        const zCoord = enemyIdx === 0 ? -2.0 : (enemyIdx === 1 ? -3.2 : -0.8);
        return [2.5, 1.8, zCoord];
      }
      return [2.5, 2.0, -2.0];
    };

    const spawnFloatingText = (text, type, pos, delayMs = 360) => {
      const newText = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        text,
        type,
        position: pos,
        createdAt: Date.now()
      };
      if (delayMs > 0) {
        setTimeout(() => {
          set((state) => ({
            combat: {
              ...state.combat,
              floatingTexts: [...state.combat.floatingTexts, newText]
            }
          }));
        }, delayMs);
      } else {
        newFloatingTexts.push(newText);
      }
    };


    // Calculate effective stats considering buffs/debuffs
    const getEffectiveAttack = (unit) => {
      const base = unit.stats.attack;
      const buff = unit.effects?.find(e => e.id === 'attack_up')?.value || 0;
      return base + buff;
    };

    const getEffectiveDefense = (unit) => {
      const base = unit.stats.defense;
      const buff = unit.effects?.find(e => e.id === 'shield')?.value || 0;
      const debuff = unit.effects?.find(e => e.id === 'defense_down')?.value || 0;
      const decay = unit.effects?.find(e => e.id === 'void_decay')?.value || 0;
      return Math.max(0, base + buff - debuff - decay);
    };

    const getEffectiveEther = (unit) => {
      const base = unit.stats.ether;
      const buff = unit.effects?.find(e => e.id === 'surge')?.value || 0;
      return base + buff;
    };

    const getEnemyEffectiveDefense = (enemy) => {
      const base = enemy.defense;
      const buff = enemy.effects?.find(e => e.id === 'shield')?.value || 0;
      const debuff = enemy.effects?.find(e => e.id === 'defense_down')?.value || 0;
      return Math.max(0, base + buff - debuff);
    };

    if (isEnemy) {
      const enemy = combat.enemies.find(e => e.id === attacker);
      if (!enemy) {
        setTimeout(() => { get().advanceExecution(); }, 1200);
        return;
      }

      if (type === 'def') {
        let shieldVal = 8;
        let shieldName = 'Barrier';
        if (enemy.type === 'torchoise') {
          shieldVal = 14;
          shieldName = 'Shell Block';
        } else if (enemy.type === 'skeleton_grunt') {
          shieldVal = 12;
          shieldName = 'Shield Wall';
        } else if (enemy.type === 'finster_krab') {
          shieldVal = 10;
          shieldName = 'Hard Shell';
        } else if (enemy.type === 'sand_snake') {
          shieldVal = 6;
          shieldName = 'Sand Coil';
        }

        const newShield = {
          id: 'shield',
          name: shieldName,
          type: 'buff',
          duration: 2,
          value: shieldVal,
          description: `Protected by a shield. Increases defense by ${shieldVal}.`
        };

        const updatedEnemies = combat.enemies.map(e => {
          if (e.id === attacker) {
            return {
              ...e,
              effects: [...e.effects.filter(eff => eff.id !== 'shield'), newShield]
            };
          }
          return e;
        });

        logMsg = `${enemy.name} shields up with ${shieldName}, boosting defense by ${shieldVal} for 2 turns.`;
        spawnFloatingText('SHIELD UP', 'heal', getPos(attacker));

        set((state) => ({
          combat: {
            ...state.combat,
            enemies: updatedEnemies,
            logs: [logMsg, ...state.combat.logs],
            floatingTexts: newFloatingTexts,
            animatingAction: { attacker, type: 'def', damage: 0, target: attacker },
            lastActionSummary: {
              attacker: enemy.name,
              type: 'def',
              targets: [{
                name: enemy.name,
                damage: 0,
                isCrit: false,
                healing: 0,
                effectsApplied: [shieldName],
                defeated: false
              }],
              logMsg
            }
          }
        }));

        setTimeout(() => { get().advanceExecution(); }, 2400);
        return;
      }

      if (type === 'attack') {
        const targetHero = characters[targetUnit];
        if (!targetHero || targetHero.hp <= 0) {
          setTimeout(() => { get().advanceExecution(); }, 1200);
          return;
        }

        const isCrit = Math.random() < 0.10;
        const critMult = isCrit ? 2.0 : 1.0;
        const baseDmg = enemy.attack;
        const heroDef = getEffectiveDefense(targetHero);
        const dmg = Math.max(1, Math.round(((baseDmg * (1 + Math.random() * 0.25)) - heroDef * 0.5) * critMult));
        const updatedHeroHp = Math.max(0, targetHero.hp - dmg);

        logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
        let actionName = 'strikes';
        if (enemy.type === 'finster_krab') actionName = 'pinches';
        else if (enemy.type === 'torchoise') actionName = 'tackles';
        else if (enemy.type === 'sand_snake') actionName = 'bites';
        else if (enemy.type === 'skeleton_grunt') actionName = 'slashes';

        logMsg += isCrit
          ? `CRITICAL HIT! ${enemy.name} ${actionName} ${targetUnit} violently for ${dmg} damage!`
          : `${enemy.name} ${actionName} ${targetUnit} for ${dmg} damage!`;

        let effectApplied = null;
        let updatedEffects = [...(targetHero.effects || [])];
        if (enemy.type === 'skeleton_grunt' && Math.random() < 0.30) {
          effectApplied = {
            id: 'void_decay',
            name: 'Void Decay',
            type: 'debuff',
            duration: 3,
            value: 8,
            description: 'Void energy decays body and shield. Takes 8 damage per turn and loses 3 defense.'
          };
          updatedEffects = updatedEffects.filter(e => e.id !== 'void_decay');
          updatedEffects.push(effectApplied);
          logMsg += ` Applied Void Decay!`;
        }

        spawnFloatingText(
          isCrit ? `CRIT! ${dmg}` : `${dmg}`,
          isCrit ? 'critical' : 'physical',
          getPos(targetUnit)
        );

        if (effectApplied) {
          spawnFloatingText(effectApplied.name.toUpperCase(), 'debuff', targetUnit === 'Azrin' ? [-2.5, 2.1, -2.0] : [-2.5, 2.1, -0.8]);
        }

        set((state) => ({
          characters: {
            ...state.characters,
            [targetUnit]: {
              ...targetHero,
              hp: updatedHeroHp,
              effects: updatedEffects
            }
          },
          combat: {
            ...state.combat,
            logs: [logMsg, ...state.combat.logs],
            floatingTexts: newFloatingTexts,
            animatingAction: { attacker, type: 'attack', damage: dmg, target: targetUnit, isCrit },
            lastActionSummary: {
              attacker: enemy.name,
              type: 'attack',
              targets: [{
                name: targetUnit,
                damage: dmg,
                isCrit: isCrit,
                healing: 0,
                effectsApplied: effectApplied ? [effectApplied.name] : [],
                defeated: updatedHeroHp <= 0
              }],
              logMsg
            }
          }
        }));

        setTimeout(() => { get().advanceExecution(); }, 2400);
        return;
      }

      if (type === 'skill') {
        const skillId = details?.skillId;
        const skillName = ENEMY_TEMPLATES[enemy.type]?.skills.find(s => s.id === skillId)?.name || 'Spell';
        
        if (targetUnit === 'all_heroes') {
          const aliveHeroes = Object.keys(characters).filter(name => characters[name].hp > 0);
          const targetsHit = [];
          const updatedCharacters = { ...characters };
          
          aliveHeroes.forEach(name => {
            const hero = characters[name];
            const baseDmg = enemy.attack * 1.1;
            const heroDef = getEffectiveDefense(hero);
            const dmg = Math.max(1, Math.round((baseDmg * (1 + Math.random() * 0.2)) - heroDef * 0.4));
            const newHp = Math.max(0, hero.hp - dmg);
            
            const sandDebuff = {
              id: 'defense_down',
              name: 'Sand Blind',
              type: 'debuff',
              duration: 2,
              value: 4,
              description: 'Eyes blinded by sand. Defense reduced by 4.'
            };
            
            const updatedEffects = [...(hero.effects || []).filter(e => e.id !== 'defense_down'), sandDebuff];
            updatedCharacters[name] = {
              ...hero,
              hp: newHp,
              effects: updatedEffects
            };
            
            targetsHit.push({
              name,
              damage: dmg,
              isCrit: false,
              healing: 0,
              effectsApplied: ['Sand Blind'],
              defeated: newHp <= 0
            });
            spawnFloatingText(`${dmg}`, 'magic', getPos(name));
          });
          
          logMsg = `${enemy.name} conjures a blinding ${skillName}, sweeping across the party!`;
          
          set((state) => ({
            characters: updatedCharacters,
            combat: {
              ...state.combat,
              logs: [logMsg, ...state.combat.logs],
              floatingTexts: newFloatingTexts,
              animatingAction: { attacker, type: 'skill', details, damage: 0, target: 'all_heroes' },
              lastActionSummary: {
                attacker: enemy.name,
                type: 'skill',
                skillName,
                targets: targetsHit,
                logMsg
              }
            }
          }));
          
          setTimeout(() => { get().advanceExecution(); }, 2400);
          return;
        }

        const targetHero = characters[targetUnit];
        if (!targetHero || targetHero.hp <= 0) {
          setTimeout(() => { get().advanceExecution(); }, 1200);
          return;
        }

        let baseDmg = enemy.attack * 1.5;
        let debuffApplied = null;
        
        if (enemy.type === 'slime') {
          debuffApplied = {
            id: 'defense_down',
            name: 'Corrode',
            type: 'debuff',
            duration: 3,
            value: 5,
            description: 'Defense corroded by slime acid. Defense reduced by 5.'
          };
        } else if (enemy.type === 'finster_krab') {
          debuffApplied = {
            id: 'defense_down',
            name: 'Slow',
            type: 'debuff',
            duration: 2,
            value: 4,
            description: 'Coated in sticky bubble foam. Speed and defense reduced by 4.'
          };
        } else if (enemy.type === 'torchoise') {
          debuffApplied = {
            id: 'burn',
            name: 'Burn',
            type: 'debuff',
            duration: 3,
            value: 10,
            description: 'On fire from lava sparks. Takes 10 damage per turn.'
          };
        }

        const heroDef = getEffectiveDefense(targetHero);
        const dmg = Math.max(1, Math.round((baseDmg * (1 + Math.random() * 0.2)) - heroDef * 0.5));
        const updatedHeroHp = Math.max(0, targetHero.hp - dmg);
        
        let updatedEffects = [...(targetHero.effects || [])];
        if (debuffApplied) {
          updatedEffects = updatedEffects.filter(e => e.id !== debuffApplied.id);
          updatedEffects.push(debuffApplied);
        }

        logMsg = `${enemy.name} casts ${skillName} at ${targetUnit}, dealing ${dmg} magic damage!`;
        if (debuffApplied) logMsg += ` Applied ${debuffApplied.name}!`;

        spawnFloatingText(`${dmg}`, 'magic', getPos(targetUnit));
        if (debuffApplied) {
          spawnFloatingText(debuffApplied.name.toUpperCase(), 'debuff', targetUnit === 'Azrin' ? [-2.5, 2.1, -2.0] : [-2.5, 2.1, -0.8]);
        }

        set((state) => ({
          characters: {
            ...state.characters,
            [targetUnit]: {
              ...targetHero,
              hp: updatedHeroHp,
              effects: updatedEffects
            }
          },
          combat: {
            ...state.combat,
            logs: [logMsg, ...state.combat.logs],
            floatingTexts: newFloatingTexts,
            animatingAction: { attacker, type: 'skill', details, damage: dmg, target: targetUnit },
            lastActionSummary: {
              attacker: enemy.name,
              type: 'skill',
              skillName,
              targets: [{
                name: targetUnit,
                damage: dmg,
                isCrit: false,
                healing: 0,
                effectsApplied: debuffApplied ? [debuffApplied.name] : [],
                defeated: updatedHeroHp <= 0
              }],
              logMsg
            }
          }
        }));

        setTimeout(() => { get().advanceExecution(); }, 2400);
        return;
      }
    } else {
      const hero = characters[attacker];
      if (!hero) {
        setTimeout(() => { get().advanceExecution(); }, 1200);
        return;
      }

      let updatedMp = hero.mp;
      let dmg = 0;
      let isCrit = false;

      if (type === 'attack') {
        const enemyIdx = combat.enemies.findIndex(e => e.id === targetUnit);
        if (enemyIdx === -1 || combat.enemies[enemyIdx].hp <= 0) {
          setTimeout(() => { get().advanceExecution(); }, 1200);
          return;
        }
        const targetEnemy = combat.enemies[enemyIdx];

        isCrit = Math.random() < 0.20;
        const critMult = isCrit ? 2.0 : 1.0;

        const baseDmg = getEffectiveAttack(hero);
        const enemyDef = getEnemyEffectiveDefense(targetEnemy);
        dmg = Math.max(1, Math.round(((baseDmg * (1 + Math.random() * 0.2)) - enemyDef * 0.5) * critMult));

        logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
        logMsg += isCrit 
          ? `CRITICAL STRIKE! ${attacker} slashes ${targetEnemy.name} violently, dealing ${dmg} damage!`
          : `${attacker} slashes ${targetEnemy.name} with weapon, dealing ${dmg} damage!`;

        let updatedEnemies = [...combat.enemies];
        updatedEnemies[enemyIdx] = {
          ...targetEnemy,
          hp: Math.max(0, targetEnemy.hp - dmg)
        };

        spawnFloatingText(
          isCrit ? `CRIT! ${dmg}` : `${dmg}`,
          isCrit ? 'critical' : 'physical',
          getPos(targetUnit)
        );

        set((state) => ({
          quest: processKills(state.combat.enemies, updatedEnemies, state.quest),
          combat: {
            ...state.combat,
            enemies: updatedEnemies,
            logs: [logMsg, ...state.combat.logs],
            floatingTexts: newFloatingTexts,
            animatingAction: { attacker, type: 'attack', details, damage: dmg, target: targetUnit, isCrit },
            lastActionSummary: {
              attacker: attacker,
              type: 'attack',
              targets: [{
                name: targetEnemy.name,
                damage: dmg,
                isCrit: isCrit,
                healing: 0,
                effectsApplied: [],
                defeated: targetEnemy.hp - dmg <= 0
              }],
              logMsg
            }
          }
        }));

      } else if (type === 'skill') {
        const skill = hero.skills.find(s => s.id === details.skillId);
        if (!skill || hero.mp < skill.mpCost) {
          setTimeout(() => { get().advanceExecution(); }, 1200);
          return;
        }

        updatedMp -= skill.mpCost;

        spawnFloatingText(skill.name.toUpperCase() + '!', 'shout', getPos(attacker), 0);

        if (skill.type === 'attack') {
          if (targetUnit === 'all_enemies') {
            let updatedEnemies = [...combat.enemies];
            let targetsHit = [];
            
            updatedEnemies = updatedEnemies.map((enemy) => {
              if (enemy.hp <= 0) return enemy;
              
              const isSkillCrit = Math.random() < 0.15;
              const critMult = isSkillCrit ? 2.0 : 1.0;
              const baseDmg = getEffectiveEther(hero) * skill.damageMultiplier;
              const enemyDef = getEnemyEffectiveDefense(enemy);
              const singleDmg = Math.max(1, Math.round(((baseDmg * (1 + Math.random() * 0.2)) - enemyDef * 0.4) * critMult));

              targetsHit.push({ id: enemy.id, damage: singleDmg, isCrit: isSkillCrit });
              
              const newBurn = {
                id: 'burn',
                name: 'Burn',
                type: 'debuff',
                duration: 3,
                value: 12,
                description: 'Burning with celestial fire. Takes 12 damage per turn.'
              };
              const updatedEffects = [...(enemy.effects || []).filter(e => e.id !== 'burn'), newBurn];

              spawnFloatingText(
                isSkillCrit ? `CRIT! ${singleDmg}` : `${singleDmg}`,
                isSkillCrit ? 'critical' : 'magic',
                getPos(enemy.id)
              );

              return {
                ...enemy,
                hp: Math.max(0, enemy.hp - singleDmg),
                effects: updatedEffects
              };
            });

            const totalDmg = targetsHit.reduce((sum, t) => sum + t.damage, 0);
            const hitNames = combat.enemies.filter(e => e.hp > 0).map(e => e.name).join(', ');
            
            logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
            logMsg += `${attacker} casts ${skill.name}! Starfire bursts and incinerates ${hitNames} for a total of ${totalDmg} magic damage! Applied Burn!`;

            // Prepare target summaries
            const targetSummaries = targetsHit.map(t => {
              const tgtEnemy = combat.enemies.find(e => e.id === t.id);
              return {
                name: tgtEnemy ? tgtEnemy.name : t.id,
                damage: t.damage,
                isCrit: t.isCrit,
                healing: 0,
                effectsApplied: ['Burn'],
                defeated: tgtEnemy ? tgtEnemy.hp - t.damage <= 0 : false
              };
            });

            set((state) => ({
              quest: processKills(state.combat.enemies, updatedEnemies, state.quest),
              characters: {
                ...state.characters,
                [attacker]: { ...state.characters[attacker], mp: updatedMp }
              },
              combat: {
                ...state.combat,
                enemies: updatedEnemies,
                logs: [logMsg, ...state.combat.logs],
                floatingTexts: newFloatingTexts,
                animatingAction: { attacker, type: 'skill', details, damage: totalDmg, target: 'all_enemies', targetsHit },
                lastActionSummary: {
                  attacker: attacker,
                  type: 'skill',
                  skillName: skill.name,
                  targets: targetSummaries,
                  logMsg
                }
              }
            }));

          } else {
            const enemyIdx = combat.enemies.findIndex(e => e.id === targetUnit);
            if (enemyIdx === -1 || combat.enemies[enemyIdx].hp <= 0) {
              setTimeout(() => { get().advanceExecution(); }, 1200);
              return;
            }
            const targetEnemy = combat.enemies[enemyIdx];

            const isSkillCrit = Math.random() < 0.15;
            const critMult = isSkillCrit ? 2.0 : 1.0;
            
            let skillDmg = 0;
            let skillEffectApplied = null;

            if (skill.id === 'ether_slash') {
              const baseDmg = getEffectiveEther(hero) * skill.damageMultiplier;
              const enemyDef = getEnemyEffectiveDefense(targetEnemy);
              skillDmg = Math.max(1, Math.round(((baseDmg * (1 + Math.random() * 0.2)) - enemyDef * 0.4) * critMult));
              
              skillEffectApplied = {
                id: 'defense_down',
                name: 'Defense Down',
                type: 'debuff',
                duration: 3,
                value: 5,
                description: 'Defense reduced by 5.'
              };
              
              logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
              logMsg += `${attacker} casts ${skill.name}! Ether burst strikes ${targetEnemy.name} for ${skillDmg} magic damage and reduces defense!`;
            } else if (skill.id === 'blade_dance') {
              const baseDmg = getEffectiveAttack(hero) * skill.damageMultiplier;
              const enemyDef = getEnemyEffectiveDefense(targetEnemy);
              skillDmg = Math.max(1, Math.round(((baseDmg * (1 + Math.random() * 0.2)) - enemyDef * 0.5) * critMult));
              
              skillEffectApplied = {
                id: 'attack_up',
                name: 'Attack Up',
                type: 'buff',
                duration: 2,
                value: 8,
                description: 'Attack increased by 8.'
              };
              
              logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
              logMsg += `${attacker} executes ${skill.name}! A rapid flurry strikes ${targetEnemy.name} for ${skillDmg} damage and raises attack!`;
            }

            let updatedEnemies = [...combat.enemies];
            let updatedEnemyEffects = [...(targetEnemy.effects || [])];
            if (skillEffectApplied && skillEffectApplied.type === 'debuff') {
              updatedEnemyEffects = updatedEnemyEffects.filter(e => e.id !== skillEffectApplied.id);
              updatedEnemyEffects.push(skillEffectApplied);
            }

            updatedEnemies[enemyIdx] = {
              ...targetEnemy,
              hp: Math.max(0, targetEnemy.hp - skillDmg),
              effects: updatedEnemyEffects
            };

            spawnFloatingText(
              isSkillCrit ? `CRIT! ${skillDmg}` : `${skillDmg}`,
              isSkillCrit ? 'critical' : (skill.id === 'ether_slash' ? 'magic' : 'physical'),
              getPos(targetUnit)
            );

            let updatedCharacters = { ...characters };
            updatedCharacters[attacker] = {
              ...hero,
              mp: updatedMp
            };
            
            if (skillEffectApplied && skillEffectApplied.type === 'buff') {
              const currentEffects = [...(hero.effects || [])].filter(e => e.id !== skillEffectApplied.id);
              currentEffects.push(skillEffectApplied);
              updatedCharacters[attacker].effects = currentEffects;
              spawnFloatingText('ATTACK UP', 'buff', getPos(attacker));
            }

            set((state) => ({
              quest: processKills(state.combat.enemies, updatedEnemies, state.quest),
              characters: updatedCharacters,
              combat: {
                ...state.combat,
                enemies: updatedEnemies,
                logs: [logMsg, ...state.combat.logs],
                floatingTexts: newFloatingTexts,
                animatingAction: { attacker, type: 'skill', details, damage: skillDmg, target: targetUnit, isCrit: isSkillCrit },
                lastActionSummary: {
                  attacker: attacker,
                  type: 'skill',
                  skillName: skill.name,
                  targets: [{
                    name: targetEnemy.name,
                    damage: skillDmg,
                    isCrit: isSkillCrit,
                    healing: 0,
                    effectsApplied: skillEffectApplied && skillEffectApplied.type === 'debuff' ? [skillEffectApplied.name] : [],
                    defeated: targetEnemy.hp - skillDmg <= 0
                  }],
                  logMsg
                }
              }
            }));
          }

        } else if (skill.type === 'heal') {
          const targetChar = characters[targetUnit];
          if (!targetChar || targetChar.hp <= 0) {
            setTimeout(() => { get().advanceExecution(); }, 1200);
            return;
          }

          let healValue = 0;
          let skillEffectApplied = null;

          if (skill.id === 'astral_heal') {
            healValue = skill.healValue;
            skillEffectApplied = {
              id: 'regen',
              name: 'Regen',
              type: 'buff',
              duration: 3,
              value: 15,
              description: 'Regenerating 15 HP per turn.'
            };
            
            logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
            logMsg += `${attacker} uses ${skill.name} on ${targetUnit}, restoring ${healValue} HP and granting Regen!`;
          } else if (skill.id === 'ether_shield') {
            const buffVal = skill.buffValue || 10;
            skillEffectApplied = {
              id: 'shield',
              name: 'Shield',
              type: 'buff',
              duration: 3,
              value: buffVal,
              description: `Shielded. Defense increased by ${buffVal}.`
            };
            
            logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
            logMsg += `${attacker} casts ${skill.name} on ${targetUnit}, boosting defense by ${buffVal}!`;
          } else if (skill.id === 'spirit_surge') {
            const buffVal = skill.buffValue || 12;
            skillEffectApplied = {
              id: 'surge',
              name: 'Surge',
              type: 'buff',
              duration: 2,
              value: buffVal,
              description: `Surging with ether energy. Ether power increased by ${buffVal}.`
            };
            
            logMsg = isRedirected ? `[Target Lost! Redirected] ` : '';
            logMsg += `${attacker} casts ${skill.name} on ${targetUnit}, boosting ether power by ${buffVal}!`;
          }

          let updatedChar = { ...targetChar };
          if (healValue > 0) {
            updatedChar.hp = Math.min(targetChar.maxHp, targetChar.hp + healValue);
            spawnFloatingText(`+${healValue}`, 'heal', getPos(targetUnit));
          }

          if (skillEffectApplied) {
            const currentEffects = [...(targetChar.effects || [])].filter(e => e.id !== skillEffectApplied.id);
            currentEffects.push(skillEffectApplied);
            updatedChar.effects = currentEffects;
            spawnFloatingText(skillEffectApplied.name.toUpperCase(), 'buff', getPos(targetUnit));
          }

          set((state) => ({
            characters: {
              ...state.characters,
              [attacker]: { ...state.characters[attacker], mp: updatedMp },
              [targetUnit]: updatedChar
            },
            combat: {
              ...state.combat,
              logs: [logMsg, ...state.combat.logs],
              floatingTexts: newFloatingTexts,
              animatingAction: { attacker, type: 'skill', details, damage: 0, target: targetUnit },
              lastActionSummary: {
                attacker: attacker,
                type: 'skill',
                skillName: skill.name,
                targets: [{
                  name: targetUnit,
                  damage: 0,
                  isCrit: false,
                  healing: healValue,
                  effectsApplied: skillEffectApplied ? [skillEffectApplied.name] : [],
                  defeated: false
                }],
                logMsg
              }
            }
          }));
        }

      } else if (type === 'item') {
        const item = inventory.find(i => i.id === details.itemId) || 
                     INITIAL_INVENTORY.find(i => i.id === details.itemId);
        
        const targetChar = characters[targetUnit];
        if (item && targetChar) {
          let itemLog = isRedirected ? `[Target Lost! Redirected] ` : '';
          let updatedChar = { ...targetChar };

          if (item.valueType === 'hp') {
            updatedChar.hp = Math.min(updatedChar.maxHp, updatedChar.hp + item.value);
            itemLog += `${attacker} uses ${item.name} on ${targetUnit}, restoring ${item.value} HP.`;
            spawnFloatingText(`+${item.value}`, 'heal', getPos(targetUnit));
          } else if (item.valueType === 'mp') {
            updatedChar.mp = Math.min(updatedChar.maxMp, updatedChar.mp + item.value);
            itemLog += `${attacker} uses ${item.name} on ${targetUnit}, restoring ${item.value} MP.`;
            spawnFloatingText(`+${item.value} MP`, 'heal', getPos(targetUnit));
          } else if (item.valueType === 'revive') {
            updatedChar.hp = Math.round(updatedChar.maxHp * 0.5);
            itemLog += `${attacker} uses ${item.name} on ${targetUnit}! Revived with ${updatedChar.hp} HP.`;
            spawnFloatingText(`REVIVE!`, 'heal', getPos(targetUnit));
          }

          set((state) => ({
            characters: {
              ...state.characters,
              [targetUnit]: updatedChar
            },
            combat: {
              ...state.combat,
              logs: [itemLog, ...state.combat.logs],
              floatingTexts: newFloatingTexts,
              animatingAction: { attacker, type: 'item', details, damage: 0, target: targetUnit },
              lastActionSummary: {
                attacker: attacker,
                type: 'item',
                itemName: item.name,
                targets: [{
                  name: targetUnit,
                  damage: 0,
                  isCrit: false,
                  healing: item.valueType === 'hp' ? item.value : 0,
                  effectsApplied: item.valueType === 'revive' ? ['Revived'] : (item.valueType === 'mp' ? ['Restore MP'] : []),
                  defeated: false
                }],
                logMsg: itemLog
              }
            }
          }));
        }
      }
    }

    setTimeout(() => {
      get().advanceExecution();
    }, 3200);
  },

  advanceExecution: () => {
    const { combat, runExecutionStep } = get();
    
    const allEnemiesDead = combat.enemies.every(e => e.hp <= 0);
    if (allEnemiesDead) {
      set((state) => {
        const victoryLog = 'Victory! The enemies have been purified by Ether.';
        const enemyGold = 50;
        const xpGained = 20;
        const updatedCharacters = { ...state.characters };
        const levelUpLogs = [];

        Object.keys(updatedCharacters).forEach(name => {
          const char = { ...updatedCharacters[name], effects: [] };
          char.xp += xpGained;
          
          if (char.xp >= char.maxXp) {
            char.level += 1;
            char.sp = (char.sp || 0) + 1;
            char.xp = char.xp - char.maxXp;
            char.maxXp = Math.round(char.maxXp * 1.5);
            char.baseMaxHp = Math.round(char.baseMaxHp * 1.2);
            char.baseMaxMp = Math.round(char.baseMaxMp * 1.2);
            char.baseStats = {
              attack: Math.round(char.baseStats.attack * 1.25),
              defense: Math.round(char.baseStats.defense * 1.2),
              speed: Math.round(char.baseStats.speed * 1.15),
              ether: Math.round(char.baseStats.ether * 1.25)
            };
            const finalChar = recalculateCharacterStats(char, state.inventory);
            finalChar.hp = finalChar.maxHp;
            finalChar.mp = finalChar.maxMp;
            updatedCharacters[name] = finalChar;
            levelUpLogs.push(`${name} leveled up to Lv.${char.level}! Stats increased, fully restored & +1 Skill Point!`);
          } else {
            updatedCharacters[name] = char;
          }
        });

        return {
          gold: state.gold + enemyGold,
          defeatedEnemies: [...state.defeatedEnemies, state.combat.encounterId || state.combat.enemies[0].id],
          respawnQueue: (state.combat.encounterId && state.combat.encounterId !== 'enemy_boss_anomaly')
            ? [...state.respawnQueue, { id: state.combat.encounterId, respawnAt: Date.now() + 180000 }]
            : state.respawnQueue,
          characters: updatedCharacters,
          combat: {
            ...state.combat,
            battleResult: 'victory',
            logs: [victoryLog, ...levelUpLogs, ...state.combat.logs],
            animatingAction: null,
            currentActor: null,
            nextActor: null
          }
        };
      });
      return;
    }

    const allHeroesDead = Object.values(get().characters).every(c => c.hp <= 0);
    if (allHeroesDead) {
      const defeatLog = 'Defeat... The spirits have faded.';
      set((state) => {
        const updatedCharacters = { ...state.characters };
        Object.keys(updatedCharacters).forEach(name => {
          updatedCharacters[name] = { ...updatedCharacters[name], effects: [] };
        });
        return {
          characters: updatedCharacters,
          combat: {
            ...state.combat,
            battleResult: 'defeat',
            logs: [defeatLog, ...state.combat.logs],
            animatingAction: null,
            currentActor: null,
            nextActor: null
          }
        };
      });
      return;
    }

    set((state) => ({
      combat: {
        ...state.combat,
        activeExecutionIndex: state.combat.activeExecutionIndex + 1,
        animatingAction: null
      }
    }));

    runExecutionStep();
  },

  startNewRound: () => {
    const { characters, combat } = get();
    
    let charactersUpdate = { ...characters };
    let enemiesUpdate = [...combat.enemies];
    let effectLogs = [];
    const tickFloatingTexts = [];

    const getPos = (nameOrId) => {
      if (nameOrId === 'Azrin') return [-2.5, 1.8, -2.0];
      if (nameOrId === 'Azrael') return [-2.5, 1.8, -0.8];
      
      const enemyIdx = combat.enemies.findIndex(e => e.id === nameOrId);
      if (enemyIdx !== -1) {
        const zCoord = enemyIdx === 0 ? -2.0 : (enemyIdx === 1 ? -3.2 : -0.8);
        return [2.5, 1.8, zCoord];
      }
      return [2.5, 2.0, -2.0];
    };

    const processUnitTicks = (unitObj, nameOrId) => {
      if (!unitObj || unitObj.hp <= 0 || !unitObj.effects || unitObj.effects.length === 0) {
        return { hp: unitObj ? unitObj.hp : 0, effects: unitObj ? unitObj.effects || [] : [] };
      }

      let hpDiff = 0;
      let updatedEffects = [];

      unitObj.effects.forEach((eff) => {
        let durationLeft = eff.duration;
        
        if (eff.id === 'regen') {
          const healAmt = eff.value;
          hpDiff += healAmt;
          effectLogs.push(`${nameOrId} heals ${healAmt} HP from Regen.`);
          tickFloatingTexts.push({
            id: `regen_tick_${Date.now()}_${Math.random()}`,
            text: `+${healAmt}`,
            type: 'heal',
            position: getPos(nameOrId),
            createdAt: Date.now()
          });
        } else if (eff.id === 'burn') {
          const burnDmg = eff.value;
          hpDiff -= burnDmg;
          effectLogs.push(`${nameOrId} takes ${burnDmg} Burn damage!`);
          tickFloatingTexts.push({
            id: `burn_tick_${Date.now()}_${Math.random()}`,
            text: `${burnDmg}`,
            type: 'magic',
            position: getPos(nameOrId),
            createdAt: Date.now()
          });
        } else if (eff.id === 'void_decay') {
          const decayDmg = eff.value;
          hpDiff -= decayDmg;
          effectLogs.push(`${nameOrId} takes ${decayDmg} Void Decay damage!`);
          tickFloatingTexts.push({
            id: `decay_tick_${Date.now()}_${Math.random()}`,
            text: `${decayDmg}`,
            type: 'physical',
            position: getPos(nameOrId),
            createdAt: Date.now()
          });
        }
        
        durationLeft -= 1;
        if (durationLeft > 0) {
          updatedEffects.push({ ...eff, duration: durationLeft });
        } else {
          effectLogs.push(`Effect '${eff.name}' on ${nameOrId} expired.`);
        }
      });

      let nextHp = unitObj.hp;
      if (hpDiff > 0) {
        nextHp = Math.min(unitObj.maxHp, unitObj.hp + hpDiff);
      } else if (hpDiff < 0) {
        nextHp = Math.max(0, unitObj.hp + hpDiff);
      }

      return { hp: nextHp, effects: updatedEffects };
    };

    Object.keys(charactersUpdate).forEach((name) => {
      const res = processUnitTicks(charactersUpdate[name], name);
      charactersUpdate[name] = {
        ...charactersUpdate[name],
        hp: res.hp,
        effects: res.effects
      };
    });

    enemiesUpdate = enemiesUpdate.map((enemy) => {
      const res = processUnitTicks(enemy, enemy.id);
      return {
        ...enemy,
        hp: res.hp,
        effects: res.effects
      };
    });

    const allEnemiesDead = enemiesUpdate.every(e => e.hp <= 0);
    const allHeroesDead = Object.values(charactersUpdate).every(c => c.hp <= 0);

    if (allEnemiesDead) {
      const victoryLog = 'Victory! The enemies have been purified by status effect ticks.';
      const enemyGold = 50;
      const xpGained = 20;
      const finalChars = { ...charactersUpdate };
      const levelUpLogs = [];

      Object.keys(finalChars).forEach(name => {
        const char = { ...finalChars[name], effects: [] };
        char.xp += xpGained;
        
        if (char.xp >= char.maxXp) {
          char.level += 1;
          char.sp = (char.sp || 0) + 1;
          char.xp = char.xp - char.maxXp;
          char.maxXp = Math.round(char.maxXp * 1.5);
          char.baseMaxHp = Math.round(char.baseMaxHp * 1.2);
          char.baseMaxMp = Math.round(char.baseMaxMp * 1.2);
          char.baseStats = {
            attack: Math.round(char.baseStats.attack * 1.25),
            defense: Math.round(char.baseStats.defense * 1.2),
            speed: Math.round(char.baseStats.speed * 1.15),
            ether: Math.round(char.baseStats.ether * 1.25)
          };
          const finalChar = recalculateCharacterStats(char, get().inventory);
          finalChar.hp = finalChar.maxHp;
          finalChar.mp = finalChar.maxMp;
          finalChars[name] = finalChar;
          levelUpLogs.push(`${name} leveled up to Lv.${char.level}! Stats increased, fully restored & +1 Skill Point!`);
        } else {
          finalChars[name] = char;
        }
      });

      set((state) => ({
        gold: state.gold + enemyGold,
        defeatedEnemies: [...state.defeatedEnemies, state.combat.encounterId || state.combat.enemies[0].id],
        respawnQueue: (state.combat.encounterId && state.combat.encounterId !== 'enemy_boss_anomaly')
          ? [...state.respawnQueue, { id: state.combat.encounterId, respawnAt: Date.now() + 180000 }]
          : state.respawnQueue,
        characters: finalChars,
        combat: {
          ...state.combat,
          battleResult: 'victory',
          logs: [victoryLog, ...levelUpLogs, ...effectLogs, ...state.combat.logs],
          floatingTexts: [...state.combat.floatingTexts, ...tickFloatingTexts],
          animatingAction: null,
          currentActor: null,
          nextActor: null
        }
      }));
      return;
    }

    if (allHeroesDead) {
      const defeatLog = 'Defeat... The spirits have faded to status damage.';
      const finalChars = { ...charactersUpdate };
      Object.keys(finalChars).forEach(name => {
        finalChars[name].effects = [];
      });
      set((state) => ({
        characters: finalChars,
        combat: {
          ...state.combat,
          battleResult: 'defeat',
          logs: [defeatLog, ...effectLogs, ...state.combat.logs],
          floatingTexts: [...state.combat.floatingTexts, ...tickFloatingTexts],
          animatingAction: null,
          currentActor: null,
          nextActor: null
        }
      }));
      return;
    }

    const party = ['Azrin', 'Azrael'];
    let firstAliveHeroIdx = 0;
    while (firstAliveHeroIdx < party.length) {
      const name = party[firstAliveHeroIdx];
      if (charactersUpdate[name] && charactersUpdate[name].hp > 0) {
        break;
      }
      firstAliveHeroIdx++;
    }

    const firstHero = party[firstAliveHeroIdx];
    const activeTurnIndex = combat.turnOrder.indexOf(firstHero);

    set((state) => ({
      characters: charactersUpdate,
      combat: {
        ...state.combat,
        enemies: enemiesUpdate,
        quest: processKills(state.combat.enemies, enemiesUpdate, state.quest),
        queue: [],
        decisionIndex: firstAliveHeroIdx,
        activeTurnIndex,
        battlePhase: 'DECISION',
        isPlayerTurn: true,
        currentActor: null,
        nextActor: null,
        logs: effectLogs.length > 0 ? [...effectLogs, ...state.combat.logs] : state.combat.logs,
        floatingTexts: tickFloatingTexts.length > 0 ? [...state.combat.floatingTexts, ...tickFloatingTexts] : state.combat.floatingTexts,
        lastActionSummary: null
      }
    }));
  },

  exitCombat: () => set((state) => {
    const isDefeat = state.combat.battleResult === 'defeat';
    const isAllDefeated = state.defeatedEnemies.includes('enemy_boss_anomaly');
    const updatedChars = { ...state.characters };
    
    Object.keys(updatedChars).forEach(name => {
      updatedChars[name].effects = []; // Clear all active combat effects
      if (isDefeat && updatedChars[name].hp <= 0) {
        updatedChars[name].hp = Math.round(updatedChars[name].maxHp * 0.3);
      }
    });

    let nextPhase = 'EXPLORING';
    if (isDefeat) nextPhase = 'GAME_OVER';
    else if (isAllDefeated) nextPhase = 'GAME_CLEAR';

    return {
      phase: nextPhase,
      characters: updatedChars
    };
  }),

  // Shop / Merchant actions
  isNearMerchant: false,
  showShop: false,
  setShowShop: (show) => set({ showShop: show }),
  buyItem: (itemTemplate) => set((state) => {
    if (state.gold < itemTemplate.cost) return {};

    const updatedInventory = [...state.inventory];
    if (itemTemplate.type === 'consumable') {
      const existingIdx = updatedInventory.findIndex(i => i.id === itemTemplate.id);
      if (existingIdx !== -1) {
        updatedInventory[existingIdx] = {
          ...updatedInventory[existingIdx],
          count: updatedInventory[existingIdx].count + 1
        };
      } else {
        updatedInventory.push({
          id: itemTemplate.id,
          name: itemTemplate.name,
          type: itemTemplate.type,
          count: 1,
          effect: itemTemplate.effect,
          description: itemTemplate.description,
          value: itemTemplate.value,
          valueType: itemTemplate.valueType
        });
      }
    } else {
      // Weapon or accessory
      const uniqueId = `${itemTemplate.id}_${Date.now()}`;
      updatedInventory.push({
        id: uniqueId,
        name: itemTemplate.name,
        type: itemTemplate.type,
        count: 1,
        stats: itemTemplate.stats,
        description: itemTemplate.description,
        targetChar: itemTemplate.targetChar,
        equipped: false
      });
    }

    return {
      gold: state.gold - itemTemplate.cost,
      inventory: updatedInventory
    };
  }),

  restartGame: () => set((state) => {
    const resetChars = { ...state.characters };
    Object.keys(resetChars).forEach(name => {
      const base = name === 'Azrin' 
        ? { level: 5, hp: 120, baseMaxHp: 120, mp: 60, baseMaxMp: 60, xp: 45, attack: 24, defense: 12, speed: 15, ether: 8 }
        : { level: 5, hp: 90, baseMaxHp: 90, mp: 120, baseMaxMp: 120, xp: 45, attack: 10, defense: 8, speed: 18, ether: 28 };
      
      resetChars[name] = {
        ...resetChars[name],
        level: base.level,
        hp: base.hp,
        baseMaxHp: base.baseMaxHp,
        mp: base.mp,
        baseMaxMp: base.baseMaxMp,
        xp: base.xp,
        effects: [],
        baseStats: {
          attack: base.attack,
          defense: base.defense,
          speed: base.speed,
          ether: base.ether
        }
      };
    });

    const resetInventory = [
      { id: 'ether_elixir', name: 'Ether Elixir', type: 'consumable', count: 5, effect: 'MP +50', description: 'A glowing vial containing liquid ether. Tastes like cold stardust.', value: 50, valueType: 'mp' },
      { id: 'health_flask', name: 'Health Flask', type: 'consumable', count: 4, effect: 'HP +70', description: 'Condensed spirit energy that heals flesh and spirit.', value: 70, valueType: 'hp' },
      { id: 'celestial_feather', name: 'Celestial Feather', type: 'consumable', count: 2, effect: 'Revive (50% HP)', description: 'A warm, glowing feather from an astral beast. Revives fallen allies.', value: 0, valueType: 'revive' },
      { id: 'ether_blade', name: 'Ether Blade', type: 'weapon', count: 1, stats: { attack: 12 }, description: 'A sword forged from crystallized ether. Vibrates with magical resonance.', targetChar: 'Azrin', equipped: true },
      { id: 'astral_staff', name: 'Astral Staff', type: 'weapon', count: 1, stats: { ether: 15 }, description: 'A staff made of starlight crystal, channeling ether perfectly.', targetChar: 'Azrael', equipped: true },
      { id: 'glowing_pendant', name: 'Glowing Pendant', type: 'accessory', count: 1, stats: { defense: 6, maxMp: 15 }, description: 'Emits a soothing aura that increases defense and max MP.', equipped: false }
    ];

    const finalChars = { ...resetChars };
    finalChars.Azrin = recalculateCharacterStats(finalChars.Azrin, resetInventory);
    finalChars.Azrael = recalculateCharacterStats(finalChars.Azrael, resetInventory);
    
    finalChars.Azrin.hp = finalChars.Azrin.maxHp;
    finalChars.Azrin.mp = finalChars.Azrin.maxMp;
    finalChars.Azrael.hp = finalChars.Azrael.maxHp;
    finalChars.Azrael.mp = finalChars.Azrael.maxMp;

    return {
      phase: 'MENU',
      controlScheme: 'NORMAL',
      joystick: { x: 0, y: 0 },
      isPaused: false,
      characters: finalChars,
      defeatedEnemies: [],
      playerPosition: [0, 0.5, 0],
      gold: 150,
      showShop: false,
      isNearMerchant: false,
      inventory: resetInventory,
      stamina: 100,
      movementMode: 'WALK',
      isStaminaExhausted: false,
    };
  })
}));
