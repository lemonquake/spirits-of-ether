import { useState, useEffect } from 'react';
import { playAwakenSound, initAudio } from '../../utils/audio';

export default function SplashScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Gathering ether streams...');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAwakened, setIsAwakened] = useState(false);
  const [ripples, setRipples] = useState([]);
  
  const loadingStages = [
    { threshold: 0, text: 'Gathering ether streams...' },
    { threshold: 20, text: 'Conjuring Azrin & Azrael...' },
    { threshold: 45, text: 'Forging the crimson sword...' },
    { threshold: 70, text: 'Infusing ancient chrome staff...' },
    { threshold: 90, text: 'Purifying the spirits of ether...' }
  ];

  useEffect(() => {
    let start = Date.now();
    const duration = 2200; // 2.2 seconds loading simulation
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      
      // Update status text based on progress
      const currentStage = [...loadingStages]
        .reverse()
        .find(stage => pct >= stage.threshold);
      if (currentStage) {
        setStatusText(currentStage.text);
      }
      
      if (pct >= 100) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  const handleAwaken = (e) => {
    if (!isLoaded || isAwakened) return;
    
    // Initialize audio context on first click
    initAudio();
    playAwakenSound();
    
    setIsAwakened(true);
    
    // Get click coordinates to trigger a ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples([{ id: Date.now(), x, y }]);
    
    // Let the animation play out, then finish
    setTimeout(() => {
      onFinished();
    }, 1500); // 1.5 seconds transition
  };

  return (
    <div 
      className={`splash-overlay ${isLoaded ? 'loaded' : ''}`}
      onClick={handleAwaken}
      style={{
        transition: 'opacity 1.2s ease',
        opacity: isAwakened ? 0 : 1,
        pointerEvents: isAwakened ? 'none' : 'auto'
      }}
    >
      {/* Background with unblurring transition */}
      <div className="splash-backdrop" />
      
      {/* Ripple effects */}
      {ripples.map(r => (
        <div 
          key={r.id} 
          className="splash-ripple" 
          style={{ left: `${r.x}px`, top: `${r.y}px` }} 
        />
      ))}
      
      {/* Splash contents */}
      <div className="splash-content">
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
          opacity: 0.95,
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          By Aljay Leodones
        </div>
        
        {/* Progress Bar or Click to Start prompt */}
        {!isLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div className="splash-loading-text">{statusText}</div>
            <div className="splash-progress-bar">
              <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="splash-tap-prompt">
            TAP TO AWAKEN
          </div>
        )}
      </div>
    </div>
  );
}
