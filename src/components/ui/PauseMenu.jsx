import { Play, RotateCcw, Smartphone, Laptop, Settings, Volume2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { playHoverSound, playClickSound } from '../../utils/audio';

export default function PauseMenu() {
  const isPaused = useGameStore(state => state.isPaused);
  const setIsPaused = useGameStore(state => state.setIsPaused);
  const controlScheme = useGameStore(state => state.controlScheme);
  const setControlScheme = useGameStore(state => state.setControlScheme);
  const restartGame = useGameStore(state => state.restartGame);
  
  const bgmVolume = useGameStore(state => state.bgmVolume);
  const setBgmVolume = useGameStore(state => state.setBgmVolume);
  const sfxVolume = useGameStore(state => state.sfxVolume);
  const setSfxVolume = useGameStore(state => state.setSfxVolume);

  if (!isPaused) return null;

  const toggleControls = () => {
    playClickSound();
    const nextScheme = controlScheme === 'NORMAL' ? 'MOBILE' : 'NORMAL';
    setControlScheme(nextScheme);
  };

  const handleRestart = () => {
    playClickSound();
    restartGame();
  };

  return (
    <div className="main-menu-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(7, 5, 4, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-game)'
    }}>
      <div className="glass-panel" style={{
        width: '360px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'pop-bounce-center 0.35s var(--ease-bounce-spring) forwards',
        background: 'linear-gradient(135deg, rgba(30, 18, 11, 0.94) 0%, rgba(15, 9, 5, 0.97) 100%), url("/splash.png") center/cover no-repeat',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Settings size={20} color="var(--rpg-gold)" style={{ animation: 'spin-slow 8s infinite linear' }} />
          <h3 style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--rpg-gold)',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            margin: 0
          }}>
            GAME PAUSED
          </h3>
        </div>

        {/* Buttons list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Resume button */}
          <button
            className="glass-button active"
            onClick={() => {
              playClickSound();
              setIsPaused(false);
            }}
            onMouseEnter={playHoverSound}
            style={{
              padding: '14px',
              fontSize: '14px',
              width: '100%'
            }}
          >
            <Play size={15} />
            <span>RESUME ADVENTURE</span>
          </button>

          {/* Toggle controls */}
          <button
            className="glass-button"
            onClick={toggleControls}
            onMouseEnter={playHoverSound}
            style={{
              padding: '14px',
              fontSize: '13px',
              width: '100%',
              borderColor: controlScheme === 'NORMAL' ? 'var(--ether-cyan)' : 'var(--astral-purple)'
            }}
          >
            {controlScheme === 'NORMAL' ? (
              <>
                <Laptop size={14} color="var(--ether-cyan)" />
                <span>CONTROLS: KEYBOARD</span>
              </>
            ) : (
              <>
                <Smartphone size={14} color="var(--astral-purple)" />
                <span>CONTROLS: MOBILE</span>
              </>
            )}
          </button>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '5px 0' }} />

          {/* Audio Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', padding: '0 5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--rpg-gold)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              <Volume2 size={13} />
              <span>AUDIO PREFERENCES</span>
            </div>
            
            {/* BGM Volume */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Music Volume</span>
                <span style={{ color: 'var(--rpg-gold)', fontWeight: 600 }}>{Math.round(bgmVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={bgmVolume} 
                onMouseEnter={playHoverSound}
                onChange={(e) => {
                  setBgmVolume(parseFloat(e.target.value));
                }}
                onMouseUp={playClickSound}
                onTouchEnd={playClickSound}
                style={{
                  width: '100%',
                  accentColor: 'var(--rpg-gold)',
                  background: 'rgba(255,255,255,0.1)',
                  height: '5px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* SFX Volume */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Game Sounds Volume</span>
                <span style={{ color: 'var(--ether-cyan)', fontWeight: 600 }}>{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={sfxVolume} 
                onMouseEnter={playHoverSound}
                onChange={(e) => {
                  setSfxVolume(parseFloat(e.target.value));
                }}
                onMouseUp={playClickSound}
                onTouchEnd={playClickSound}
                style={{
                  width: '100%',
                  accentColor: 'var(--ether-cyan)',
                  background: 'rgba(255,255,255,0.1)',
                  height: '5px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '5px 0' }} />

          {/* Restart button */}
          <button
            className="glass-button danger"
            onClick={handleRestart}
            onMouseEnter={playHoverSound}
            style={{
              padding: '12px',
              fontSize: '13px',
              width: '100%'
            }}
          >
            <RotateCcw size={14} />
            <span>RESTART TO MAIN MENU</span>
          </button>
        </div>

        {/* Style helper for settings spin */}
        <style>{`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
