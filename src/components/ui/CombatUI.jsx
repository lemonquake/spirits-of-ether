import { useState, useEffect } from 'react';
import { Sword, Flame, Briefcase, DoorOpen, Plus, ShieldAlert, Award, Check, X } from 'lucide-react';
import { useGameStore, INITIAL_INVENTORY } from '../../store/gameStore';

export default function CombatUI() {
  const combat = useGameStore(state => state.combat);
  const characters = useGameStore(state => state.characters);
  const inventory = useGameStore(state => state.inventory);
  const undoLastDecision = useGameStore(state => state.undoLastDecision);
  const exitCombat = useGameStore(state => state.exitCombat);
  const selectEnemyTarget = useGameStore(state => state.selectEnemyTarget);

  // New targeting actions
  const startTargeting = useGameStore(state => state.startTargeting);
  const cancelTargeting = useGameStore(state => state.cancelTargeting);
  const selectTargetUnit = useGameStore(state => state.selectTargetUnit);
  const confirmTargeting = useGameStore(state => state.confirmTargeting);

  const activeUnit = combat.turnOrder[combat.activeTurnIndex];
  const isPlayerTurn = combat.battlePhase === 'DECISION' && !combat.battleResult && !combat.animatingAction;

  // Filter out consumables for quick inventory combat access
  const combatConsumables = inventory.filter(i => i.type === 'consumable');


  const [activeSubMenu, setActiveSubMenu] = useState(null); // null | 'skills' | 'items'
  const [showHistory, setShowHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Auto-switch to turn summary card when an action starts animating
  useEffect(() => {
    if (combat.animatingAction) {
      setShowHistory(false);
    }
  }, [combat.animatingAction]);

  // Reset highlighted index when the navigation context changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [activeSubMenu, combat.isTargeting, combat.activeTurnIndex]);

  // Keyboard navigation for battle decisions and targeting
  useEffect(() => {
    if (!isPlayerTurn) return;

    const handleKeyDown = (e) => {
      const key = e.key;

      // 1. TARGET CONFIRMATION & TARGETING
      if (combat.isTargeting) {
        if (key === 'Escape' || key === 'Backspace') {
          cancelTargeting();
          e.preventDefault();
          return;
        }

        // Cycle through targets using Left/Right arrows or A/D
        if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'ArrowRight' || key === 'd' || key === 'D') {
          const isLeft = key === 'ArrowLeft' || key === 'a' || key === 'A';
          const skillId = combat.pendingAction?.details?.skillId;
          const itemId = combat.pendingAction?.details?.itemId;
          const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit]?.skills.find(s => s.id === skillId)?.type === 'heal';
          const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
          const isReviveItem = combat.pendingAction?.type === 'item' && inventory.find(i => i.id === itemId)?.valueType === 'revive';

          if (isHeal || isHeroItem) {
            const nextTarget = combat.currentTargetUnit === 'Azrin' ? 'Azrael' : 'Azrin';
            if (isReviveItem) {
              selectTargetUnit(nextTarget);
            } else if (characters[nextTarget].hp > 0) {
              selectTargetUnit(nextTarget);
            }
          } else {
            const aliveEnemies = combat.enemies.filter(enemy => enemy.hp > 0);
            if (aliveEnemies.length > 0) {
              const currentEnemyIdx = aliveEnemies.findIndex(enemy => enemy.id === combat.currentTargetUnit);
              let nextEnemyIdx = 0;
              if (currentEnemyIdx !== -1) {
                if (isLeft) {
                  nextEnemyIdx = (currentEnemyIdx - 1 + aliveEnemies.length) % aliveEnemies.length;
                } else {
                  nextEnemyIdx = (currentEnemyIdx + 1) % aliveEnemies.length;
                }
              }
              const nextEnemy = aliveEnemies[nextEnemyIdx];
              selectTargetUnit(nextEnemy.id);
              const idxInAll = combat.enemies.findIndex(e => e.id === nextEnemy.id);
              if (idxInAll !== -1) {
                selectEnemyTarget(idxInAll);
              }
            }
          }
          e.preventDefault();
        }

        // Switch between OK (0) and BACK (1) buttons using Up/Down arrows or Tab
        if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Tab') {
          setHighlightedIndex(prev => (prev === 0 ? 1 : 0));
          e.preventDefault();
        }

        if (key === ' ' || key === 'Enter') {
          if (highlightedIndex === 0) {
            confirmTargeting();
          } else {
            cancelTargeting();
          }
          e.preventDefault();
        }
        return;
      }

      // 2. MAIN MENU NAVIGATION
      if (activeSubMenu === null) {
        const menuSize = 4;
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
          setHighlightedIndex(prev => (prev - 1 + menuSize) % menuSize);
          e.preventDefault();
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'Tab') {
          setHighlightedIndex(prev => (prev + 1) % menuSize);
          e.preventDefault();
        } else if (key === ' ' || key === 'Enter') {
          const cmdMapping = ['attack', 'skills', 'items', 'flee'];
          handleActionClick(cmdMapping[highlightedIndex]);
          e.preventDefault();
        } else if (key === 'Escape' || key === 'Backspace') {
          if (combat.decisionIndex > 0) {
            undoLastDecision();
            e.preventDefault();
          }
        }
        return;
      }

      // 3. SKILLS MENU NAVIGATION
      if (activeSubMenu === 'skills') {
        const skillsList = characters[activeUnit]?.skills || [];
        const menuSize = skillsList.length + 1; // plus BACK button
        if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'ArrowUp' || key === 'w' || key === 'W') {
          setHighlightedIndex(prev => (prev - 1 + menuSize) % menuSize);
          e.preventDefault();
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Tab') {
          setHighlightedIndex(prev => (prev + 1) % menuSize);
          e.preventDefault();
        } else if (key === ' ' || key === 'Enter') {
          if (highlightedIndex < skillsList.length) {
            const skill = skillsList[highlightedIndex];
            const hasMp = characters[activeUnit].mp >= skill.mpCost;
            if (hasMp) {
              handleSkillCast(skill.id);
            }
          } else {
            setActiveSubMenu(null);
          }
          e.preventDefault();
        } else if (key === 'Escape' || key === 'Backspace') {
          setActiveSubMenu(null);
          e.preventDefault();
        }
        return;
      }

      // 4. ITEMS MENU NAVIGATION
      if (activeSubMenu === 'items') {
        const menuSize = combatConsumables.length + 1; // plus BACK button
        if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'ArrowUp' || key === 'w' || key === 'W') {
          setHighlightedIndex(prev => (prev - 1 + menuSize) % menuSize);
          e.preventDefault();
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Tab') {
          setHighlightedIndex(prev => (prev + 1) % menuSize);
          e.preventDefault();
        } else if (key === ' ' || key === 'Enter') {
          if (highlightedIndex < combatConsumables.length) {
            handleItemUse(combatConsumables[highlightedIndex].id);
          } else {
            setActiveSubMenu(null);
          }
          e.preventDefault();
        } else if (key === 'Escape' || key === 'Backspace') {
          setActiveSubMenu(null);
          e.preventDefault();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTurn, activeSubMenu, combat.isTargeting, highlightedIndex, combat.currentTargetUnit, combat.decisionIndex, combat.enemies, activeUnit, characters, inventory]);



  const handleActionClick = (actionType) => {
    if (actionType === 'attack') {
      startTargeting('attack');
      setActiveSubMenu(null);
    } else if (actionType === 'skills') {
      setActiveSubMenu(prev => prev === 'skills' ? null : 'skills');
    } else if (actionType === 'items') {
      setActiveSubMenu(prev => prev === 'items' ? null : 'items');
    } else if (actionType === 'flee') {
      exitCombat();
    }
  };

  const handleSkillCast = (skillId) => {
    startTargeting('skill', { skillId });
    setActiveSubMenu(null);
  };

  const handleItemUse = (itemId) => {
    startTargeting('item', { itemId });
    setActiveSubMenu(null);
  };

  // Determine classes for battle logs
  const getLogClass = (log) => {
    if (log.includes('strikes') || log.includes('faded') || log.includes('takes')) return 'combat-log-entry enemy-action';
    if (log.includes('slashes') || log.includes('casts') || log.includes('Used') || log.includes('heals') || log.includes('uses') || log.includes('executes')) return 'combat-log-entry player-action';
    return 'combat-log-entry system-info';
  };

  // Render status effects helper
  const renderStatusEffects = (effects) => {
    if (!effects || effects.length === 0) return null;
    return (
      <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
        {effects.map((eff, i) => {
          const isBuff = eff.type === 'buff';
          const badgeClass = `status-badge ${isBuff ? 'badge-buff' : 'badge-debuff'} badge-${eff.id}`;
          return (
            <span 
              key={`${eff.id}-${i}`} 
              className={badgeClass} 
              title={`${eff.name}: ${eff.description} (${eff.duration} turns left)`}
            >
              {eff.name[0]}
              <span className="duration-num">{eff.duration}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const handleEnemyCardClick = (idx, enemyId, isDead) => {
    if (isDead) return;
    
    if (combat.isTargeting) {
      // Verify the pending action is not a hero target action
      const skillId = combat.pendingAction?.details?.skillId;
      const itemId = combat.pendingAction?.details?.itemId;
      const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit].skills.find(s => s.id === skillId)?.type === 'heal';
      const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
      
      if (!isHeal && !isHeroItem) {
        selectTargetUnit(enemyId);
        selectEnemyTarget(idx);
      }
    } else {
      selectEnemyTarget(idx);
    }
  };

  return (
    <div className="overlay-container interactive" style={{ pointerEvents: 'auto' }}>
      <div className="combat-hud-overlay">
        
        {/* 1. TOP CENTER: Enemy Health Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '6px'
          }}>
            {combat.isTargeting ? 'Target Enemy (Click Model or Card)' : 'Target Selection'}
          </div>
          <div className="combat-enemy-list">
            {combat.enemies.map((enemy, idx) => {
              const isTargeted = (combat.isTargeting && combat.currentTargetUnit === enemy.id) || 
                                 (combat.isTargeting && combat.currentTargetUnit === 'all_enemies' && enemy.hp > 0) ||
                                 (!combat.isTargeting && combat.targetIndex === idx);
              const hpPercent = (enemy.hp / enemy.maxHp) * 100;
              const isDead = enemy.hp <= 0;
              
              // Enemy flipped when executing action
              const isFlipped = combat.battlePhase === 'ACTION' && combat.currentActor === enemy.id;
              
              // Get enemy action info
              const queuedAction = combat.queue?.find(q => q.attacker === enemy.id);
              let actionText = '';
              let targetNameText = '';
              if (queuedAction) {
                actionText = 'BASIC STRIKE';
                targetNameText = queuedAction.details?.targetUnit;
              }

              return (
                <div 
                  key={enemy.id}
                  className={`enemy-card-wrapper ${isFlipped ? 'flipped' : ''}`}
                  style={{ opacity: isDead ? 0.3 : 1 }}
                >
                  <div className="enemy-card-inner">
                    {/* FRONT */}
                    <div
                      className={`enemy-health-card enemy-card-front ${isTargeted ? 'selected' : ''}`}
                      onClick={() => handleEnemyCardClick(idx, enemy.id, isDead)}
                      style={{
                        cursor: isDead ? 'not-allowed' : 'pointer',
                        borderColor: isTargeted ? '#10b981' : ''
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{enemy.name}</span>
                          {renderStatusEffects(enemy.effects)}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{isDead ? 'DEFEATED' : `${enemy.hp}/${enemy.maxHp}`}</span>
                      </div>
                      <div className="stat-bar-container" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div className="stat-bar-fill hp" style={{
                          width: `${hpPercent}%`,
                          background: 'linear-gradient(90deg, #991b1b, #ef4444)'
                        }}></div>
                      </div>
                    </div>

                    {/* BACK */}
                    <div 
                      className="enemy-health-card enemy-card-back crimson-back"
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                        Executing Move
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--hp-color)', textShadow: '0 0 8px rgba(239,68,68,0.5)', marginTop: '4px', textAlign: 'center' }}>
                        {actionText || 'ATTACKING'}
                      </div>
                      {targetNameText && (
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center' }}>
                          Target: <span style={{ color: 'var(--ether-cyan)', fontWeight: 600 }}>{targetNameText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Persistent Execution Queue Banner */}
        {combat.battlePhase === 'ACTION' && (
          <div style={{
            position: 'absolute',
            top: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'pop-bounce 0.3s ease',
            zIndex: 10
          }}>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '6px'
            }}>
              Queue Execution Order
            </div>
            <div className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '10px 25px',
              borderRadius: '25px',
              background: 'rgba(7, 7, 10, 0.85)',
              border: '1px solid rgba(185, 117, 255, 0.3)'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Acting Now:</span>
              <strong style={{
                color: combat.currentActor?.startsWith('enemy_') ? 'var(--hp-color)' : 'var(--ether-cyan)',
                textTransform: 'uppercase',
                fontSize: '14px'
              }}>
                {combat.currentActor?.startsWith('enemy_') 
                  ? (combat.enemies.find(e => e.id === combat.currentActor)?.name || 'Enemy') 
                  : combat.currentActor}
              </strong>
              {combat.nextActor && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>➔</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Next:</span>
                  <strong style={{
                    color: combat.nextActor.startsWith('enemy_') ? 'var(--hp-color)' : 'var(--ether-cyan)',
                    textTransform: 'uppercase',
                    fontSize: '14px'
                  }}>
                    {combat.nextActor.startsWith('enemy_') 
                      ? (combat.enemies.find(e => e.id === combat.nextActor)?.name || 'Enemy') 
                      : combat.nextActor}
                  </strong>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. MIDDLE SCREEN: Animated Action Notification banner */}
        {combat.animatingAction && (
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(7, 7, 10, 0.85)',
            border: '1px solid var(--border-glow)',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            padding: '12px 35px',
            borderRadius: '30px',
            animation: 'fade-in 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10
          }}>
            <span style={{
              fontWeight: 700,
              fontSize: '16px',
              color: combat.animatingAction.attacker.startsWith('enemy_') ? 'var(--hp-color)' : 'var(--ether-cyan)'
            }}>
              {combat.animatingAction.attacker.startsWith('enemy_') 
                ? combat.enemies.find(e => e.id === combat.animatingAction.attacker)?.name 
                : combat.animatingAction.attacker}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              uses
            </span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase' }}>
              {combat.animatingAction.type === 'skill' 
                ? characters[combat.animatingAction.attacker]?.skills.find(s => s.id === combat.animatingAction.details?.skillId)?.name || 'Skill'
                : combat.animatingAction.type === 'item'
                ? inventory.find(i => i.id === combat.animatingAction.details?.itemId)?.name || 
                  INITIAL_INVENTORY.find(i => i.id === combat.animatingAction.details?.itemId)?.name || 'Item'
                : 'Strike'}
            </span>
            {combat.animatingAction.damage > 0 && (
              <span style={{ color: 'var(--hp-color)', fontWeight: 800, fontSize: '18px', marginLeft: '5px' }}>
                -{combat.animatingAction.damage}!
              </span>
            )}
          </div>
        )}

        {/* 3. BOTTOM PANEL: Party Stats (Left), Actions Control (Center), Battle Logs (Right) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          marginTop: 'auto'
        }}>
          {/* A. BOTTOM-LEFT: Party Cards */}
          <div className="combat-party-cards">
            {Object.keys(characters).map(name => {
              const char = characters[name];
              const isActive = activeUnit === name && combat.battlePhase === 'DECISION' && !combat.isTargeting && !combat.battleResult;
              const isTargeted = combat.isTargeting && combat.currentTargetUnit === name;
              const isAzrin = name === 'Azrin';
              const isDead = char.hp <= 0;
              
              // Find if this unit is the current actor in action phase
              const isFlipped = combat.battlePhase === 'ACTION' && combat.currentActor === name;
              
              // Get the action queued for this unit to show on the back of the card!
              const queuedAction = combat.queue?.find(q => q.attacker === name);
              let actionText = '';
              let targetNameText = '';
              
              if (queuedAction) {
                if (queuedAction.type === 'attack') {
                  actionText = 'BASIC STRIKE';
                  targetNameText = queuedAction.details?.targetUnit?.startsWith('enemy_') 
                    ? (combat.enemies.find(e => e.id === queuedAction.details.targetUnit)?.name || 'Enemy') 
                    : queuedAction.details?.targetUnit;
                } else if (queuedAction.type === 'skill') {
                  const skill = char.skills.find(s => s.id === queuedAction.details?.skillId);
                  actionText = skill ? skill.name.toUpperCase() : 'SKILL';
                  targetNameText = queuedAction.details?.targetUnit === 'all_enemies' 
                    ? 'ALL ENEMIES' 
                    : (queuedAction.details?.targetUnit?.startsWith('enemy_') 
                        ? (combat.enemies.find(e => e.id === queuedAction.details.targetUnit)?.name || 'Enemy') 
                        : queuedAction.details?.targetUnit);
                } else if (queuedAction.type === 'item') {
                  const item = inventory.find(i => i.id === queuedAction.details?.itemId) || INITIAL_INVENTORY.find(i => i.id === queuedAction.details?.itemId);
                  actionText = item ? item.name.toUpperCase() : 'ITEM';
                  targetNameText = queuedAction.details?.targetUnit;
                }
              }

              return (
                <div
                  key={name}
                  className={`combat-card-wrapper ${isFlipped ? 'flipped' : ''}`}
                  style={{ opacity: isDead ? 0.4 : 1 }}
                >
                  <div className="combat-card-inner">
                    {/* FRONT OF THE CARD */}
                    <div 
                      className={`glass-panel combat-card combat-card-front ${isActive ? 'active' : ''} ${!isAzrin && isActive ? 'purple' : ''} ${isTargeted ? 'targeted-green' : ''}`}
                      onClick={() => {
                        if (combat.isTargeting) {
                          const skillId = combat.pendingAction?.details?.skillId;
                          const itemId = combat.pendingAction?.details?.itemId;
                          const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit].skills.find(s => s.id === skillId)?.type === 'heal';
                          const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
                          
                          if (isHeal || isHeroItem) {
                            const isReviveItem = combat.pendingAction?.type === 'item' && inventory.find(i => i.id === itemId)?.valueType === 'revive';
                            if (isReviveItem && char.hp <= 0) {
                              selectTargetUnit(name);
                            } else if (!isReviveItem && char.hp > 0) {
                              selectTargetUnit(name);
                            }
                          }
                        }
                      }}
                      style={{
                        borderLeft: `4px solid ${isAzrin ? 'var(--ether-cyan)' : 'var(--astral-purple)'}`,
                        cursor: combat.isTargeting ? 'pointer' : 'default',
                        borderColor: isTargeted ? '#10b981' : ''
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: isAzrin ? 'var(--ether-cyan)' : 'var(--astral-purple)', fontSize: '15px' }}>{name}</span>
                          {renderStatusEffects(char.effects)}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lv.{char.level}</span>
                      </div>
                      {/* HP */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>HP</span>
                          <span>{char.hp}/{char.maxHp}</span>
                        </div>
                        <div className="stat-bar-container">
                          <div className="stat-bar-fill hp" style={{ width: `${(char.hp / char.maxHp) * 100}%` }}></div>
                        </div>
                      </div>
                      {/* MP */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>MP</span>
                          <span>{char.mp}/{char.maxMp}</span>
                        </div>
                        <div className="stat-bar-container">
                          <div className="stat-bar-fill mp" style={{ width: `${(char.mp / char.maxMp) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* BACK OF THE CARD (Queued Action Info) */}
                    <div 
                      className={`glass-panel combat-card combat-card-back ${isAzrin ? 'cyan-back' : 'purple-back'}`}
                      style={{
                        borderLeft: `4px solid ${isAzrin ? 'var(--ether-cyan)' : 'var(--astral-purple)'}`,
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Queued Action
                      </span>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#fff',
                        textShadow: '0 0 10px rgba(255,255,255,0.4)',
                        marginTop: '10px',
                        textAlign: 'center'
                      }}>
                        {actionText || 'DECIDING...'}
                      </div>
                      {targetNameText && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                          Target: <span style={{ color: 'var(--ether-cyan)', fontWeight: 600 }}>{targetNameText}</span>
                        </div>
                      )}
                      <div className="glow-bar" style={{
                        width: '40px',
                        height: '2px',
                        backgroundColor: isAzrin ? 'var(--ether-cyan)' : 'var(--astral-purple)',
                        boxShadow: `0 0 10px ${isAzrin ? 'var(--ether-cyan)' : 'var(--astral-purple)'}`,
                        borderRadius: '2px',
                        marginTop: '15px',
                        alignSelf: 'center',
                        animation: 'pulse-glow 1.5s infinite ease-in-out'
                      }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* B. BOTTOM-CENTER: Actions Controls */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {/* Active Character Turn Indicator */}
            {isPlayerTurn && (
              <div style={{
                fontSize: '12px',
                color: activeUnit === 'Azrin' ? 'var(--ether-cyan)' : 'var(--astral-purple)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.15em',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {activeUnit}'s Turn
              </div>
            )}

            <div className="glass-panel combat-actions-bar" style={{
              display: isPlayerTurn ? 'flex' : 'none',
              background: 'rgba(7, 7, 10, 0.75)'
            }}>
              {combat.isTargeting ? (
                /* TARGET CONFIRMATION MENU */
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Casting Ability
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      {combat.pendingAction?.type === 'attack' ? 'BASIC STRIKE' : (
                        combat.pendingAction?.type === 'skill'
                          ? characters[activeUnit]?.skills.find(s => s.id === combat.pendingAction?.details?.skillId)?.name.toUpperCase()
                          : inventory.find(i => i.id === combat.pendingAction?.details?.itemId)?.name.toUpperCase()
                      )}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '5px' }}>
                      Target: <strong style={{ color: 'var(--ether-cyan)', textTransform: 'uppercase' }}>
                        {combat.currentTargetUnit === 'all_enemies' ? 'ALL ENEMIES' : (
                          combat.currentTargetUnit === 'Azrin' || combat.currentTargetUnit === 'Azrael'
                            ? combat.currentTargetUnit
                            : (combat.enemies.find(e => e.id === combat.currentTargetUnit)?.name || 'NONE')
                        )}
                      </strong>
                    </span>
                    <button 
                      className={`glass-button active ${highlightedIndex === 0 ? 'keyboard-highlighted' : ''}`} 
                      onClick={confirmTargeting} 
                      style={{ borderColor: '#10b981', color: '#10b981', padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Check size={14} /> OK
                    </button>
                    <button 
                      className={`glass-button danger ${highlightedIndex === 1 ? 'keyboard-highlighted' : ''}`} 
                      onClick={cancelTargeting} 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <X size={14} /> BACK
                    </button>
                  </div>
                </div>
              ) : (
                /* REGULAR BATTLE COMMANDS MENU - REDESIGNED GRID */
                <>
                  {combat.decisionIndex > 0 && (
                    <button
                      className="glass-button"
                      onClick={undoLastDecision}
                      style={{
                        borderColor: 'var(--hp-color)',
                        color: 'var(--hp-color)',
                        padding: '10px 15px',
                        borderRadius: '25px',
                        marginRight: '15px'
                      }}
                    >
                      UNDO
                    </button>
                  )}
                  
                  {activeSubMenu === null && (
                    <div className="combat-action-grid">
                      <button 
                        className={`action-card-btn ${highlightedIndex === 0 ? 'keyboard-highlighted' : ''}`} 
                        onClick={() => handleActionClick('attack')}
                      >
                        <span className="btn-icon">⚔️</span>
                        <span>ATTACK</span>
                      </button>
                      <button 
                        className={`action-card-btn ${highlightedIndex === 1 ? 'keyboard-highlighted' : ''}`} 
                        onClick={() => handleActionClick('skills')}
                      >
                        <span className="btn-icon">🔥</span>
                        <span>SKILLS</span>
                      </button>
                      <button 
                        className={`action-card-btn ${highlightedIndex === 2 ? 'keyboard-highlighted' : ''}`} 
                        onClick={() => handleActionClick('items')}
                      >
                        <span className="btn-icon">🎒</span>
                        <span>ITEMS</span>
                      </button>
                      <button 
                        className={`action-card-btn ${highlightedIndex === 3 ? 'keyboard-highlighted' : ''}`} 
                        onClick={() => handleActionClick('flee')}
                      >
                        <span className="btn-icon">🏃</span>
                        <span>RETREAT</span>
                      </button>
                    </div>
                  )}

                  {/* Sub-menu drawer: Skills */}
                  {activeSubMenu === 'skills' && (
                    <div className="combat-skills-drawer">
                      {characters[activeUnit]?.skills.map((skill, index) => {
                        const hasMp = characters[activeUnit].mp >= skill.mpCost;
                        const isHighlighted = highlightedIndex === index;
                        return (
                          <button
                            key={skill.id}
                            className={`glass-button skill-btn ${isHighlighted ? 'keyboard-highlighted' : ''}`}
                            disabled={!hasMp}
                            onClick={() => handleSkillCast(skill.id)}
                          >
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{skill.name}</span>
                            <span className="cost">{skill.mpCost} MP</span>
                          </button>
                        );
                      })}
                      <button
                        className={`glass-button skill-btn ${highlightedIndex === (characters[activeUnit]?.skills || []).length ? 'keyboard-highlighted' : ''}`}
                        style={{ minWidth: '80px', justifyContent: 'center', alignItems: 'center', borderColor: 'var(--hp-color)', color: 'var(--hp-color)' }}
                        onClick={() => setActiveSubMenu(null)}
                      >
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>BACK</span>
                      </button>
                    </div>
                  )}

                  {/* Sub-menu drawer: Items list */}
                  {activeSubMenu === 'items' && (
                    <div className="combat-skills-drawer" style={{ overflowX: 'auto', gap: '8px' }}>
                      {combatConsumables.length === 0 ? (
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>No items in inventory</span>
                          <button
                            className={`glass-button skill-btn keyboard-highlighted`}
                            style={{ minWidth: '80px', maxHeight: '40px', justifyContent: 'center', alignItems: 'center', borderColor: 'var(--hp-color)', color: 'var(--hp-color)' }}
                            onClick={() => setActiveSubMenu(null)}
                          >
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>BACK</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {combatConsumables.map((item, index) => {
                            const isHighlighted = highlightedIndex === index;
                            return (
                              <button
                                key={item.id}
                                className={`glass-button skill-btn ${isHighlighted ? 'keyboard-highlighted' : ''}`}
                                style={{ minWidth: '150px' }}
                                onClick={() => handleItemUse(item.id)}
                              >
                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</span>
                                <span className="cost">Quantity: {item.count}</span>
                              </button>
                            );
                          })}
                          <button
                            className={`glass-button skill-btn ${highlightedIndex === combatConsumables.length ? 'keyboard-highlighted' : ''}`}
                            style={{ minWidth: '80px', justifyContent: 'center', alignItems: 'center', borderColor: 'var(--hp-color)', color: 'var(--hp-color)' }}
                            onClick={() => setActiveSubMenu(null)}
                          >
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>BACK</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Waiting/Animating status */}
            {!isPlayerTurn && !combat.battleResult && (
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                padding: '16px'
              }}>
                {combat.animatingAction ? 'Executing actions...' : 'Waiting for enemy move...'}
              </div>
            )}
          </div>

          {/* C. BOTTOM-RIGHT: Battle Logs / Turn Summary */}
          <div className="glass-panel combat-log-container" style={{ display: 'flex', flexDirection: 'column', height: '180px', overflowY: 'hidden' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              paddingBottom: '6px',
              marginBottom: '6px',
              flexShrink: 0
            }}>
              <span style={{
                fontFamily: 'var(--font-title)',
                fontSize: '11px',
                color: 'var(--rpg-gold)',
                fontWeight: 'bold',
                letterSpacing: '0.08em'
              }}>
                {showHistory || !combat.lastActionSummary ? 'BATTLE HISTORY' : 'ACTION SUMMARY'}
              </span>
              {combat.lastActionSummary && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'var(--font-title)',
                    letterSpacing: '0.05em'
                  }}
                >
                  {showHistory ? 'Show Summary' : 'Show History'}
                </button>
              )}
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {showHistory || !combat.lastActionSummary ? (
                /* Scrollable list of traditional text logs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {combat.logs.map((log, idx) => (
                    <div key={`log-${idx}`} className={getLogClass(log)}>
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                /* Structured Turn Summary Card */
                <div className="turn-summary-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className={`actor-badge ${
                      combat.lastActionSummary.attacker === 'Azrin' || combat.lastActionSummary.attacker === 'Azrael'
                        ? 'player'
                        : 'enemy'
                    }`}>
                      {combat.lastActionSummary.attacker}
                    </span>
                    <span className="summary-action-name">
                      {combat.lastActionSummary.type === 'attack' && 'executed Basic Attack'}
                      {combat.lastActionSummary.type === 'skill' && `cast ${combat.lastActionSummary.skillName}`}
                      {combat.lastActionSummary.type === 'item' && `used ${combat.lastActionSummary.itemName}`}
                      {combat.lastActionSummary.type === 'skip' && 'turn skipped'}
                    </span>
                  </div>

                  <div className="summary-targets-container">
                    {combat.lastActionSummary.targets.length === 0 ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                        No targets affected.
                      </div>
                    ) : (
                      combat.lastActionSummary.targets.map((tgt, i) => (
                        <div key={i} className="summary-target-row">
                          <span className="summary-target-name">{tgt.name}</span>
                          <div className="summary-outcome-details">
                            {tgt.damage > 0 && (
                              <span className="summary-damage">
                                -{tgt.damage} HP
                                {tgt.isCrit && <span className="summary-crit-badge" style={{ marginLeft: '4px' }}>CRIT!</span>}
                              </span>
                            )}
                            {tgt.healing > 0 && (
                              <span className="summary-heal">
                                +{tgt.healing} HP
                              </span>
                            )}
                            {tgt.effectsApplied && tgt.effectsApplied.map((eff, j) => (
                              <span key={j} className="summary-effect-badge">{eff}</span>
                            ))}
                            {tgt.defeated && (
                              <span className="summary-defeat-badge">💀 DEFEATED</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. OVERLAYS: Battle Result screen */}
      {combat.battleResult && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(7, 7, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          animation: 'fade-in 0.4s ease'
        }}>
          {combat.battleResult === 'victory' ? (
            <div className="glass-panel" style={{
              width: '450px',
              padding: '30px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              border: '1px solid rgba(78, 158, 255, 0.4)',
              boxShadow: '0 0 40px rgba(78, 158, 255, 0.15)'
            }}>
              <Award size={48} style={{ color: 'var(--xp-color)', animation: 'bounce-slow 2s infinite ease-in-out' }} />
              <h1 className="title-text" style={{ fontSize: '32px', color: 'var(--xp-color)', letterSpacing: '0.15em' }}>VICTORY</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                You have successfully purified the overworld void anomaly.
              </p>
              
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px 20px',
                borderRadius: '8px',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Rewards:</span>
                  <div style={{ fontWeight: 600, color: 'var(--xp-color)', fontSize: '16px' }}>+50 Shards</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>XP Gained:</span>
                  <div style={{ fontWeight: 600, color: 'var(--ether-cyan)', fontSize: '16px' }}>+20 XP</div>
                </div>
              </div>

              <button
                className="glass-button active"
                onClick={exitCombat}
                style={{ width: '100%', padding: '14px', fontWeight: 600, fontSize: '15px', marginTop: '10px' }}
              >
                Absorb Shards & Continue
              </button>
            </div>
          ) : (
            <div className="glass-panel purple-glow" style={{
              width: '450px',
              padding: '30px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              boxShadow: '0 0 40px rgba(220, 38, 38, 0.15)'
            }}>
              <ShieldAlert size={48} style={{ color: 'var(--hp-color)', animation: 'bounce-slow 2s infinite ease-in-out' }} />
              <h1 className="title-text" style={{ fontSize: '32px', color: 'var(--hp-color)', letterSpacing: '0.15em' }}>PARTY DEFEATED</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                The ether energy faded. The void anomaly consumed your spirits.
              </p>

              <button
                className="glass-button danger"
                onClick={exitCombat}
                style={{ width: '100%', padding: '14px', fontWeight: 600, fontSize: '15px', marginTop: '10px' }}
              >
                Awake at Shrines
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
