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
  const [joystickCenter, setJoystickCenter] = useState(null);

  // Maximum radius in pixels for knob displacement
  const maxRadius = 32;

  const handleStart = (clientX, clientY, touchId = null, initialCenter = null) => {
    setIsDragging(true);
    touchIdRef.current = touchId;

    const center = initialCenter || (containerRef.current ? {
      x: containerRef.current.getBoundingClientRect().left + containerRef.current.getBoundingClientRect().width / 2,
      y: containerRef.current.getBoundingClientRect().top + containerRef.current.getBoundingClientRect().height / 2
    } : null);

    if (center) {
      setJoystickCenter(center);
      updatePosition(clientX, clientY, center);
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchIdRef.current = null;
    setJoystickCenter(null);
    setKnobPos({ x: 0, y: 0 });
    setJoystick({ x: 0, y: 0 });
  };

  const updatePosition = (clientX, clientY, currentCenter = null) => {
    const center = currentCenter || joystickCenter || (containerRef.current ? {
      x: containerRef.current.getBoundingClientRect().left + containerRef.current.getBoundingClientRect().width / 2,
      y: containerRef.current.getBoundingClientRect().top + containerRef.current.getBoundingClientRect().height / 2
    } : null);

    if (!center) return;

    const dx = clientX - center.x;
    const dy = clientY - center.y;

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

  // Setup global mouse and touch move listeners for robust screen dragging
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

    const onTouchMove = (e) => {
      if (touchIdRef.current !== null && touchIdRef.current !== 'mouse') {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchIdRef.current) {
            handleMove(touch.clientX, touch.clientY);
            break;
          }
        }
      }
    };

    const onTouchEnd = (e) => {
      if (touchIdRef.current !== null && touchIdRef.current !== 'mouse') {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchIdRef.current) {
            handleEnd();
            break;
          }
        }
      }
    };

    if (isDragging) {
      if (touchIdRef.current === 'mouse') {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      } else {
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);
      }
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging, joystickCenter]);

  // Touch snap listener
  const handleSnapTouchStart = (e) => {
    const touch = e.changedTouches[0];
    if (touch.clientX > window.innerWidth * 0.5) return; // Only snap on left half
    
    handleStart(touch.clientX, touch.clientY, touch.identifier, { x: touch.clientX, y: touch.clientY });
  };

  // Mouse snap listener
  const handleSnapMouseDown = (e) => {
    if (e.button !== 0 || e.clientX > window.innerWidth * 0.5) return; // Left click on left half only
    
    handleStart(e.clientX, e.clientY, 'mouse', { x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    handleStart(touch.clientX, touch.clientY, touch.identifier);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
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
      {/* 0. Large Snap Zone (Left 50% of the screen) */}
      <div 
        onMouseDown={handleSnapMouseDown}
        onTouchStart={handleSnapTouchStart}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50vw',
          height: '100%',
          pointerEvents: 'auto',
          touchAction: 'none',
          zIndex: 42
        }}
      />

      {/* 1. Joystick Area (Bottom Left) */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: 'absolute',
          bottom: joystickCenter ? 'auto' : '25px',
          left: joystickCenter ? `${joystickCenter.x - 45}px` : '25px',
          top: joystickCenter ? `${joystickCenter.y - 45}px` : 'auto',
          width: '90px',
          height: '90px',
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
          cursor: 'grab',
          zIndex: 43
        }}
      >
        {/* Inner stick track direction lines */}
        <div style={{ position: 'absolute', width: '80%', height: '1px', background: 'rgba(212, 175, 55, 0.08)' }} />
        <div style={{ position: 'absolute', height: '80%', width: '1px', background: 'rgba(212, 175, 55, 0.08)' }} />

        {/* Joystick Knob */}
        <div style={{
          width: '38px',
          height: '38px',
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
            width: '10px',
            height: '10px',
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
        bottom: '15px',
        right: '15px',
        width: '140px',
        height: '140px',
        pointerEvents: 'none'
      }}>
        {/* Diamond button array */}
        
        {/* Hero (Top - purple theme) */}
        <button
          onClick={pressHero}
          style={{
            position: 'absolute',
            top: '0px',
            left: '45px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--astral-purple) 0%, #6d28d9 100%)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 3px 8px rgba(0,0,0,0.5), 0 0 6px rgba(176, 102, 255, 0.3)',
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
          <User size={14} />
          <span style={{ fontSize: '7px', fontWeight: 800, marginTop: '1px', letterSpacing: '0.05em' }}>HERO</span>
        </button>

        {/* Items (Left - gold theme) */}
        <button
          onClick={pressItems}
          style={{
            position: 'absolute',
            top: '45px',
            left: '0px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--xp-color) 0%, #b45309 100%)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 3px 8px rgba(0,0,0,0.5), 0 0 6px rgba(212, 175, 55, 0.3)',
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
          <Briefcase size={14} />
          <span style={{ fontSize: '7px', fontWeight: 800, marginTop: '1px', letterSpacing: '0.05em' }}>ITEMS</span>
        </button>

        {/* Back / Cancel (Right - red theme) */}
        <button
          onClick={pressBack}
          style={{
            position: 'absolute',
            top: '45px',
            right: '0px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--hp-color) 0%, #991b1b 100%)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: '#fff',
            boxShadow: '0 3px 8px rgba(0,0,0,0.5), 0 0 6px rgba(220, 38, 38, 0.3)',
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
          <CornerUpLeft size={14} />
          <span style={{ fontSize: '7px', fontWeight: 800, marginTop: '1px', letterSpacing: '0.05em' }}>BACK</span>
        </button>

        {/* Action / OK (Bottom - cyan theme) */}
        <button
          onClick={pressAction}
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '40px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ether-cyan) 0%, #0369a1 100%)',
            border: '2.5px solid rgba(255,255,255,0.3)',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.55), 0 0 10px rgba(78, 158, 255, 0.4)',
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
          <CheckCircle2 size={16} />
          <span style={{ fontSize: '8px', fontWeight: 800, marginTop: '1px', letterSpacing: '0.05em' }}>ACTION</span>
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
