import { useState } from 'react';
import { X, ShieldAlert, Zap, Flame, User, Sword, Shield, Heart, Skull, AlertTriangle, Crosshair, Award } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function CharacterInfo({ onClose }) {
  const characters = useGameStore(state => state.characters);
  const upgradeSkill = useGameStore(state => state.upgradeSkill);
  const [selectedChar, setSelectedChar] = useState('Azrin');

  const charData = characters[selectedChar];
  const [activePanel, setActivePanel] = useState('stats'); // 'stats' | 'damage'

  const actionsList = [
    { id: 'strike', name: 'Weapon Strike', type: 'attack' },
    ...charData.skills.filter(s => s.type !== 'passive')
  ];

  const getDamageForecast = (action) => {
    let baseDmg = 0;
    let type = 'attack'; // 'attack' | 'heal'
    let formula = '';
    
    if (action.id === 'strike') {
      baseDmg = charData.stats.attack;
      formula = `Attack Power (${baseDmg})`;
    } else {
      if (action.type === 'heal') {
        type = 'heal';
        baseDmg = action.healValue;
        formula = `Flat Heal Value (${baseDmg})`;
      } else {
        baseDmg = charData.stats.ether * action.damageMultiplier;
        formula = `Ether (${charData.stats.ether}) * ${action.damageMultiplier}x = ${baseDmg.toFixed(1)}`;
      }
    }

    const calculateDamageVsDefense = (def) => {
      if (type === 'heal') {
        return `${baseDmg} HP`;
      }
      
      const defenseMod = action.id === 'strike' ? def * 0.5 : def * 0.4;
      const minDmg = Math.max(1, Math.round(baseDmg - defenseMod));
      const maxDmg = Math.max(1, Math.round(baseDmg * 1.2 - defenseMod));
      
      return `${minDmg} - ${maxDmg}`;
    };

    return {
      name: action.name,
      formula,
      type,
      vs5: calculateDamageVsDefense(5),
      vs10: calculateDamageVsDefense(10),
      vs20: calculateDamageVsDefense(20),
    };
  };

  return (
    <div className="glass-panel interactive" style={{
      position: 'absolute',
      top: '90px',
      left: '50px',
      width: '780px',
      height: 'calc(100vh - 180px)',
      maxHeight: '620px',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User size={20} className="text-secondary" style={{ color: charData.avatarColor }} />
          <span className="title-text" style={{ fontSize: '18px', fontWeight: 600 }}>Party Archives</span>
        </div>
        <button className="glass-button" onClick={onClose} style={{ padding: '6px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Side: Party Picker */}
        <div style={{
          width: '200px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {Object.keys(characters).map(name => {
            const c = characters[name];
            const isSelected = selectedChar === name;
            return (
              <div
                key={name}
                onClick={() => setSelectedChar(name)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: isSelected ? `rgba(${name === 'Azrin' ? '78, 158, 255' : '185, 117, 255'}, 0.12)` : 'rgba(0, 0, 0, 0.15)',
                  border: `1px solid ${isSelected ? c.avatarColor : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.25s var(--ease-bounce-spring)',
                  transform: isSelected ? 'scale(1.04) translateX(4px)' : 'none',
                  boxShadow: isSelected ? `0 0 15px rgba(${name === 'Azrin' ? '78, 158, 255' : '185, 117, 255'}, 0.15)` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.02) translateX(2px)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: c.avatarColor,
                  boxShadow: `0 0 10px ${c.avatarColor}`
                }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: isSelected ? c.avatarColor : 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lv.{c.level}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Attributes / Character Screen */}
        <div style={{
          flexGrow: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Top Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="title-text" style={{
                fontSize: '32px',
                color: charData.avatarColor,
                fontWeight: 700,
                textShadow: `0 0 20px ${charData.avatarColor}44`,
                lineHeight: 1
              }}>{charData.name}</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{charData.title}</p>
              {charData.sp > 0 && (
                <div style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid var(--xp-color)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--xp-color)',
                  boxShadow: '0 0 10px rgba(234, 179, 8, 0.1)',
                  animation: 'pulse 2s infinite ease-in-out'
                }}>
                  <Award size={12} />
                  <span>{charData.sp} SKILL POINTS AVAILABLE</span>
                </div>
              )}
            </div>
            
            {/* Level / EXP / HP / MP info */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {/* HP Bar */}
              <div style={{ width: '130px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>HP</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {charData.hp}/{charData.maxHp}
                    {charData.maxHp > charData.baseMaxHp && (
                      <span style={{ fontSize: '10px', color: 'var(--mp-color)', marginLeft: '2px', fontWeight: 600 }}>
                        (+{charData.maxHp - charData.baseMaxHp})
                      </span>
                    )}
                  </span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar-fill hp" style={{ width: `${(charData.hp / charData.maxHp) * 100}%` }}></div>
                </div>
              </div>

              {/* MP Bar */}
              <div style={{ width: '130px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>MP</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {charData.mp}/{charData.maxMp}
                    {charData.maxMp > charData.baseMaxMp && (
                      <span style={{ fontSize: '10px', color: 'var(--mp-color)', marginLeft: '2px', fontWeight: 600 }}>
                        (+{charData.maxMp - charData.baseMaxMp})
                      </span>
                    )}
                  </span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar-fill mp" style={{ width: `${(charData.mp / charData.maxMp) * 100}%` }}></div>
                </div>
              </div>

              {/* EXP Bar */}
              <div style={{ width: '130px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>EXP</span>
                  <span style={{ color: 'var(--text-primary)' }}>{charData.xp}/{charData.maxXp}</span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar-fill xp" style={{ width: `${(charData.xp / charData.maxXp) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Lore description */}
          <div style={{
            background: 'rgba(0,0,0,0.15)',
            borderLeft: `3px solid ${charData.avatarColor}`,
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            "{charData.lore}"
          </div>

          {/* Panel Toggle Tabs */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <button
              className={`glass-button ${activePanel === 'stats' ? 'active' : ''}`}
              onClick={() => setActivePanel('stats')}
              style={{ padding: '6px 16px', fontSize: '12px' }}
            >
              Combat Parameters
            </button>
            <button
              className={`glass-button ${activePanel === 'damage' ? 'active' : ''}`}
              onClick={() => setActivePanel('damage')}
              style={{ padding: '6px 16px', fontSize: '12px' }}
            >
              Damage Forecast Table
            </button>
          </div>

          {activePanel === 'stats' && (
            <>
              {/* Stats Grid */}
              <div>
                <h3 className="title-text" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.1em' }}>Combat Parameters</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ATTACK POWER</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>
                        {charData.stats.attack}
                        {charData.stats.attack > charData.baseStats.attack && (
                          <span style={{ fontSize: '13px', color: 'var(--mp-color)', marginLeft: '6px', fontWeight: 600 }}>
                            (+{charData.stats.attack - charData.baseStats.attack})
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Physical strike force</span>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEFENSIVE GUARD</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>
                        {charData.stats.defense}
                        {charData.stats.defense > charData.baseStats.defense && (
                          <span style={{ fontSize: '13px', color: 'var(--mp-color)', marginLeft: '6px', fontWeight: 600 }}>
                            (+{charData.stats.defense - charData.baseStats.defense})
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mitigates damage taken</span>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VELOCITY SPEED</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>
                        {charData.stats.speed}
                        {charData.stats.speed > charData.baseStats.speed && (
                          <span style={{ fontSize: '13px', color: 'var(--mp-color)', marginLeft: '6px', fontWeight: 600 }}>
                            (+{charData.stats.speed - charData.baseStats.speed})
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Determines battle turn order</span>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ETHER AFFINITY</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>
                        {charData.stats.ether}
                        {charData.stats.ether > charData.baseStats.ether && (
                          <span style={{ fontSize: '13px', color: 'var(--mp-color)', marginLeft: '6px', fontWeight: 600 }}>
                            (+{charData.stats.ether - charData.baseStats.ether})
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enhances magic spell potency</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Details */}
              <div>
                <h3 className="title-text" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.1em' }}>Aura Techniques</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {charData.skills.map(skill => (
                    <div key={skill.id} className="glass-panel" style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{skill.name}</span>
                          {skill.level !== undefined && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--xp-color)',
                              background: 'rgba(234, 179, 8, 0.1)',
                              padding: '1px 5px',
                              border: '1px solid rgba(234, 179, 8, 0.2)',
                              borderRadius: '4px'
                            }}>
                              Lv.{skill.level}
                            </span>
                          )}
                          <span style={{
                            fontSize: '9px',
                            padding: '1px 5px',
                            background: skill.type === 'heal' ? 'rgba(16, 185, 129, 0.15)' : skill.type === 'passive' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: skill.type === 'heal' ? '#10b981' : skill.type === 'passive' ? '#eab308' : '#ef4444',
                            border: `1px solid ${skill.type === 'heal' ? '#10b98133' : skill.type === 'passive' ? '#eab30833' : '#ef444433'}`,
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>{skill.type}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{skill.description}</p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        {skill.type !== 'passive' ? (
                          <>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mp-color)' }}>{skill.mpCost} MP</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Energy Cost</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--xp-color)' }}>PASSIVE</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Skill Type</div>
                          </>
                        )}

                        {charData.sp > 0 && skill.level !== undefined && (
                          <button
                            onClick={() => upgradeSkill(selectedChar, skill.id)}
                            className="glass-button active"
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              height: '24px',
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: 'var(--xp-color)',
                              borderColor: 'rgba(234, 179, 8, 0.4)',
                              marginTop: '6px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            + Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activePanel === 'damage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fade-in 0.3s ease' }}>
              {/* Tactical Header */}
              <div className="textured-stripes" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                borderLeft: `4px solid ${charData.avatarColor}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Crosshair size={18} style={{ color: charData.avatarColor }} />
                  <div>
                    <h3 className="title-text" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>Aetheric Targeting & Resonance Projection</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Estimated impact indices based on target damage resistance coefficients.</p>
                  </div>
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: charData.avatarColor,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.02)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  letterSpacing: '0.05em'
                }}>
                  DIAGNOSTIC MATRIX: ACTIVE
                </div>
              </div>

              {/* Formula reference / specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}>
                <div className="glass-panel" style={{ padding: '10px 14px', background: 'rgba(78, 158, 255, 0.03)', borderColor: 'rgba(78, 158, 255, 0.15)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ether-cyan)' }}>PHYSICAL COEFFICIENT</span>
                  <p style={{ marginTop: '2px', color: 'var(--text-muted)' }}>Strike Damage = [Attack * (1.0~1.2)] - [Defense * 0.5]</p>
                </div>
                <div className="glass-panel" style={{ padding: '10px 14px', background: 'rgba(185, 117, 255, 0.03)', borderColor: 'rgba(185, 117, 255, 0.15)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--astral-purple)' }}>ETHER RESONANCE</span>
                  <p style={{ marginTop: '2px', color: 'var(--text-muted)' }}>Spell Damage = [(Ether * Multiplier) * (1.0~1.2)] - [Defense * 0.4]</p>
                </div>
              </div>

              {/* Projection Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {actionsList.map(action => {
                  const forecast = getDamageForecast(action);
                  const isHeal = forecast.type === 'heal';
                  
                  const parseAverage = (rangeStr) => {
                    if (isHeal) return parseFloat(rangeStr.replace(' HP', '')) || 0;
                    const [min, max] = rangeStr.split(' - ').map(parseFloat);
                    return (min + max) / 2;
                  };
                  
                  const avgVs5 = parseAverage(forecast.vs5);
                  const avgVs10 = parseAverage(forecast.vs10);
                  const avgVs20 = parseAverage(forecast.vs20);
                  
                  const maxSimulatedDmg = 120; // scale limit for visual bar length
                  const pct5 = Math.min(100, (avgVs5 / maxSimulatedDmg) * 100);
                  const pct10 = Math.min(100, (avgVs10 / maxSimulatedDmg) * 100);
                  const pct20 = Math.min(100, (avgVs20 / maxSimulatedDmg) * 100);

                  return (
                    <div
                      key={action.id}
                      className="glass-panel textured-grid"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: 'rgba(0,0,0,0.2)',
                        transition: 'all 0.25s var(--ease-bounce-spring)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                        e.currentTarget.style.borderColor = charData.avatarColor;
                        e.currentTarget.style.boxShadow = `0 4px 15px ${charData.avatarColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {/* Top row: name, formula, action type badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: isHeal ? '#10b981' : charData.avatarColor,
                            textShadow: `0 0 10px ${isHeal ? '#10b981' : charData.avatarColor}22`
                          }}>
                            {forecast.name}
                          </span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isHeal ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isHeal ? '#10b981' : '#ef4444',
                            border: `1px solid ${isHeal ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                            letterSpacing: '0.05em'
                          }}>
                            {isHeal ? 'SPIRIT HEAL' : 'COMBAT DAMAGE'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>BASE CALC:</span>
                          <span style={{
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}>{forecast.formula}</span>
                        </div>
                      </div>

                      {/* Bottom row: target diagnostics or heal projection */}
                      {isHeal ? (
                        <div className="glass-panel" style={{
                          padding: '10px 14px',
                          background: 'rgba(16, 185, 129, 0.03)',
                          borderColor: 'rgba(16, 185, 129, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Heart size={16} color="#10b981" />
                            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Azrael / Azrin Recovery Projection</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>{forecast.vs5}</span>
                            <div style={{ width: '120px', height: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '12px'
                        }}>
                          {/* Light (5) Card */}
                          <div className="glass-panel" style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.15)',
                            borderLeft: '3px solid #10b981',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>LIGHT DEF (5)</span>
                              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '9px', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 4px', borderRadius: '3px' }}>VULNERABLE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{forecast.vs5}</span>
                              <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct5}%`, height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                              </div>
                            </div>
                          </div>

                          {/* Medium (10) Card */}
                          <div className="glass-panel" style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.15)',
                            borderLeft: '3px solid var(--xp-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>MED DEF (10)</span>
                              <span style={{ color: 'var(--xp-color)', fontWeight: 700, fontSize: '9px', background: 'rgba(234, 179, 8, 0.12)', padding: '1px 4px', borderRadius: '3px' }}>STANDARD</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{forecast.vs10}</span>
                              <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct10}%`, height: '100%', background: 'var(--xp-color)', borderRadius: '2px' }}></div>
                              </div>
                            </div>
                          </div>

                          {/* Heavy (20) Card */}
                          <div className="glass-panel" style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.15)',
                            borderLeft: '3px solid var(--hp-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>HEAVY DEF (20)</span>
                              <span style={{ color: 'var(--hp-color)', fontWeight: 700, fontSize: '9px', background: 'rgba(255, 74, 107, 0.12)', padding: '1px 4px', borderRadius: '3px' }}>ARMORED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{forecast.vs20}</span>
                              <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct20}%`, height: '100%', background: 'var(--hp-color)', borderRadius: '2px' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
