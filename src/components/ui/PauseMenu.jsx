import { Play, RotateCcw, Smartphone, Laptop, Settings } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function PauseMenu() {
  const isPaused = useGameStore(state => state.isPaused);
  const setIsPaused = useGameStore(state => state.setIsPaused);
  const controlScheme = useGameStore(state => state.controlScheme);
  const setControlScheme = useGameStore(state => state.setControlScheme);
  const restartGame = useGameStore(state => state.restartGame);

  if (!isPaused) return null;

  const toggleControls = () => {
    const nextScheme = controlScheme === 'NORMAL' ? 'MOBILE' : 'NORMAL';
    setControlScheme(nextScheme);
  };

  const handleRestart = () => {
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
        background: 'linear-gradient(135deg, rgba(30,18,11,0.98) 0%, rgba(15,9,5,0.99) 100%)',
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
            onClick={() => setIsPaused(false)}
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

          {/* Restart button */}
          <button
            className="glass-button danger"
            onClick={handleRestart}
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
