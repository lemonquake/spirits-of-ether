import { useState } from 'react';
import { Sparkles, Laptop, Smartphone, HelpCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function MainMenu() {
  const setPhase = useGameStore(state => state.setPhase);
  const setControlScheme = useGameStore(state => state.setControlScheme);
  const [showControlSelection, setShowControlSelection] = useState(false);

  const selectControls = (scheme) => {
    setControlScheme(scheme);
    setPhase('EXPLORING');
  };

  return (
    <div className="main-menu-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle, rgba(10, 8, 7, 0.4) 0%, rgba(7, 5, 4, 0.85) 100%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-game)'
    }}>
      {/* Decorative border layout */}
      <div style={{
        position: 'absolute',
        top: '40px',
        bottom: '40px',
        left: '40px',
        right: '40px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--rpg-gold)', borderLeft: '2px solid var(--rpg-gold)' }}></div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--rpg-gold)', borderRight: '2px solid var(--rpg-gold)' }}></div>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--rpg-gold)', borderLeft: '2px solid var(--rpg-gold)' }}></div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--rpg-gold)', borderRight: '2px solid var(--rpg-gold)' }}></div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '520px',
        padding: '20px'
      }}>
        {/* Title logo area */}
        <div style={{ animation: 'bounce-slow 4s infinite ease-in-out' }}>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '56px',
            fontWeight: 900,
            background: 'linear-gradient(180deg, #fffcf0 0%, #d4af37 60%, #855f19 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 15px rgba(212, 175, 55, 0.45))',
            letterSpacing: '0.22em',
            lineHeight: 1.1,
            margin: 0
          }}>
            SPIRITS
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '0.45em',
            margin: '10px 0 0 10px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            OF ETHER
          </h2>
        </div>

        {/* Menu selections */}
        {!showControlSelection ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '280px',
            animation: 'pop-bounce 0.5s ease-out'
          }}>
            <button
              className="glass-button active"
              onClick={() => setShowControlSelection(true)}
              style={{
                padding: '16px 30px',
                fontSize: '16px',
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)'
              }}
            >
              <Sparkles size={16} />
              <span>START ADVENTURE</span>
            </button>
            
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              V1.0.0 Stable Build
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{
            padding: '30px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            animation: 'pop-bounce 0.4s var(--ease-bounce-spring) forwards',
            background: 'linear-gradient(135deg, rgba(30,18,11,0.96) 0%, rgba(15,9,5,0.98) 100%)'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--rpg-gold)',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              margin: 0
            }}>
              SELECT CONTROL INTERFACE
            </h3>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Normal mode */}
              <div 
                onClick={() => selectControls('NORMAL')}
                style={{
                  flex: 1,
                  padding: '20px 15px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1.5px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                className="control-option-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ether-cyan)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(78, 158, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Laptop size={28} color="var(--ether-cyan)" />
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ether-cyan)' }}>NORMAL MODE</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Keyboard [WASD] controls movement. Full mouse hotkeys.
                </div>
              </div>

              {/* Mobile mode */}
              <div 
                onClick={() => selectControls('MOBILE')}
                style={{
                  flex: 1,
                  padding: '20px 15px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1.5px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                className="control-option-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--astral-purple)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(185, 117, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Smartphone size={28} color="var(--astral-purple)" />
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--astral-purple)' }}>MOBILE MODE</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Virtual analog stick & touch buttons layout. Clean viewport.
                </div>
              </div>
            </div>

            <button 
              className="glass-button" 
              onClick={() => setShowControlSelection(false)}
              style={{ padding: '8px 16px', fontSize: '11px', alignSelf: 'center' }}
            >
              <span>Back to Menu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
