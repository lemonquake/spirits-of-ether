import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

function DadiloAlexAvatar({ isTyping }) {
  return (
    <div className="dadilo-avatar-container">
      <style>{`
        @keyframes portrait-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes eye-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes mouth-talk {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.2); }
        }
        @keyframes beard-shake {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-1.5deg) translateY(1px); }
          75% { transform: rotate(1.5deg) translateY(1px); }
        }
        @keyframes star-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)); transform: scale(1.15); }
        }
        .dadilo-avatar-container {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 3px solid #d97706;
          border-radius: 50%;
          overflow: visible;
          display: flex;
          align-items: center;
          justifyContent: center;
          boxShadow: 0 0 25px rgba(217, 119, 6, 0.35);
          animation: portrait-bob 4s infinite ease-in-out;
          position: relative;
          flex-shrink: 0;
        }
      `}</style>
      <svg width="105" height="105" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {/* Shadow */}
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(0,0,0,0.4)" />

        {/* Wizard Robe (shoulder area) */}
        <path d="M 18 86 C 18 64, 82 64, 82 86 Z" fill="#1e40af" stroke="#0f172a" strokeWidth="1.5" />
        
        {/* Head */}
        <circle cx="50" cy="56" r="17" fill="#fbcfe8" style={{ fill: '#fed7aa' }} stroke="#0f172a" strokeWidth="1.5" />

        {/* Eyes & Eyebrows */}
        <g style={{ transformOrigin: '50px 56px' }}>
          {/* Eyebrows */}
          <path d="M 37 47 Q 44 44 47 48" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 63 47 Q 56 44 53 48" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          
          {/* Eyes (Blinking animation) */}
          <ellipse cx="42" cy="52" rx="2.2" ry="2.8" fill="#0f172a" style={{
            animation: 'eye-blink 4.5s infinite ease-in-out',
            transformOrigin: '42px 52px'
          }} />
          <ellipse cx="58" cy="52" rx="2.2" ry="2.8" fill="#0f172a" style={{
            animation: 'eye-blink 4.5s infinite ease-in-out',
            transformOrigin: '58px 52px'
          }} />
        </g>

        {/* Nose */}
        <path d="M 50 51 L 47 57 L 53 57 Z" fill="#fdba74" stroke="#0f172a" strokeWidth="1" />

        {/* Mouth (Talk animation when typing is active) */}
        <ellipse cx="50" cy="63" rx="3.5" ry="1.2" fill="#450a0a" style={{
          animation: isTyping ? 'mouth-talk 0.28s infinite ease-in-out' : 'none',
          transformOrigin: '50px 63px'
        }} />

        {/* White Mustache and Beard */}
        <g style={{
          animation: isTyping ? 'beard-shake 0.28s infinite ease-in-out' : 'none',
          transformOrigin: '50px 65px'
        }}>
          {/* Mustache */}
          <path d="M 38 61 Q 50 64 62 61" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          
          {/* Beard */}
          <path d="M 34 63 Q 50 91 66 63 C 62 80, 38 80, 34 63 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>

        {/* Wizard Pointy Hat */}
        <g>
          {/* Brim */}
          <ellipse cx="50" cy="39" rx="25" ry="5.5" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Hat Cone */}
          <path d="M 31 38 Q 36 15, 52 9 Q 58 19, 69 38 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Star/Gem on Hat */}
          <polygon points="52,10 54,5 56,10 61,11 56,13 54,18 52,13 47,11" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" style={{
            animation: 'star-glow 2.5s infinite ease-in-out',
            transformOrigin: '54px 11px'
          }} />
        </g>
      </svg>
    </div>
  );
}

export default function DialogueUI() {
  const dialogue = useGameStore(state => state.dialogue);
  const quest = useGameStore(state => state.quest);
  const acceptQuest = useGameStore(state => state.acceptQuest);
  const nextDialogueLine = useGameStore(state => state.nextDialogueLine);
  const prevDialogueLine = useGameStore(state => state.prevDialogueLine);
  
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  const currentLine = dialogue.lines[dialogue.currentLineIndex] || '';
  const isLastLine = dialogue.currentLineIndex === dialogue.lines.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!dialogue.active || !currentLine) return;

    // Reset states
    setDisplayText('');
    setIsTyping(true);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    let index = 0;
    typingTimerRef.current = setInterval(() => {
      index++;
      setDisplayText(currentLine.substring(0, index));
      if (index >= currentLine.length) {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 25); // Speed of 25ms per character

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentLine, dialogue.active, dialogue.currentLineIndex]);

  // Spacebar and Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dialogue.active) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        if (dialogue.currentLineIndex > 0) {
          prevDialogueLine();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogue.active, isTyping, currentLine, dialogue.currentLineIndex]);

  if (!dialogue.active) return null;

  const handleAdvance = () => {
    if (isTyping) {
      // Skip typing: instantly show full text
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayText(currentLine);
      setIsTyping(false);
    } else {
      // If last line of NOT_STARTED quest, player must choose Accept or Decline manually
      if (isLastLine && quest.state === 'NOT_STARTED' && dialogue.speakerName === 'Dadilo Alex') {
        return; // force click buttons
      }
      nextDialogueLine();
    }
  };

  const handleAcceptQuest = () => {
    acceptQuest();
    // Start confirmation dialog
    useGameStore.setState(state => ({
      dialogue: {
        ...state.dialogue,
        lines: ["Excellent! May the Aether guide your blades. Return to me when they are purified."],
        currentLineIndex: 0,
        onComplete: null // cleared so it closes on completion
      }
    }));
  };

  const handleDeclineQuest = () => {
    // Decline closes dialogue
    useGameStore.setState(state => ({
      dialogue: {
        ...state.dialogue,
        active: false
      }
    }));
  };

  return (
    <div 
      className="dialogue-overlay"
      onClick={handleAdvance}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '45px',
        boxSizing: 'border-box',
        cursor: 'pointer'
      }}
    >
      <div 
        className="dialogue-box"
        onClick={(e) => {
          e.stopPropagation(); // prevent double advance
          handleAdvance();
        }}
        style={{
          width: '750px',
          maxWidth: '90%',
          background: 'linear-gradient(135deg, #efe2c9 0%, #dfcea6 100%)', // parchment color
          border: '4px solid #4a2f13', // wooden border
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(74, 47, 19, 0.25)',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          cursor: 'default'
        }}
      >
        {/* Decorative corner elements */}
        <div style={{ position: 'absolute', top: '5px', left: '5px', width: '10px', height: '10px', borderTop: '2px solid #4a2f13', borderLeft: '2px solid #4a2f13' }}></div>
        <div style={{ position: 'absolute', top: '5px', right: '5px', width: '10px', height: '10px', borderTop: '2px solid #4a2f13', borderRight: '2px solid #4a2f13' }}></div>
        <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '10px', height: '10px', borderBottom: '2px solid #4a2f13', borderLeft: '2px solid #4a2f13' }}></div>
        <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '10px', height: '10px', borderBottom: '2px solid #4a2f13', borderRight: '2px solid #4a2f13' }}></div>

        {/* Animated Portrait */}
        {dialogue.avatarType === 'dadilo_alex' && (
          <DadiloAlexAvatar isTyping={isTyping} />
        )}

        {/* Text Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'space-between' }}>
          <div>
            {/* Speaker Name */}
            <div style={{ 
              fontFamily: 'serif',
              fontWeight: 800, 
              fontSize: '18px', 
              color: '#3f250c', 
              letterSpacing: '0.05em',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              {dialogue.speakerName}
            </div>
            
            {/* Dialogue line */}
            <div style={{ 
              fontFamily: 'serif', 
              fontSize: '15px', 
              color: '#261608', 
              lineHeight: 1.45,
              fontWeight: 500,
              minHeight: '44px'
            }}>
              {displayText}
              {isTyping && <span className="typewriter-cursor">|</span>}
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            {/* Back Button */}
            {dialogue.currentLineIndex > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevDialogueLine();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7c2d12',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : <div />}

            {/* Accept / Decline triggers on Quest dialogue */}
            {isLastLine && !isTyping && quest.state === 'NOT_STARTED' && dialogue.speakerName === 'Dadilo Alex' ? (
              <div style={{ display: 'flex', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleDeclineQuest}
                  className="dialogue-btn-decline"
                  style={{
                    background: '#991b1b',
                    border: '1.5px solid #7f1d1d',
                    color: '#fef2f2',
                    fontFamily: 'serif',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <X size={14} />
                  <span>Decline</span>
                </button>
                <button
                  onClick={handleAcceptQuest}
                  className="dialogue-btn-accept"
                  style={{
                    background: '#15803d',
                    border: '1.5px solid #14532d',
                    color: '#f0fdf4',
                    fontFamily: 'serif',
                    fontWeight: 700,
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <Check size={14} />
                  <span>Accept Quest</span>
                </button>
              </div>
            ) : (
              /* Next Prompt Indicator */
              <div 
                style={{ 
                  color: '#7c2d12', 
                  fontSize: '12px', 
                  fontFamily: 'serif',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  animation: 'bounce-slow 2s infinite ease-in-out'
                }}
              >
                <span>{isLastLine ? "Close" : "Next"}</span>
                <ArrowRight size={13} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
