import { useState, useEffect } from 'react';
import { RefreshCw, Skull, Sparkles } from 'lucide-react';
import { useGameStore } from './store/gameStore';
import GameCanvas from './components/3d/GameCanvas';
import HUD from './components/ui/HUD';
import CharacterInfo from './components/ui/CharacterInfo';
import Inventory from './components/ui/Inventory';
import CombatUI from './components/ui/CombatUI';
import ShopUI from './components/ui/ShopUI';
import DialogueUI from './components/ui/DialogueUI';
import MainMenu from './components/ui/MainMenu';
import PauseMenu from './components/ui/PauseMenu';
import MobileControls from './components/ui/MobileControls';
import InteractiveMap from './components/ui/InteractiveMap';

export default function App() {
  const phase = useGameStore(state => state.phase);
  const showShop = useGameStore(state => state.showShop);
  const setShowShop = useGameStore(state => state.setShowShop);
  const restartGame = useGameStore(state => state.restartGame);
  const controlScheme = useGameStore(state => state.controlScheme);
  const [activeTab, setActiveTab] = useState(null); // null | 'character' | 'inventory' | 'map'

  const handleRestart = () => {
    restartGame();
    setActiveTab(null);
  };

  // Attempt to lock screen orientation to landscape on supported devices
  useEffect(() => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
        // Orientation lock not supported on this device/browser - the CSS overlay will handle it
      });
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Portrait orientation warning overlay */}
      <div className="rotate-device-overlay">
        <div className="rotate-icon" />
        <h2>Rotate Your Device</h2>
        <p>Spirits of Ether is best experienced in landscape mode. Please rotate your device to continue.</p>
      </div>
      {/* 3D Game Engine Canvas Viewport */}
      <GameCanvas />

      {/* Main Menu Overlay */}
      {phase === 'MENU' && (
        <MainMenu />
      )}

      {/* Pause Menu Overlay */}
      <PauseMenu />

      {/* Screen flash transition container */}
      <div id="combat-flash" className="combat-transition-flash"></div>

      {/* HTML Overlays Layer */}
      {phase === 'EXPLORING' && (
        <>
          {/* Main Overworld HUD */}
          <HUD activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Mobile controls overlay (joystick and virtual gamepad buttons) */}
          {controlScheme === 'MOBILE' && (
            <MobileControls />
          )}

          {/* Character sheet overlay */}
          {activeTab === 'character' && (
            <CharacterInfo onClose={() => setActiveTab(null)} />
          )}

          {/* Inventory bag overlay */}
          {activeTab === 'inventory' && (
            <Inventory onClose={() => setActiveTab(null)} />
          )}

          {/* Interactive detailed map overlay */}
          {activeTab === 'map' && (
            <InteractiveMap onClose={() => setActiveTab(null)} />
          )}

          {/* Shop overlay */}
          {showShop && (
            <ShopUI onClose={() => setShowShop(false)} />
          )}

          {/* Dialogue Overlay */}
          <DialogueUI />
        </>
      )}

      {/* Turn-based combat overlays */}
      {phase === 'COMBAT' && (
        <CombatUI />
      )}

      {/* Game Over / Reset state overlay */}
      {phase === 'GAME_OVER' && (
        <div className="game-over-overlay">
          <Skull size={52} color="var(--hp-color)" style={{ marginBottom: '15px' }} />
          <h1 className="game-over-title">SPIRITS FADED</h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            marginBottom: '30px',
            maxWidth: '350px',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            The party could not withstand the void anomaly. The ether flow collapsed.
          </p>
          <button
            className="glass-button active danger"
            onClick={handleRestart}
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={18} />
            <span>Reconstitute Spirits & Retry</span>
          </button>
        </div>
      )}

      {/* Game Clear / Victory overlay */}
      {phase === 'GAME_CLEAR' && (
        <div className="game-over-overlay" style={{ background: 'rgba(7, 10, 7, 0.95)' }}>
          <Sparkles size={52} color="var(--xp-color)" style={{ marginBottom: '15px', animation: 'bounce-slow 2s infinite ease-in-out' }} />
          <h1 className="game-over-title" style={{ color: 'var(--xp-color)', textShadow: '0 0 40px rgba(234, 179, 8, 0.4)' }}>AETHER PURIFIED</h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            marginBottom: '30px',
            maxWidth: '380px',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            Azrin and Azrael have successfully vanquished the void anomalies. The flow of spirits is restored, and the ether runs clear.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              className="glass-button active"
              onClick={() => {
                // Respawn anomalies (NG+)
                useGameStore.setState({ defeatedEnemies: [], phase: 'EXPLORING' });
                // Add bonus shards
                useGameStore.setState(state => ({ gold: state.gold + 100 }));
              }}
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                borderColor: 'var(--xp-color)',
                color: 'var(--xp-color)'
              }}
            >
              <span>Respawn Anomalies (New Game+)</span>
            </button>
            <button
              className="glass-button"
              onClick={() => {
                useGameStore.setState({ phase: 'EXPLORING' });
              }}
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600
              }}
            >
              <span>Keep Exploring</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
