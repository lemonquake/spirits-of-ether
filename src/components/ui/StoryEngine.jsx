import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { playBgm, playClickSound, playHoverSound } from '../../utils/audio';
import { STORIES, sanitizeAssetPath } from '../../utils/storyData';

export default function StoryEngine() {
  const storyState = useGameStore(state => state.storyState);
  const nextStoryStep = useGameStore(state => state.nextStoryStep);
  const prevStoryStep = useGameStore(state => state.prevStoryStep);
  const skipStory = useGameStore(state => state.skipStory);

  const { activeStoryId, stepIndex } = storyState;
  const story = STORIES[activeStoryId] || [];
  const currentStep = story[stepIndex] || null;

  // Visual crossfade states
  const [activeImage, setActiveImage] = useState('');
  const [prevImage, setPrevImage] = useState('');
  const [fadeKey, setFadeKey] = useState(0);

  // Intro fade-to-black and fade-out-black state
  const [introFinished, setIntroFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Typewriter text state
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  const rawText = currentStep ? currentStep.text : '';
  const isLastLine = stepIndex === story.length - 1;

  // Handle intro transition fade out of black
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
      // Play the first step BGM after the black transition commences
      const firstStep = story[0];
      if (firstStep && firstStep.audio) {
        playBgm(sanitizeAssetPath(firstStep.audio));
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeStoryId]);

  // Handle image crossfading
  useEffect(() => {
    if (!currentStep) return;
    const cleanImgPath = currentStep.image ? sanitizeAssetPath(currentStep.image) : '';
    if (cleanImgPath !== activeImage) {
      setPrevImage(activeImage);
      setActiveImage(cleanImgPath);
      setFadeKey(prev => prev + 1);
    }
  }, [currentStep, activeImage]);

  // Handle BGM changes per step (skips first step since it is handled by the intro timer)
  useEffect(() => {
    if (!introFinished || !currentStep || stepIndex === 0) return;
    if (currentStep.audio !== undefined) {
      const audioPath = currentStep.audio ? sanitizeAssetPath(currentStep.audio) : null;
      playBgm(audioPath);
    }
  }, [stepIndex, introFinished]);

  // Typewriter effect
  useEffect(() => {
    if (!rawText) {
      setDisplayText('');
      setIsTyping(false);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    let index = 0;
    typingTimerRef.current = setInterval(() => {
      index++;
      setDisplayText(rawText.substring(0, index));
      if (index >= rawText.length) {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 20); // 20ms typewriter speed

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [rawText, stepIndex]);

  // Spacebar and Backspace key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExiting) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        if (stepIndex > 0) {
          playClickSound();
          prevStoryStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex, isTyping, rawText, isExiting]);

  if (!currentStep) return null;

  const handleAdvance = () => {
    if (isTyping) {
      // Instantly finish typewriter typing
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayText(rawText);
      setIsTyping(false);
    } else {
      playClickSound();
      if (isLastLine) {
        // Fade to black before entering exploration phase
        setIsExiting(true);
        setTimeout(() => {
          nextStoryStep();
        }, 1000);
      } else {
        nextStoryStep();
      }
    }
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (stepIndex > 0) {
      playClickSound();
      prevStoryStep();
    }
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    playClickSound();
    setIsExiting(true);
    setTimeout(() => {
      skipStory();
    }, 1000);
  };

  return (
    <div 
      className="story-container"
      onClick={handleAdvance}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        zIndex: 150,
        overflow: 'hidden',
        cursor: 'pointer',
        fontFamily: 'var(--font-game)'
      }}
    >
      {/* Background Images with Crossfade */}
      <div 
        className="story-bg-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000'
        }}
      >
        {prevImage && (
          <img 
            src={prevImage} 
            alt="story background previous"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              opacity: 1
            }}
          />
        )}
        {activeImage && (
          <img 
            key={fadeKey}
            src={activeImage} 
            alt="story background active"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 2,
              opacity: 0,
              animation: 'storyImgFadeIn 0.8s ease-in-out forwards'
            }}
          />
        )}
      </div>

      {/* Atmospheric vignette shadow overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
          zIndex: 3,
          pointerEvents: 'none'
        }}
      />

      {/* Skip Button */}
      {!isExiting && (
        <button 
          onClick={handleSkip}
          onMouseEnter={playHoverSound}
          className="glass-button"
          style={{
            position: 'absolute',
            top: '25px',
            right: '25px',
            zIndex: 10,
            padding: '10px 18px',
            fontSize: '12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <SkipForward size={14} />
          <span>SKIP STORY</span>
        </button>
      )}

      {/* Dialogue Overlay Box */}
      {introFinished && !isExiting && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '35%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '30px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="dialogue-box story-dialogue-box"
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance();
            }}
            style={{
              width: '780px',
              maxWidth: '92%',
              background: 'linear-gradient(135deg, #efe2c9 0%, #dfcea6 100%)',
              border: '4px solid #4a2f13',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 0 20px rgba(74, 47, 19, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              cursor: 'default',
              animation: 'storyBoxSlideUp 0.5s ease-out forwards'
            }}
          >
            {/* Wooden corners decoration */}
            <div style={{ position: 'absolute', top: '5px', left: '5px', width: '10px', height: '10px', borderTop: '2px solid #4a2f13', borderLeft: '2px solid #4a2f13' }}></div>
            <div style={{ position: 'absolute', top: '5px', right: '5px', width: '10px', height: '10px', borderTop: '2px solid #4a2f13', borderRight: '2px solid #4a2f13' }}></div>
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '10px', height: '10px', borderBottom: '2px solid #4a2f13', borderLeft: '2px solid #4a2f13' }}></div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '10px', height: '10px', borderBottom: '2px solid #4a2f13', borderRight: '2px solid #4a2f13' }}></div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '85px', justifyContent: 'space-between' }}>
              <div>
                {/* Speaker Name */}
                {currentStep.speaker && (
                  <div style={{ 
                    fontFamily: 'var(--font-title)',
                    fontWeight: 800, 
                    fontSize: '17px', 
                    color: '#3f250c', 
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {currentStep.speaker}
                  </div>
                )}
                
                {/* Dialogue Line Text */}
                <div style={{ 
                  fontFamily: 'var(--font-game)', 
                  fontSize: '15px', 
                  color: currentStep.speaker ? '#261608' : '#573c24', 
                  fontStyle: currentStep.speaker ? 'normal' : 'italic',
                  lineHeight: 1.4,
                  fontWeight: currentStep.speaker ? 500 : 600,
                  minHeight: '40px'
                }}>
                  {displayText}
                  {isTyping && <span className="typewriter-cursor">|</span>}
                </div>
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                {stepIndex > 0 ? (
                  <button
                    onClick={handleBack}
                    onMouseEnter={playHoverSound}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c2d12',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-game)',
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

                {/* Advance/Close indicator */}
                <div 
                  style={{ 
                    color: '#7c2d12', 
                    fontSize: '12px', 
                    fontFamily: 'var(--font-game)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    animation: 'storyIndicatorBounce 1.8s infinite ease-in-out'
                  }}
                >
                  <span>{isLastLine ? "Start Game" : "Next"}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Fading Overlays */}
      <div 
        className="story-fade-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          pointerEvents: 'none',
          zIndex: 99,
          // Intro starts at full black opacity, fades out. Exit starts at 0, fades in.
          opacity: !introFinished ? 1 : (isExiting ? 1 : 0),
          transition: !introFinished ? 'opacity 1s ease-in-out' : 'opacity 0.8s ease-in-out'
        }}
      />

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes storyImgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes storyBoxSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes storyIndicatorBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
