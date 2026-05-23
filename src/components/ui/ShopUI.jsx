import { useState } from 'react';
import { X, Coins, Sparkles, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const SHOP_ITEMS = [
  { id: 'health_flask', name: 'Health Flask', type: 'consumable', cost: 30, value: 70, valueType: 'hp', effect: 'HP +70', description: 'Condensed spirit energy that heals flesh and spirit.', icon: '🧪' },
  { id: 'ether_elixir', name: 'Ether Elixir', type: 'consumable', cost: 30, value: 50, valueType: 'mp', effect: 'MP +50', description: 'Liquid stardust staves off mental exhaustion.', icon: '🧪' },
  { id: 'celestial_feather', name: 'Celestial Feather', type: 'consumable', cost: 60, value: 0, valueType: 'revive', effect: 'Revive (50% HP)', description: 'A warm starlight feather to recall fallen spirits.', icon: '🪶' },
  { id: 'starlight_sabre', name: 'Starlight Sabre', type: 'weapon', cost: 120, targetChar: 'Azrin', stats: { attack: 28 }, description: 'A sleek meteor blade humming with celestial energy.', icon: '⚔️' },
  { id: 'cosmic_wand', name: 'Cosmic Wand', type: 'weapon', cost: 120, targetChar: 'Azrael', stats: { ether: 32 }, description: 'A dark matter rod that concentrates astral fire.', icon: '🪄' },
  { id: 'spirit_shield', name: 'Spirit Shield', type: 'accessory', cost: 100, stats: { defense: 12, maxHp: 30 }, description: 'An ethereal warding sigil projecting a strong barrier.', icon: '🛡️' }
];

export default function ShopUI({ onClose }) {
  const gold = useGameStore(state => state.gold);
  const buyItem = useGameStore(state => state.buyItem);
  const [selectedItemId, setSelectedItemId] = useState(SHOP_ITEMS[0].id);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const selectedItem = SHOP_ITEMS.find(i => i.id === selectedItemId);

  const handleBuy = () => {
    if (!selectedItem || gold < selectedItem.cost) return;
    buyItem(selectedItem);
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 1500);
  };

  return (
    <div className="glass-panel interactive" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '740px',
      height: '520px',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-in 0.3s ease',
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
          <ShoppingBag size={20} style={{ color: 'var(--xp-color)' }} />
          <span className="title-text" style={{ fontSize: '18px', fontWeight: 600 }}>Etheric Shard Exchange</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            fontWeight: 600,
            color: 'var(--xp-color)',
            borderRadius: '8px'
          }}>
            <Coins size={14} />
            <span>{gold} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Shards</span></span>
          </div>
          <button className="glass-button" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main layout split */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Side: Items list */}
        <div className="textured-grid" style={{
          width: '400px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto'
        }}>
          {SHOP_ITEMS.map(item => {
            const isSelected = selectedItemId === item.id;
            const canAfford = gold >= item.cost;
            
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                  border: `1px solid ${isSelected ? 'var(--xp-color)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s var(--ease-bounce-spring)',
                  opacity: canAfford ? 1 : 0.65,
                  transform: isSelected ? 'scale(1.03)' : 'none',
                  boxShadow: isSelected ? '0 4px 15px rgba(234, 179, 8, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: item.type === 'consumable' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(78, 158, 255, 0.15)',
                    border: `1px solid ${item.type === 'consumable' ? '#10b98144' : '#4e9eff44'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: isSelected ? 'var(--xp-color)' : 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.type}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: canAfford ? 'var(--xp-color)' : 'var(--hp-color)' }}>
                  <Coins size={12} />
                  <span style={{ fontSize: '13px' }}>{item.cost}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Preview & Buy */}
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
                  {selectedItem.targetChar && (
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}>Fits {selectedItem.targetChar}</span>
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
                <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Item Details</h4>
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
                            {statKey === 'maxHp' ? 'Max HP' : statKey}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--ether-cyan)' }}>+{selectedItem.stats[statKey]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase button */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {purchaseSuccess ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    animation: 'pop-bounce 0.35s var(--ease-bounce-spring) forwards'
                  }}>
                    <CheckCircle size={16} />
                    <span>Purchase Successful!</span>
                  </div>
                ) : (
                  <button
                    className={`glass-button ${gold >= selectedItem.cost ? 'active' : ''}`}
                    disabled={gold < selectedItem.cost}
                    onClick={handleBuy}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontWeight: 600,
                      fontSize: '15px',
                      borderColor: gold >= selectedItem.cost ? 'var(--xp-color)' : 'rgba(255,255,255,0.08)',
                      color: gold >= selectedItem.cost ? 'var(--xp-color)' : 'var(--text-muted)'
                    }}
                  >
                    {gold >= selectedItem.cost ? (
                      <>
                        <Coins size={16} />
                        <span>Buy for {selectedItem.cost} Shards</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        <span>Insufficient Shards</span>
                      </>
                    )}
                  </button>
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
              Select an item to buy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
