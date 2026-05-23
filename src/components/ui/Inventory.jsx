import { useState } from 'react';
import { X, Heart, Shield, Zap, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore, recalculateCharacterStats } from '../../store/gameStore';

export default function Inventory({ onClose }) {
  const inventory = useGameStore(state => state.inventory);
  const characters = useGameStore(state => state.characters);
  const useItem = useGameStore(state => state.useItem);
  const equipItem = useGameStore(state => state.equipItem);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'consumable' | 'equipment'
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || null);

  const items = inventory.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'consumable') return item.type === 'consumable';
    if (activeFilter === 'equipment') return item.type === 'weapon' || item.type === 'accessory';
    return true;
  });

  const selectedItem = inventory.find(i => i.id === selectedItemId);

  // Helper for equipment stat preview
  const getStatPreview = (charName) => {
    const char = characters[charName];
    if (!char || !selectedItem || (selectedItem.type !== 'weapon' && selectedItem.type !== 'accessory')) return null;

    if (selectedItem.type === 'weapon' && selectedItem.targetChar && selectedItem.targetChar !== charName) {
      return { incompatible: true };
    }

    const simulatedInventory = inventory.map(invItem => {
      // Unequip item of the same type currently equipped on this character
      if (invItem.type === selectedItem.type && invItem.targetChar === charName && invItem.equipped) {
        return { ...invItem, equipped: false };
      }
      // Equip the new item
      if (invItem.id === selectedItem.id) {
        return { ...invItem, equipped: true, targetChar: charName };
      }
      return invItem;
    });

    const simulatedChar = recalculateCharacterStats(char, simulatedInventory);

    const statsList = [
      { key: 'attack', label: 'Attack', current: char.stats.attack, simulated: simulatedChar.stats.attack },
      { key: 'defense', label: 'Defense', current: char.stats.defense, simulated: simulatedChar.stats.defense },
      { key: 'speed', label: 'Speed', current: char.stats.speed, simulated: simulatedChar.stats.speed },
      { key: 'ether', label: 'Ether', current: char.stats.ether, simulated: simulatedChar.stats.ether },
      { key: 'maxHp', label: 'Max HP', current: char.maxHp, simulated: simulatedChar.maxHp },
      { key: 'maxMp', label: 'Max MP', current: char.maxMp, simulated: simulatedChar.maxMp },
    ];

    return { statsList, incompatible: false };
  };

  // Automatically update selection if selected item is no longer in inventory
  const handleItemUse = (itemId, targetChar) => {
    useItem(itemId, targetChar);
    // Re-check if item still exists
    setTimeout(() => {
      const updatedInv = useGameStore.getState().inventory;
      const stillExists = updatedInv.some(i => i.id === itemId);
      if (!stillExists) {
        setSelectedItemId(updatedInv[0]?.id || null);
      }
    }, 50);
  };

  return (
    <div className="glass-panel interactive" style={{
      position: 'absolute',
      top: '90px',
      right: '50px',
      width: '740px',
      height: 'calc(100vh - 180px)',
      maxHeight: '620px',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
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
          <Sparkles size={20} className="text-secondary" style={{ color: 'var(--xp-color)' }} />
          <span className="title-text" style={{ fontSize: '18px', fontWeight: 600 }}>Bag & Etheric Gear</span>
        </div>
        <button className="glass-button" onClick={onClose} style={{ padding: '6px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Main layout split */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Side: Items grid and filters */}
        <div className="textured-grid" style={{
          width: '420px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'consumable', 'equipment'].map(filter => (
              <button
                key={filter}
                className={`glass-button ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(filter);
                  // Auto-select first item in filtered list
                  const filtered = inventory.filter(item => {
                    if (filter === 'all') return true;
                    if (filter === 'consumable') return item.type === 'consumable';
                    if (filter === 'equipment') return item.type === 'weapon' || item.type === 'accessory';
                    return true;
                  });
                  setSelectedItemId(filtered[0]?.id || null);
                }}
                style={{ flex: 1, textTransform: 'capitalize', fontSize: '12px', padding: '6px 12px' }}
              >
                {filter === 'all' ? 'All Items' : filter === 'consumable' ? 'Consumables' : 'Equipment'}
              </button>
            ))}
          </div>

          {/* Grid list */}
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '8px'
              }}>
                <AlertCircle size={24} />
                <span style={{ fontSize: '13px' }}>Empty category slot</span>
              </div>
            ) : (
              <div className="inventory-grid" style={{ maxHeight: 'none', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {items.map(item => {
                  const isSelected = selectedItemId === item.id;
                  const isEquipped = item.equipped;
                  
                  const slotTypeClass = item.type === 'consumable' 
                    ? 'slot-consumable' 
                    : item.type === 'weapon' 
                      ? 'slot-weapon' 
                      : 'slot-accessory';
                      
                  const slotEmoji = item.type === 'consumable' ? '🧪' : item.type === 'weapon' ? '⚔️' : '🛡️';
                  
                  return (
                    <div
                      key={item.id}
                      className={`inventory-slot ${slotTypeClass} ${isSelected ? 'active' : ''} ${isEquipped ? 'equipped' : ''}`}
                      onClick={() => setSelectedItemId(item.id)}
                      style={{ padding: '8px' }}
                    >
                      {/* Simple item icon placeholders with colors based on item types */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: item.type === 'consumable' ? 'rgba(16, 185, 129, 0.12)' : item.type === 'weapon' ? 'rgba(78, 158, 255, 0.12)' : 'rgba(185, 117, 255, 0.12)',
                        border: `1px solid ${item.type === 'consumable' ? 'rgba(16, 185, 129, 0.3)' : item.type === 'weapon' ? 'rgba(78, 158, 255, 0.3)' : 'rgba(185, 117, 255, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: `0 0 10px ${item.type === 'consumable' ? 'rgba(16, 185, 129, 0.1)' : item.type === 'weapon' ? 'rgba(78, 158, 255, 0.1)' : 'rgba(185, 117, 255, 0.1)'}`
                      }}>
                        {slotEmoji}
                      </div>
                      
                      <div style={{
                        fontSize: '11px',
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        right: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 600 : 400,
                        textAlign: 'center'
                      }}>
                        {item.name}
                      </div>

                      {item.count > 1 && (
                        <div className="item-count">x{item.count}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected item details panel */}
        <div style={{
          flexGrow: 1,
          padding: '24px',
          background: 'rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}>
          {selectedItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: selectedItem.type === 'consumable' ? '#10b981' : '#4e9eff',
                    letterSpacing: '0.08em'
                  }}>{selectedItem.type}</span>
                  {selectedItem.equipped && (
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: 'var(--xp-color)',
                      padding: '1px 5px',
                      border: '1px solid rgba(234, 179, 8, 0.25)',
                      borderRadius: '4px'
                    }}>Active Equipped</span>
                  )}
                </div>
                <h2 className="title-text" style={{ fontSize: '22px', fontWeight: 700 }}>{selectedItem.name}</h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  "{selectedItem.description}"
                </p>
              </div>

              {/* Stats / Effects display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Properties & Modifiers</h4>
                <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.15)' }}>
                  {selectedItem.type === 'consumable' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedItem.effect}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Object.keys(selectedItem.stats || {}).map(statKey => (
                        <div key={statKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                            {statKey === 'maxMp' ? 'Max MP' : statKey}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--ether-cyan)' }}>+{selectedItem.stats[statKey]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stat Comparison / Equip Preview */}
              {selectedItem && (selectedItem.type === 'weapon' || selectedItem.type === 'accessory') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Equip Stat Preview</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {Object.keys(characters).map(charName => {
                      const preview = getStatPreview(charName);
                      const char = characters[charName];
                      if (!preview) return null;
                      
                      return (
                        <div key={charName} className="glass-panel" style={{
                          flex: 1,
                          padding: '12px',
                          background: 'rgba(0,0,0,0.15)',
                          borderLeft: `3px solid ${char.avatarColor}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '12px', color: char.avatarColor }}>{charName}</div>
                          {preview.incompatible ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                              Incompatible weapon
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {preview.statsList.map(stat => {
                                const diff = stat.simulated - stat.current;
                                if (diff === 0) return null; // Only show stats that change!
                                
                                return (
                                  <div key={stat.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{stat.current} ➜</span>
                                      <span style={{ fontWeight: 600, color: '#fff' }}>{stat.simulated}</span>
                                      <span style={{
                                        fontWeight: 700,
                                        color: diff > 0 ? '#10b981' : '#ef4444',
                                        fontSize: '11px'
                                      }}>
                                        ({diff > 0 ? `+${diff}` : diff})
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              {preview.statsList.every(stat => stat.simulated === stat.current) && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                                  Active (Already equipped)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons: Use / Equip targeting Azrin/Azrael */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Selection</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Azrin Action */}
                  <button
                    className="glass-button"
                    disabled={selectedItem.type === 'weapon' && selectedItem.targetChar && selectedItem.targetChar !== 'Azrin'}
                    onClick={() => {
                      if (selectedItem.type === 'consumable') {
                        handleItemUse(selectedItem.id, 'Azrin');
                      } else {
                        equipItem(selectedItem.id, 'Azrin');
                      }
                    }}
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      borderLeft: '4px solid var(--ether-cyan)',
                      background: 'linear-gradient(90deg, rgba(78, 158, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span>Use on Azrin</span>
                  </button>

                  {/* Azrael Action */}
                  <button
                    className="glass-button"
                    disabled={selectedItem.type === 'weapon' && selectedItem.targetChar && selectedItem.targetChar !== 'Azrael'}
                    onClick={() => {
                      if (selectedItem.type === 'consumable') {
                        handleItemUse(selectedItem.id, 'Azrael');
                      } else {
                        equipItem(selectedItem.id, 'Azrael');
                      }
                    }}
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      borderLeft: '4px solid var(--astral-purple)',
                      background: 'linear-gradient(90deg, rgba(185, 117, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span>Use on Azrael</span>
                  </button>
                </div>
                {selectedItem.type === 'weapon' && selectedItem.targetChar && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    * This weapon can only be equipped by {selectedItem.targetChar}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              Select an item to inspect its details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
