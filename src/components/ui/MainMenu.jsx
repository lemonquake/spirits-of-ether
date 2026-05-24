import { useState, useEffect, useRef } from 'react';
import { Sparkles, Laptop, Smartphone } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { playHoverSound, playClickSound } from '../../utils/audio';

export default function MainMenu() {
  const setPhase = useGameStore(state => state.setPhase);
  const setControlScheme = useGameStore(state => state.setControlScheme);
  const [showControlSelection, setShowControlSelection] = useState(false);
  const [zoomBackground, setZoomBackground] = useState(false);
  
  const canvasRef = useRef(null);

  // Trigger background zoom effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setZoomBackground(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Floating particles canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
        // Scatter initially across height so they don't all rise from bottom on load
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 20;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.6 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        
        // Randomly assign theme colors: cyan (Azrin), purple (Azrael), gold (Ether)
        const colors = [
          'rgba(78, 158, 255, ',  // cyan
          'rgba(176, 102, 255, ', // purple
          'rgba(212, 175, 55, '   // gold
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.4 + 0.2;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.alpha -= this.fadeSpeed;
        if (this.y < -10 || this.alpha <= 0) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase}${this.alpha})`;
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = `${this.colorBase}1)`;
        ctx.fill();
        ctx.restore();
      }
    }

    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleStartAdventureClick = () => {
    playClickSound();
    setShowControlSelection(true);
  };

  const handleBackToMenuClick = () => {
    playClickSound();
    setShowControlSelection(false);
  };

  const selectControls = (scheme) => {
    playClickSound();
    setControlScheme(scheme);
    setPhase('EXPLORING');
  };

  return (
    <div className={`title-screen-bg-container ${zoomBackground ? 'zoomed' : ''}`}>
      {/* Dynamic Animated Background image */}
      <div className="title-screen-bg-image" />

      {/* Pulsing Glowing Spot overlays for Character Weapons */}
      <div className="weapon-glow-overlay">
        <div className="azrin-sword-glow" />
        <div className="azrael-staff-glow" />
      </div>

      {/* Floating Canvas Particles */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 11
        }}
      />

      {/* Floating Ether Spirits */}
      <div className="ether-spirit-container">
        {/* Cyan Spirit */}
        <div className="ether-spirit spirit-cyan-1">
          <div className="ether-spirit-core" />
          <div className="ether-spirit-trail t1" />
          <div className="ether-spirit-trail t2" />
        </div>
        {/* Purple Spirit */}
        <div className="ether-spirit spirit-purple-2">
          <div className="ether-spirit-core" />
          <div className="ether-spirit-trail t1" />
          <div className="ether-spirit-trail t2" />
        </div>
        {/* Gold Spirit */}
        <div className="ether-spirit spirit-gold-3">
          <div className="ether-spirit-core" />
          <div className="ether-spirit-trail t1" />
          <div className="ether-spirit-trail t2" />
        </div>
      </div>

      {/* Main Menu UI Overlay */}
      <div className="main-menu-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle, rgba(10, 8, 7, 0.25) 0%, rgba(7, 5, 4, 0.7) 100%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-game)'
      }}>
        {/* Decorative gold border layout */}
        <div style={{
          position: 'absolute',
          top: '40px',
          bottom: '40px',
          left: '40px',
          right: '40px',
          border: '1px solid rgba(212, 175, 55, 0.12)',
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
          gap: '35px',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '520px',
          padding: '20px'
        }}>
          {/* Visual spacing for the redone poster's centered logo */}
          <div style={{ height: '24vh' }} />

          {/* Credits overlay */}
          <div style={{
            fontFamily: 'var(--font-game)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            fontWeight: 600,
            opacity: 0.95
          }}>
            By Aljay Leodones
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
                onClick={handleStartAdventureClick}
                onMouseEnter={playHoverSound}
                style={{
                  padding: '16px 30px',
                  fontSize: '16px',
                  width: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)',
                  cursor: 'pointer'
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
                letterSpacing: '0.1em',
                textShadow: '0 1px 2px #000'
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
              background: 'linear-gradient(135deg, rgba(30,18,11,0.97) 0%, rgba(15,9,5,0.99) 100%)'
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
                  onMouseEnter={() => {
                    playHoverSound();
                  }}
                  style={{
                    flex: 1,
                    padding: '20px 15px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.4)',
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
                    playHoverSound();
                    e.currentTarget.style.borderColor = 'var(--ether-cyan)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(78, 158, 255, 0.2)';
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
                  onMouseEnter={() => {
                    playHoverSound();
                  }}
                  style={{
                    flex: 1,
                    padding: '20px 15px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.4)',
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
                    playHoverSound();
                    e.currentTarget.style.borderColor = 'var(--astral-purple)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(185, 117, 255, 0.2)';
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
                onClick={handleBackToMenuClick}
                onMouseEnter={playHoverSound}
                style={{ padding: '8px 16px', fontSize: '11px', alignSelf: 'center', cursor: 'pointer' }}
              >
                <span>Back to Menu</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
