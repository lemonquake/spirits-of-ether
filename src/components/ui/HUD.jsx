import { useEffect } from 'react';
import { User, Briefcase, Coins, Map, Pause } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function HUD({ activeTab, setActiveTab }) {
  const characters = useGameStore(state => state.characters);
  const gold = useGameStore(state => state.gold);
  const phase = useGameStore(state => state.phase);
  const isNearNPC = useGameStore(state => state.isNearNPC);
  const quest = useGameStore(state => state.quest);
  const dialogueActive = useGameStore(state => state.dialogue?.active);
  const isNearMerchant = useGameStore(state => state.isNearMerchant);
  const showShop = useGameStore(state => state.showShop);
  const setShowShop = useGameStore(state => state.setShowShop);
  const stamina = useGameStore(state => state.stamina);
  const maxStamina = useGameStore(state => state.maxStamina);
  const movementMode = useGameStore(state => state.movementMode);
  const isStaminaExhausted = useGameStore(state => state.isStaminaExhausted);
  const controlScheme = useGameStore(state => state.controlScheme);

  // Keyboard hotkeys for toggling UI tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'EXPLORING') return;
      const key = e.key.toLowerCase();
      if (key === 'c') {
        setActiveTab(prev => prev === 'character' ? null : 'character');
      } else if (key === 'i') {
        setActiveTab(prev => prev === 'inventory' ? null : 'inventory');
      } else if (key === 'm') {
        setActiveTab(prev => prev === 'map' ? null : 'map');
      } else if (key === 'e') {
        if (useGameStore.getState().isNearMerchant) {
          useGameStore.getState().setShowShop(!useGameStore.getState().showShop);
        }
      } else if (key === 'f') {
        const state = useGameStore.getState();
        if (state.isNearNPC && !state.dialogue.active) {
          const questState = state.quest.state;
          const isQuestDone = state.quest.slainCount >= 5;
          
          if (questState === 'NOT_STARTED') {
            state.startDialogue(
              "Dadilo Alex", 
              "dadilo_alex", 
              [
                "Greetings, young travelers. I am Dadilo Alex, watcher of these shorelines.",
                "A dark void corruption has infected the creatures here. The slimes, skeleton grunts, and sand crabs are out of control.",
                "Help me purify them. I need you to vanquish 5 void anomalies of any type on the shore.",
                "Once purified, their spirits will return to the Aether. Will you take on this quest?"
              ],
              null
            );
          } else if (questState === 'ACTIVE') {
            if (isQuestDone) {
              state.startDialogue(
                "Dadilo Alex",
                "dadilo_alex",
                [
                  "Incredible! I can feel the etheric flow clearing up already.",
                  "You have successfully purified the beach! The spirits are at peace.",
                  "Take this reward of 300 Gold and this Book of the Claves tome. Read it to restore your party's passive mana flow."
                ],
                () => {
                  state.completeQuest();
                }
              );
            } else {
              state.startDialogue(
                "Dadilo Alex",
                "dadilo_alex",
                [
                  "The beach is still infested with void creatures, travelers.",
                  `Please purify: ${state.quest.slainCount}/5 void anomalies.`,
                  "You can see your progress in the Quest Tracker on the left of the screen."
                ],
                null
              );
            }
          } else if (questState === 'COMPLETED') {
            state.startDialogue(
              "Dadilo Alex",
              "dadilo_alex",
              [
                "Thank you for purifying the shores. The spirits of the ocean flow in harmony now.",
                "The core anomaly at the far end of the shore remains deep, however. If you are strong enough, seek it out to restore absolute peace."
              ],
              null
            );
          }
        }
      } else if (e.key === 'Escape') {
        const state = useGameStore.getState();
        if (activeTab || state.showShop) {
          setActiveTab(null);
          state.setShowShop(false);
        } else {
          state.setIsPaused(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, setActiveTab]);

  if (phase !== 'EXPLORING') return null;

  return (
    <div className="overlay-container">
      {/* 1. Compact Party Stats (Top-Left) */}
      <div className="interactive" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'auto',
        zIndex: 10
      }}>
        {/* Azrin Compact */}
        <div className="glass-panel" style={{
          width: '220px',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderLeft: '4px solid var(--ether-cyan)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--ether-cyan)' }}>Azrin</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Lv.{characters.Azrin.level}</span>
          </div>
          {/* HP & MP side-by-side */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* HP */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span>HP</span>
                <span>{characters.Azrin.hp}/{characters.Azrin.maxHp}</span>
              </div>
              <div className="stat-bar-container" style={{ height: '6px' }}>
                <div className="stat-bar-fill hp" style={{ width: `${(characters.Azrin.hp / characters.Azrin.maxHp) * 100}%` }}></div>
              </div>
            </div>
            {/* MP */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span>MP</span>
                <span>{characters.Azrin.mp}/{characters.Azrin.maxMp}</span>
              </div>
              <div className="stat-bar-container" style={{ height: '6px' }}>
                <div className="stat-bar-fill mp" style={{ width: `${(characters.Azrin.mp / characters.Azrin.maxMp) * 100}%` }}></div>
              </div>
            </div>
          </div>
          {/* Stamina slim */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '2px' }}>
            <div className="stat-bar-container" style={{ height: '3px', border: 'none', background: 'rgba(0,0,0,0.5)' }}>
              <div 
                className="stat-bar-fill" 
                style={{ 
                  width: `${(stamina / maxStamina) * 100}%`,
                  background: isStaminaExhausted 
                    ? 'var(--hp-color)' 
                    : 'linear-gradient(90deg, #10b981, #34d399)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Azrael Compact */}
        <div className="glass-panel purple-glow" style={{
          width: '220px',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderLeft: '4px solid var(--astral-purple)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--astral-purple)' }}>Azrael</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Lv.{characters.Azrael.level}</span>
          </div>
          {/* HP & MP */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* HP */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span>HP</span>
                <span>{characters.Azrael.hp}/{characters.Azrael.maxHp}</span>
              </div>
              <div className="stat-bar-container" style={{ height: '6px' }}>
                <div className="stat-bar-fill hp" style={{ width: `${(characters.Azrael.hp / characters.Azrael.maxHp) * 100}%` }}></div>
              </div>
            </div>
            {/* MP */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span>MP</span>
                <span>{characters.Azrael.mp}/{characters.Azrael.maxMp}</span>
              </div>
              <div className="stat-bar-container" style={{ height: '6px' }}>
                <div className="stat-bar-fill mp" style={{ width: `${(characters.Azrael.mp / characters.Azrael.maxMp) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Gold Header (Top-Right) */}
      <div className="interactive" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'auto',
        zIndex: 10
      }}>
        {/* Currency gold */}
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          fontWeight: 700,
          color: 'var(--xp-color)',
          borderRadius: '8px',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          boxShadow: '0 0 15px rgba(234, 179, 8, 0.15)',
          fontSize: '14px'
        }}>
          <Coins size={15} />
          <span>{gold} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gold</span></span>
        </div>

        {/* Map toggle button */}
        <button
          className={`glass-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab(prev => prev === 'map' ? null : 'map')}
          style={{ padding: '8px 14px', fontSize: '12px', height: '36px' }}
        >
          <Map size={14} />
          <span>Map [M]</span>
        </button>

        {/* Pause toggle button */}
        <button
          className="glass-button"
          onClick={() => useGameStore.getState().setIsPaused(true)}
          style={{ padding: '8px 14px', fontSize: '12px', height: '36px' }}
        >
          <Pause size={14} />
          <span>Pause [Esc]</span>
        </button>
      </div>

      {/* 3. Quest Tracker Panel (Repositioned below compact stats) */}
      {quest.state === 'ACTIVE' && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '200px',
          left: '20px',
          width: '220px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderLeft: '4px solid var(--xp-color)',
          pointerEvents: 'auto',
          animation: 'fade-in 0.3s ease',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--xp-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Shore Purification
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span style={{ color: quest.slainCount >= 5 ? 'var(--ether-cyan)' : 'var(--text-secondary)' }}>
                👾 Void Anomalies
              </span>
              <span style={{ fontWeight: 600 }}>{quest.slainCount}/5</span>
            </div>
            <div className="stat-bar-container" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', border: 'none' }}>
              <div className="stat-bar-fill" style={{ 
                width: `${Math.min(100, ((quest.slainCount || 0) / 5) * 100)}%`, 
                background: 'var(--ether-cyan)',
                boxShadow: '0 0 5px var(--ether-cyan)',
                height: '100%'
              }}></div>
            </div>
          </div>
          
          {quest.slainCount >= 5 && (
            <div style={{ 
              fontSize: '9px', 
              color: 'var(--xp-color)', 
              fontWeight: 700, 
              textAlign: 'center', 
              marginTop: '4px', 
              animation: 'bounce-slow 2s infinite ease-in-out',
              textTransform: 'uppercase'
            }}>
              Quest Complete! Talk to Alex
            </div>
          )}
        </div>
      )}

      {/* Merchant Nearby alert prompt */}
      {isNearMerchant && !showShop && (
        <div style={{
          position: 'absolute',
          bottom: '125px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fade-in 0.3s ease',
          zIndex: 15
        }}>
          <div className="glass-panel" style={{
            padding: '12px 20px',
            background: 'rgba(7, 7, 10, 0.85)',
            border: '1px solid var(--xp-color)',
            boxShadow: '0 0 20px rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'float-y 2.5s infinite ease-in-out'
          }}>
            <Coins size={14} color="var(--xp-color)" />
            <span>Etheric Merchant Nearby</span>
            <button 
              className="glass-button active"
              onClick={() => setShowShop(true)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderColor: 'var(--xp-color)',
                color: 'var(--xp-color)',
                height: '26px'
              }}
            >
              Trade [E]
            </button>
          </div>
        </div>
      )}

      {/* 4. Action Keys HUD toggles (Bottom-Right) - Hidden on Mobile control scheme */}
      {controlScheme !== 'MOBILE' && (
        <div className="interactive" style={{
          position: 'absolute',
          bottom: '25px',
          right: '25px',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            className={`glass-button ${activeTab === 'character' ? 'active' : ''}`}
            onClick={() => setActiveTab(prev => prev === 'character' ? null : 'character')}
            style={{ width: '130px', padding: '12px' }}
          >
            <User size={16} />
            <span>Characters [C]</span>
          </button>

          <button
            className={`glass-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab(prev => prev === 'inventory' ? null : 'inventory')}
            style={{ width: '120px', padding: '12px' }}
          >
            <Briefcase size={16} />
            <span>Bag [I]</span>
          </button>
        </div>
      )}
    </div>
  );
}
