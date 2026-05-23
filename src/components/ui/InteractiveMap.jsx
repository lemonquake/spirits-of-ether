import { useState } from 'react';
import { X, Search, Compass, ShieldAlert, Sparkles, Home, Flame, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

// Static template details for tooltips and details panel
const MAP_LANDMARKS = [
  { id: 'merchant', name: 'Etheric Shard Merchant', x: 0, z: 4, icon: '⚖️', desc: 'Exchange gold for flasks, weapons, and accessories to power up your stats.' },
  { id: 'dadilo_alex', name: 'Dadilo Alex', x: -12, z: 22, icon: '🧙‍♂️', desc: 'Shoreline watcher. Talk to him to accept the Purification Quest.' },
  { id: 'campsite_fire', name: 'Beach Campfire', x: -10, z: 24, icon: '🔥', desc: 'A cozy hearth sending smoke signals into the sunset. A safe place for travelers.' },
  { id: 'campsite_hut1', name: 'Straw Beach Hut A', x: -15, z: 25, icon: '🛖', desc: 'A sturdy straw-roofed hut built by beachcombers.' },
  { id: 'campsite_hut2', name: 'Straw Beach Hut B', x: -6, z: 26, icon: '🛖', desc: 'A slightly smaller straw shelter nearby the fireplace.' }
];

const MAP_CRYSTALS = [
  { id: 'c1', name: 'Cyan Shard Node A', x: -18, z: -14, color: '#00ffff', alignment: 'Water Affinity', desc: 'A hum of raw cold starlight flows from this node. Cools the hot sand.' },
  { id: 'c2', name: 'Astral Shard Node A', x: 18, z: -22, color: '#d8b4fe', alignment: 'Celestial Affinity', desc: 'Bridges physical space with the void. Emits soft twilight sparks.' },
  { id: 'c3', name: 'Cyan Shard Node B', x: -16, z: 10, color: '#00ffff', alignment: 'Water Affinity', desc: 'Feeds clean moisture to the shoreline grass. Radiates cyan waves.' },
  { id: 'c4', name: 'Astral Shard Node B', x: 22, z: 8, color: '#d8b4fe', alignment: 'Celestial Affinity', desc: 'Attracts falling stardust. Glows brighter as night falls.' },
  { id: 'c5', name: 'Solar Shard Node', x: 0, z: -32, color: '#ffb700', alignment: 'Fire/Sun Affinity', desc: 'Radiates intense heat. Keeps the northern grass green and lush.' }
];

const MONSTER_LORE = {
  slime: { name: 'Void Slime Pack', maxHp: 120, attack: 10, defense: 4, speed: 10, skills: ['Acid Tackle', 'Slime Spit', 'Acid Bubble'], desc: 'Jelly-like void creatures that spit corrosion.' },
  skeleton_grunt: { name: 'Void Skirmishers', maxHp: 200, attack: 16, defense: 10, speed: 12, skills: ['Bone Slash', 'Void Summon', 'Shield Wall'], desc: 'Reanimated bones corrupted by void anomalies.' },
  finster_krab: { name: 'Finster Krab Pair', maxHp: 160, attack: 12, defense: 8, speed: 10, skills: ['Claw Pinch', 'Bubble Foam', 'Hard Shell'], desc: 'Giant sand crabs with void-darkened shells.' },
  torchoise: { name: 'Volcanic Torchoise Pack', maxHp: 220, attack: 14, defense: 14, speed: 7, skills: ['Flame Charge', 'Lava Spit', 'Withdraw'], desc: 'Tough-shelled tortoises spitting molten lava.' },
  boss: { name: 'Boss Anomaly Team', maxHp: 220, attack: 18, defense: 14, speed: 15, skills: ['Flame Charge', 'Sandstorm', 'Void Summon'], desc: 'The core singularity anomaly spreading twilight sickness.' }
};

const MONSTERS_LIST = [
  { id: 'enemy_void_1', type: 'slime', name: 'Void Slime Pack', x: -6, z: -8 },
  { id: 'enemy_void_2', type: 'skeleton_grunt', name: 'Void Skirmishers', x: 12, z: -12 },
  { id: 'enemy_void_3', type: 'skeleton_grunt', name: 'Wight Vanguard', x: -15, z: -22 },
  { id: 'enemy_krab_1', type: 'finster_krab', name: 'Finster Krab Pair', x: 15, z: 18 },
  { id: 'enemy_krab_2', type: 'finster_krab', name: 'Beach Skirmishers', x: -25, z: 20 },
  { id: 'enemy_torchoise_1', type: 'torchoise', name: 'Torchoise Pack', x: 22, z: 12 },
  { id: 'enemy_boss_anomaly', type: 'boss', name: 'Boss Anomaly', x: 0, z: 28 }
];

export default function InteractiveMap({ onClose }) {
  const playerPosition = useGameStore(state => state.playerPosition);
  const defeatedEnemies = useGameStore(state => state.defeatedEnemies);
  const quest = useGameStore(state => state.quest);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'monsters' | 'crystals' | 'landmarks'
  const [selectedDetails, setSelectedDetails] = useState(null); // { type, name, data }

  // Map coordinates [-55, 55] to percentage [0, 100]
  const mapCoords = (coord) => {
    return ((coord + 55) / 110) * 100;
  };

  const pX = mapCoords(playerPosition[0]);
  const pZ = mapCoords(playerPosition[2]);

  // Filter lists based on query and filter tab
  const filterMatches = (name) => {
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const showMonsters = activeFilter === 'all' || activeFilter === 'monsters';
  const showCrystals = activeFilter === 'all' || activeFilter === 'crystals';
  const showLandmarks = activeFilter === 'all' || activeFilter === 'landmarks';

  const handleMarkerClick = (type, name, data) => {
    setSelectedDetails({ type, name, data });
  };

  return (
    <div className="main-menu-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(7, 5, 4, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-game)',
      pointerEvents: 'auto'
    }}>
      {/* Map modal frame */}
      <div className="glass-panel" style={{
        width: '920px',
        maxWidth: '95vw',
        height: '620px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(30,18,11,0.98) 0%, rgba(15,9,5,0.99) 100%)',
        animation: 'pop-bounce-center 0.4s var(--ease-bounce-spring) forwards',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={20} color="var(--rpg-gold)" style={{ animation: 'pulse-glow 2s infinite' }} />
            <span className="title-text" style={{ fontSize: '18px', fontWeight: 600 }}>Cartographer's Archives - Beach Shore</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search map details..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '6px',
                  padding: '6px 30px 6px 12px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Search size={14} color="var(--rpg-gold)" style={{ position: 'absolute', right: '10px', top: '8px' }} />
            </div>

            <button className="glass-button" onClick={onClose} style={{ padding: '6px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div style={{
          padding: '8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '10px',
          background: 'rgba(0,0,0,0.08)'
        }}>
          {['all', 'monsters', 'crystals', 'landmarks'].map(filter => (
            <button
              key={filter}
              className={`glass-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter(filter);
                setSelectedDetails(null);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 12px',
                textTransform: 'capitalize'
              }}
            >
              <span>{filter === 'all' ? 'All Markers' : filter}</span>
            </button>
          ))}

          {quest.state === 'ACTIVE' && (
            <div style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: 'var(--xp-color)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={12} />
              <span>Purified: {defeatedEnemies.length} / 7 Anomalies</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          
          {/* Left: Map viewport (70% width) */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'var(--wood-dark)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            {/* 2D Topological Map Graphics */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.85)'
            }}>
              
              {/* Region 1: Valleys & Forests (Z < 17) -> 65% height */}
              <div style={{
                height: '65%',
                width: '100%',
                background: 'linear-gradient(180deg, #1f2d12 0%, #2f431b 60%, #455a29 100%)',
                position: 'relative',
                boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.6)'
              }}>
                {/* Visual mountain details */}
                <div style={{ position: 'absolute', top: '15%', left: '20%', width: '120px', height: '60px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%', filter: 'blur(10px)' }} />
                <div style={{ position: 'absolute', top: '35%', left: '70%', width: '140px', height: '50px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%', filter: 'blur(10px)' }} />
              </div>

              {/* Region 2: Sand Shoreline (Z 17 to 30) -> 13% height */}
              <div style={{
                height: '13%',
                width: '100%',
                background: 'linear-gradient(180deg, #bda275 0%, #d4b27b 50%, #c49d66 100%)',
                position: 'relative',
                borderTop: '2px dashed rgba(255,255,255,0.08)'
              }}>
                {/* Shore wetness ripples */}
                <div style={{ position: 'absolute', bottom: '0', width: '100%', height: '3px', background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Region 3: Deep Sea (Z 30 to 55) -> 22% height */}
              <div style={{
                height: '22%',
                width: '100%',
                background: 'linear-gradient(180deg, #093145 0%, #062333 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* CSS animated water ripple wave strips */}
                <div className="water-wave-line" style={{ top: '20px', animationDelay: '0s' }} />
                <div className="water-wave-line" style={{ top: '50px', animationDelay: '1.5s' }} />
                <div className="water-wave-line" style={{ top: '80px', animationDelay: '0.8s' }} />
              </div>

              {/* Grid coordinate overlay lines */}
              <div className="map-grid-lines" />

              {/* --- MAP MARKERS LAYER --- */}

              {/* 1. Landmarks (Merchant, NPC, Campsite) */}
              {showLandmarks && MAP_LANDMARKS.map(lm => {
                const visible = filterMatches(lm.name);
                if (!visible) return null;

                const left = mapCoords(lm.x);
                const top = mapCoords(lm.z);
                const isSelected = selectedDetails?.type === 'landmark' && selectedDetails?.data.id === lm.id;

                return (
                  <div
                    key={lm.id}
                    onClick={() => handleMarkerClick('landmark', lm.name, lm)}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 35,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--rpg-gold)' : 'var(--wood-medium)',
                      border: `1.5px solid ${isSelected ? '#fff' : 'var(--rpg-gold)'}`,
                      boxShadow: isSelected ? '0 0 12px #fff' : '0 4px 8px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      transition: 'transform 0.15s ease'
                    }}
                    className="map-marker-hover"
                    >
                      {lm.icon}
                    </div>
                    {/* Hover text query search highlight */}
                    {searchQuery && lm.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                      <div className="search-highlight-ring" />
                    )}
                  </div>
                );
              })}

              {/* 2. Shard Node Crystals */}
              {showCrystals && MAP_CRYSTALS.map(crystal => {
                const visible = filterMatches(crystal.name) || filterMatches(crystal.alignment);
                if (!visible) return null;

                const left = mapCoords(crystal.x);
                const top = mapCoords(crystal.z);
                const isSelected = selectedDetails?.type === 'crystal' && selectedDetails?.data.id === crystal.id;

                return (
                  <div
                    key={crystal.id}
                    onClick={() => handleMarkerClick('crystal', crystal.name, crystal)}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      transform: 'rotate(45deg)',
                      background: crystal.color,
                      border: `1.5px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                      boxShadow: `0 0 10px ${crystal.color}`,
                      animation: 'pulse-glow 1.5s infinite alternate ease-in-out'
                    }}
                    className="map-marker-hover"
                    />
                    {searchQuery && crystal.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                      <div className="search-highlight-ring" />
                    )}
                  </div>
                );
              })}

              {/* 3. Patrolling Monsters */}
              {showMonsters && MONSTERS_LIST.map(monster => {
                const isDefeated = defeatedEnemies.includes(monster.id);
                const lore = MONSTER_LORE[monster.type];
                const visible = filterMatches(monster.name) || filterMatches(lore.name);
                if (!visible) return null;

                const left = mapCoords(monster.x);
                const top = mapCoords(monster.z);
                const isSelected = selectedDetails?.type === 'monster' && selectedDetails?.data.id === monster.id;

                return (
                  <div
                    key={monster.id}
                    onClick={() => handleMarkerClick('monster', monster.name, { ...monster, ...lore, isDefeated })}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 40,
                      pointerEvents: 'auto'
                    }}
                  >
                    <div style={{
                      width: monster.type === 'boss' ? '28px' : '22px',
                      height: monster.type === 'boss' ? '28px' : '22px',
                      borderRadius: '4px',
                      background: isDefeated ? '#4b5563' : (monster.type === 'boss' ? '#ea580c' : '#b91c1c'),
                      border: `1.5px solid ${isSelected ? '#fff' : (isDefeated ? '#9ca3af' : 'var(--hp-color)')}`,
                      boxShadow: isDefeated ? 'none' : `0 0 10px ${monster.type === 'boss' ? '#ea580c' : 'var(--hp-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: monster.type === 'boss' ? '12px' : '10px',
                      color: '#fff',
                      fontWeight: 800
                    }}
                    className="map-marker-hover"
                    >
                      {isDefeated ? '💚' : (monster.type === 'boss' ? '💀' : '👹')}
                    </div>
                    {/* Defeated crossed status label */}
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      whiteSpace: 'nowrap',
                      background: isDefeated ? 'rgba(16, 185, 129, 0.85)' : 'rgba(0,0,0,0.6)',
                      fontSize: '8px',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      border: `1px solid ${isDefeated ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 700
                    }}>
                      {isDefeated ? 'PURIFIED' : (monster.type === 'boss' ? 'BOSS' : 'ANOMALY')}
                    </div>
                    {searchQuery && monster.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                      <div className="search-highlight-ring" />
                    )}
                  </div>
                );
              })}

              {/* 4. Player compass marker */}
              <div style={{
                position: 'absolute',
                left: `${pX}%`,
                top: `${pZ}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--wood-dark)',
                  border: '2px solid var(--rpg-gold)',
                  boxShadow: '0 0 15px var(--rpg-gold), 0 0 5px #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse-glow 1s infinite alternate ease-in-out'
                }}>
                  {/* Compass pointer */}
                  <Compass size={16} color="var(--rpg-gold)" />
                </div>
                
                {/* Pointer wave ring */}
                <div style={{
                  position: 'absolute',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid var(--rpg-gold)',
                  animation: 'map-pulse-ripple 1.8s infinite linear',
                  opacity: 0
                }} />
                
                {/* Small indicator label */}
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  background: 'rgba(30,18,11,0.9)',
                  border: '1px solid var(--rpg-gold)',
                  fontSize: '8px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  color: 'var(--rpg-gold)',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}>
                  YOU ARE HERE
                </div>
              </div>

            </div>
          </div>

          {/* Right: Details / Diagnostic Card (30% width) */}
          <div style={{
            width: '280px',
            background: 'rgba(0,0,0,0.25)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            {selectedDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fade-in 0.3s ease' }}>
                {/* Badge Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedDetails.type === 'monster' ? 'var(--hp-color)' : (selectedDetails.type === 'crystal' ? 'var(--ether-cyan)' : 'var(--xp-color)'),
                    letterSpacing: '0.08em'
                  }}>
                    {selectedDetails.type} info
                  </span>
                  {selectedDetails.type === 'monster' && (
                    <span style={{
                      fontSize: '9px',
                      background: selectedDetails.data.isDefeated ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: selectedDetails.data.isDefeated ? '#10b981' : '#ef4444',
                      border: `1px solid ${selectedDetails.data.isDefeated ? '#10b98133' : '#ef444433'}`,
                      borderRadius: '4px',
                      padding: '1px 5px',
                      fontWeight: 700
                    }}>
                      {selectedDetails.data.isDefeated ? 'PURIFIED' : 'ACTIVE CORRUPTION'}
                    </span>
                  )}
                </div>

                <h3 className="title-text" style={{ fontSize: '16px', margin: 0 }}>
                  {selectedDetails.name}
                </h3>

                {/* Coordinates */}
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>GRID POSITION:</span>
                  <span>[{selectedDetails.data.x.toFixed(0)}, {selectedDetails.data.z.toFixed(0)}]</span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  "{selectedDetails.data.desc}"
                </p>

                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                {/* Type specific information */}
                
                {/* 1. Crystal specifics */}
                {selectedDetails.type === 'crystal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ELEMENTAL RESISTANCE</div>
                    <div className="glass-panel" style={{
                      padding: '10px',
                      background: 'rgba(0,0,0,0.15)',
                      fontSize: '12px',
                      color: selectedDetails.data.color,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Sparkles size={14} />
                      <span>{selectedDetails.data.alignment}</span>
                    </div>
                  </div>
                )}

                {/* 2. Landmark specifics (Merchant inventory preview) */}
                {selectedDetails.type === 'landmark' && selectedDetails.data.id === 'merchant' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MERCHANT STOCK</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { n: 'Health Flask', c: '30 Gold' },
                        { n: 'Ether Elixir', c: '30 Gold' },
                        { n: 'Celestial Feather', c: '60 Gold' },
                        { n: 'Starlight Sabre', c: '120 Gold' },
                        { n: 'Cosmic Wand', c: '120 Gold' }
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.n}</span>
                          <span style={{ color: 'var(--xp-color)', fontWeight: 600 }}>{item.c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Monster stats card */}
                {selectedDetails.type === 'monster' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ANOMALY DIAGNOSTIC INDEX</div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px',
                      fontSize: '11px'
                    }}>
                      <div className="glass-panel" style={{ padding: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>MAX HP</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--hp-color)', marginTop: '2px' }}>
                          {selectedDetails.data.maxHp}
                        </div>
                      </div>
                      <div className="glass-panel" style={{ padding: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>ATTACK</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                          {selectedDetails.data.attack}
                        </div>
                      </div>
                      <div className="glass-panel" style={{ padding: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>DEFENSE</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ether-cyan)', marginTop: '2px' }}>
                          {selectedDetails.data.defense}
                        </div>
                      </div>
                      <div className="glass-panel" style={{ padding: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>SPEED</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--astral-purple)', marginTop: '2px' }}>
                          {selectedDetails.data.speed}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>COMBAT SKILLS USED</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedDetails.data.skills.map((skill, idx) => (
                        <div key={idx} style={{
                          fontSize: '11px',
                          background: 'rgba(185,117,255,0.04)',
                          border: '1px solid rgba(185,117,255,0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: 'var(--astral-purple)',
                          fontWeight: 500
                        }}>
                          ✨ {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
                textAlign: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={20} />
                <span>Select a marker on the map to inspect properties & lore.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Styled ripples for the map waves & player tracking ripple */}
      <style>{`
        .water-wave-line {
          position: absolute;
          left: -10%;
          width: 120%;
          height: 1px;
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 4px rgba(255,255,255,0.1);
          animation: wave-ripple-anim 4s infinite ease-in-out;
        }

        .map-grid-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .search-highlight-ring {
          position: absolute;
          width: 36px;
          height: 36px;
          border: 2px solid #fbbf24;
          border-radius: 50%;
          animation: map-pulse-ripple 1.5s infinite linear;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .map-marker-hover {
          transition: transform 0.2s var(--ease-bounce-spring), border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .map-marker-hover:hover {
          transform: scale(1.22) !important;
          border-color: #fff !important;
          box-shadow: 0 0 14px rgba(255,255,255,0.4) !important;
        }

        @keyframes wave-ripple-anim {
          0%, 100% { transform: translateX(0) scaleY(1); opacity: 0.2; }
          50% { transform: translateX(30px) scaleY(1.4); opacity: 0.6; }
        }

        @keyframes map-pulse-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
