import { useState, useRef, useEffect } from 'react';
import { User, Briefcase, CornerUpLeft, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function MobileControls() {
  const setJoystick = useGameStore(state => state.setJoystick);
  const joystick = useGameStore(state => state.joystick);
  const phase = useGameStore(state => state.phase);

  const containerRef = useRef(null);
  const touchIdRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Maximum radius in pixels for knob displacement
  const maxRadius = 45;

  const handleStart = (clientX, clientY, touchId = null) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    touchIdRef.current = touchId;
    updatePosition(clientX, clientY);
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    setJoystick({ x: 0, y: 0 });
  };

  const updatePosition = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    let knobX = dx;
    let knobY = dy;

    if (distance > maxRadius) {
      knobX = (dx / distance) * maxRadius;
      knobY = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: knobX, y: knobY });

    // Normalize coordinates. Screen Y goes down, Three.js Z goes up. 
    // Therefore, screen -dy is forward Z.
    const normalizedX = knobX / maxRadius;
    const normalizedY = -knobY / maxRadius;

    setJoystick({ x: normalizedX, y: normalizedY });
  };

  // Setup global mouse move listeners for desktop drag testing
  useEffect(() => {
    const onMouseMove = (e) => {
      if (touchIdRef.current === 'mouse') {
        handleMove(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => {
      if (touchIdRef.current === 'mouse') {
        handleEnd();
      }
    };

    if (isDragging && touchIdRef.current === 'mouse') {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Touch listener
  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    handleStart(touch.clientX, touch.clientY, touch.identifier);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        handleMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        handleEnd();
        break;
      }
    }
  };

  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY, 'mouse');
  };

  // Gamepad action button dispatches
  const pressHero = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
  };

  const pressItems = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
  };

  const pressAction = () => {
    const state = useGameStore.getState();
    if (state.dialogue?.active) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
    } else if (state.isNearNPC) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    } else if (state.isNearMerchant) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    }
  };

  const pressBack = () => {
    const state = useGameStore.getState();
    if (state.dialogue?.active) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Backspace', key: 'Backspace' }));
    } else {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  };

  // Only display mobile controls in the EXPLORING phase
  if (phase !== 'EXPLORING') return null;

  return (
    <div className="mobile-controls-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 45
    }}>
      {/* 1. Joystick Area (Bottom Left) */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '50px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '2px solid rgba(212, 175, 55, 0.35)',
          background: 'rgba(15, 9, 5, 0.65)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), inset 0 0 15px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          pointerEvents: 'auto',
          cursor: 'grab'
        }}
      >
        {/* Inner stick track direction lines */}
        <div style={{ position: 'absolute', width: '80%', height: '1px', background: 'rgba(212, 175, 55, 0.08)' }} />
        <div style={{ position: 'absolute', height: '80%', width: '1px', background: 'rgba(212, 175, 55, 0.08)' }} />

        {/* Joystick Knob */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--wood-light) 0%, var(--wood-dark) 100%)',
          border: '2px solid var(--rpg-gold)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Glowing center indicator */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--rpg-gold)',
            boxShadow: '0 0 10px var(--rpg-gold)',
            opacity: isDragging ? 0.95 : 0.4
          }} />
        </div>
      </div>

      {/* 2. Action Gamepad Buttons (Bottom Right) */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '50px',
        width: '200px',
        height: '200px',
        pointerEvents: 'none'
      }}>
        {/* Diamond button array */}
        
        {/* Hero (Top - purple theme) */}
        <button
          onClick={pressHero}
          style={{
            position: 'absolute',
            top: '0px',
            left: '65px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--astral-purple) 0%, #6d28d9 100%)',
            border: '2.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5), 0 0 8px rgba(176, 102, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none'
          }}
          className="mobile-btn"
        >
          <User size={18} />
          <span style={{ fontSize: '9px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.05em' }}>HERO</span>
        </button>

        {/* Items (Left - gold theme) */}
        <button
          onClick={pressItems}
          style={{
            position: 'absolute',
            top: '65px',
            left: '0px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--xp-color) 0%, #b45309 100%)',
            border: '2.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5), 0 0 8px rgba(212, 175, 55, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none'
          }}
          className="mobile-btn"
        >
          <Briefcase size={18} />
          <span style={{ fontSize: '9px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.05em' }}>ITEMS</span>
        </button>

        {/* Back / Cancel (Right - red theme) */}
        <button
          onClick={pressBack}
          style={{
            position: 'absolute',
            top: '65px',
            right: '0px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--hp-color) 0%, #991b1b 100%)',
            border: '2.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5), 0 0 8px rgba(220, 38, 38, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none'
          }}
          className="mobile-btn"
        >
          <CornerUpLeft size={18} />
          <span style={{ fontSize: '9px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.05em' }}>BACK</span>
        </button>

        {/* Action / OK (Bottom - cyan theme) */}
        <button
          onClick={pressAction}
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '58px',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ether-cyan) 0%, #0369a1 100%)',
            border: '3px solid rgba(255,255,255,0.3)',
            color: '#fff',
            boxShadow: '0 5px 12px rgba(0,0,0,0.55), 0 0 12px rgba(78, 158, 255, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none'
          }}
          className="mobile-btn-action"
        >
          <CheckCircle2 size={22} />
          <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.05em' }}>ACTION</span>
        </button>
      </div>

      <style>{`
        .mobile-btn {
          transition: transform 0.1s ease, filter 0.15s ease;
        }
        .mobile-btn:active {
          transform: scale(0.9) !important;
          filter: brightness(1.2);
        }
        .mobile-btn-action {
          transition: transform 0.1s ease, filter 0.15s ease;
        }
        .mobile-btn-action:active {
          transform: scale(0.9) !important;
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
}
