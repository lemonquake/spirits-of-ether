// Web Audio API Synthesizer & BGM Manager for Spirits of Ether
// Generates lightweight, premium sound effects and manages looped background music with crossfading.

import { useGameStore, INITIAL_INVENTORY } from '../store/gameStore';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Helper to fetch background music volume scale from Zustand store.
 */
const getBgmVolume = () => {
  try {
    const state = useGameStore.getState();
    return state.bgmVolume !== undefined ? state.bgmVolume : 0.65;
  } catch (e) {
    return 0.65;
  }
};

/**
 * Helper to fetch sound effects volume scale from Zustand store.
 */
const getSfxVolume = () => {
  try {
    const state = useGameStore.getState();
    return state.sfxVolume !== undefined ? state.sfxVolume : 0.80;
  } catch (e) {
    return 0.80;
  }
};

// --- Background Music (BGM) Manager ---
let activeBgm = null;
let activeSrc = '';
let fadeInterval = null;

/**
 * Plays a background music track with smooth crossfading transitions.
 * @param {string|null} src - Path to the audio file, or null to fade out and stop.
 */
export const playBgm = (src) => {
  try {
    if (activeSrc === src) {
      if (activeBgm) {
        activeBgm.volume = getBgmVolume();
      }
      return;
    }

    const targetVolume = getBgmVolume();
    const oldBgm = activeBgm;
    activeSrc = src || '';

    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }

    if (!src) {
      // Fade out old
      if (oldBgm) {
        let vol = oldBgm.volume;
        fadeInterval = setInterval(() => {
          vol -= 0.05;
          if (vol <= 0) {
            oldBgm.pause();
            clearInterval(fadeInterval);
          } else {
            oldBgm.volume = Math.max(0, vol);
          }
        }, 50);
      }
      activeBgm = null;
      return;
    }

    const newBgm = new Audio(src);
    newBgm.loop = true;
    newBgm.volume = 0;
    activeBgm = newBgm;

    const playPromise = newBgm.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.log("Play BGM error:", e));
    }

    // Crossfade: fade out old, fade in new
    let step = 0;
    const fadeSteps = 20;
    fadeInterval = setInterval(() => {
      step++;
      const progress = step / fadeSteps;
      
      if (newBgm) {
        newBgm.volume = progress * targetVolume;
      }
      
      if (oldBgm) {
        oldBgm.volume = (1 - progress) * oldBgm.volume;
      }

      if (step >= fadeSteps) {
        clearInterval(fadeInterval);
        if (oldBgm) {
          oldBgm.pause();
        }
        if (newBgm) {
          newBgm.volume = targetVolume;
        }
      }
    }, 50); // Total crossfade duration: ~1 second
  } catch (e) {
    console.warn("BGM transition error:", e);
  }
};

/**
 * Updates the volume of the currently playing BGM to match store adjustments.
 */
export const updateBgmVolume = () => {
  if (activeBgm) {
    activeBgm.volume = getBgmVolume();
  }
};

// --- Zustand Store Audio Controller Subscription ---
let isSubscribed = false;

export const setupStoreSubscription = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  let lastPhase = '';
  let lastEncounterId = '';
  let lastAnimatingAction = null;
  let lastBattleResult = null;
  let lastHeroLevels = { Azrin: 5, Azrael: 5 };

  useGameStore.subscribe((state) => {
    // 1. Live volume adjustments
    updateBgmVolume();

    // 2. Play/Stop BGM on game phase transitions
    const phase = state.phase;
    const encounterId = state.combat?.encounterId;
    if (phase !== lastPhase || (phase === 'COMBAT' && encounterId !== lastEncounterId)) {
      lastPhase = phase;
      lastEncounterId = encounterId || '';

      if (phase === 'MENU') {
        playBgm('/audio/Moonlit Quest Gate.mp3');
      } else if (phase === 'EXPLORING') {
        playBgm('/audio/town1_bgm.mp3');
      } else if (phase === 'COMBAT') {
        if (encounterId === 'enemy_boss_anomaly') {
          playBgm('/audio/Throne of Ash_Boss Music.mp3');
        } else {
          playBgm('/battle_bgm.mp3');
        }
      } else if (phase === 'GAME_OVER') {
        playBgm(null);
      } else if (phase === 'GAME_CLEAR') {
        playBgm('/audio/Runes of Farshore.mp3');
      } else {
        playBgm(null);
      }
    }

    // 3. Play action sound effects dynamically
    const animatingAction = state.combat?.animatingAction;
    if (animatingAction && animatingAction !== lastAnimatingAction) {
      lastAnimatingAction = animatingAction;
      const { attacker, type, details, damage } = animatingAction;

      if (type === 'attack') {
        playSlashSound();
        if (damage > 0) {
          setTimeout(() => playHitSound(), 180);
        }
      } else if (type === 'def') {
        playShieldSound();
      } else if (type === 'skill') {
        const skillId = details?.skillId;
        if (skillId === 'nova_flare') {
          playFireSound();
          if (damage > 0) {
            setTimeout(() => playHitSound(), 350);
          }
        } else if (skillId === 'astral_heal') {
          playHealSound();
        } else if (skillId === 'ether_shield') {
          playShieldSound();
        } else if (skillId === 'spirit_surge') {
          playAwakenSound();
        } else {
          // Fallback skill SFX
          playSlashSound();
          if (damage > 0) {
            setTimeout(() => playHitSound(), 180);
          }
        }
      } else if (type === 'item') {
        const itemId = details?.itemId;
        const item = state.inventory.find(i => i.id === itemId) || 
                     INITIAL_INVENTORY.find(i => i.id === itemId);
        if (item) {
          if (item.valueType === 'hp' || item.valueType === 'revive') {
            playHealSound();
          } else if (item.valueType === 'mp') {
            playAwakenSound();
          } else {
            playClickSound();
          }
        } else {
          playHealSound();
        }
      }
    } else if (!animatingAction) {
      lastAnimatingAction = null;
    }

    // 4. Play victory / defeat fanfares
    const battleResult = state.combat?.battleResult;
    if (battleResult !== lastBattleResult) {
      lastBattleResult = battleResult;
      if (battleResult === 'victory') {
        playVictorySound();
      } else if (battleResult === 'defeat') {
        playDefeatSound();
      }
    }

    // 5. Play Level Up sounds
    const currentLevels = {
      Azrin: state.characters?.Azrin?.level || 5,
      Azrael: state.characters?.Azrael?.level || 5
    };
    if (currentLevels.Azrin > lastHeroLevels.Azrin || currentLevels.Azrael > lastHeroLevels.Azrael) {
      lastHeroLevels = currentLevels;
      // Delay slightly to play after combat victory fanfare
      setTimeout(() => playLevelUpSound(), 800);
    }
  });
};

/**
 * Initializes the audio context. Should be called on user interaction (e.g. click).
 */
export const initAudio = () => {
  try {
    const ctx = getAudioContext();
    
    // Wire up the Zustand state observer
    setupStoreSubscription();

    // Kickstart BGM immediately based on starting phase
    const state = useGameStore.getState();
    const phase = state.phase;
    const encounterId = state.combat?.encounterId;
    
    if (phase === 'MENU') {
      playBgm('/audio/Moonlit Quest Gate.mp3');
    } else if (phase === 'EXPLORING') {
      playBgm('/audio/town1_bgm.mp3');
    } else if (phase === 'COMBAT') {
      if (encounterId === 'enemy_boss_anomaly') {
        playBgm('/audio/Throne of Ash_Boss Music.mp3');
      } else {
        playBgm('/battle_bgm.mp3');
      }
    }
    
    return ctx;
  } catch (e) {
    console.warn("Failed to initialize AudioContext:", e);
    return null;
  }
};

// --- Synthesized Sound Effects (SFX) ---

/**
 * Plays a light, crisp, high-frequency hover chime
 */
export const playHoverSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();
    
    const frequencies = [1500, 1900];
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq - 100, now + 0.12);
      
      gainNode.gain.setValueAtTime(0.015 * sfxVol, now); // scale by sfx volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    });
  } catch (e) {
    // Ignore context issues before interaction
  }
};

/**
 * Plays a sparkling crystal arpeggio for confirm/click actions
 */
export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const delay = idx * 0.035;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + delay + 0.25);
      
      gainNode.gain.setValueAtTime(0.04 * sfxVol, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
    
    // Add white-noise splash texture
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.015 * sfxVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.08);
  } catch (e) {
    console.warn("Click audio error:", e);
  }
};

/**
 * Plays a sweeping magical synthesized wind/bell transition effect
 */
export const playAwakenSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();
    
    // 1. Deep Bass Swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.linearRampToValueAtTime(110, now + 1.2);
    
    subGain.gain.setValueAtTime(0.01 * sfxVol, now);
    subGain.gain.linearRampToValueAtTime(0.12 * sfxVol, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);
    
    // 2. Synthesizer Swell
    const synthOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const synthGain = ctx.createGain();
    
    synthOsc.type = 'sawtooth';
    synthOsc.frequency.setValueAtTime(140, now);
    synthOsc.frequency.exponentialRampToValueAtTime(880, now + 1.0);
    
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(8, now);
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 1.0);
    
    synthGain.gain.setValueAtTime(0.01 * sfxVol, now);
    synthGain.gain.linearRampToValueAtTime(0.08 * sfxVol, now + 0.5);
    synthGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    synthOsc.connect(filter);
    filter.connect(synthGain);
    synthGain.connect(ctx.destination);
    
    synthOsc.start(now);
    synthOsc.stop(now + 1.4);
    
    // 3. Sparkling bell cascade
    const peakTime = now + 0.35;
    const chimeFreqs = [880, 1100, 1320, 1760, 2200];
    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.05;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, peakTime + delay);
      
      gain.gain.setValueAtTime(0.035 * sfxVol, peakTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, peakTime + delay + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(peakTime + delay);
      osc.stop(peakTime + delay + 0.6);
    });
  } catch (e) {
    console.warn("Awaken audio error:", e);
  }
};

/**
 * Plays an epic metallic swish / sword slash effect.
 */
export const playSlashSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // White noise for air slash swish
    const bufferSize = ctx.sampleRate * 0.20; // 200ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(7000, now + 0.12);
    filter.Q.setValueAtTime(4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12 * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    // Deep dynamic push/impact
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    
    oscGain.gain.setValueAtTime(0.15 * sfxVol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.20);
    osc.start(now);
    osc.stop(now + 0.10);
  } catch (e) {
    console.warn("Slash audio error:", e);
  }
};

/**
 * Plays a fiery blast/combustion effect.
 */
export const playFireSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Noise explosion
    const bufferSize = ctx.sampleRate * 0.45; // 450ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    filter.Q.setValueAtTime(6, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16 * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Deep sub-harmonic explosion wave
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(35, now + 0.35);

    const oscFilter = ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(100, now);

    oscGain.gain.setValueAtTime(0.25 * sfxVol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.45);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.warn("Fire audio error:", e);
  }
};

/**
 * Plays a magical sparkling healing spell sound.
 */
export const playHealSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Rising glittering arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0.035 * sfxVol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

      // Pitch vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 12;
      lfoGain.gain.value = 12;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now + delay);
      osc.start(now + delay);
      lfo.stop(now + delay + 0.35);
      osc.stop(now + delay + 0.35);
    });

    // Shimmer noise sweep
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(6500, now + 0.45);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.015 * sfxVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.5);
  } catch (e) {
    console.warn("Heal audio error:", e);
  }
};

/**
 * Plays a protective barrier/energy shield sound.
 */
export const playShieldSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Ringing crystal harmonic stack
    const freqs = [150, 300, 450, 900];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq + 40, now + 0.30);

      gain.gain.setValueAtTime(0.045 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  } catch (e) {
    console.warn("Shield audio error:", e);
  }
};

/**
 * Plays a solid, punchy hit/impact sound when damage is dealt.
 */
export const playHitSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Thumping impact base
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(190, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    gain1.gain.setValueAtTime(0.20 * sfxVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Crackling high-transient click
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(750, now);
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.07);
    gain2.gain.setValueAtTime(0.09 * sfxVol, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.07);
  } catch (e) {
    console.warn("Hit audio error:", e);
  }
};

/**
 * Plays a glorious level up fanfare.
 */
export const playLevelUpSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Upward pentatonic notes: C4 - E4 - G4 - A4 - C5 - E5
    const notes = [
      { f: 261.63, d: 0.12 },
      { f: 329.63, d: 0.12 },
      { f: 392.00, d: 0.12 },
      { f: 440.00, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.40 }
    ];

    notes.forEach((note, idx) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.09;

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(note.f, now + delay);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(note.f * 1.004, now + delay); // Rich detuning

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now + delay);

      gain.gain.setValueAtTime(0.055 * sfxVol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + note.d + 0.1);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + delay);
      osc2.start(now + delay);
      osc1.stop(now + delay + note.d + 0.2);
      osc2.stop(now + delay + note.d + 0.2);
    });
  } catch (e) {
    console.warn("LevelUp audio error:", e);
  }
};

/**
 * Plays a quick, magical escaping "poof" sound.
 */
export const playFleeSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);

    gain.gain.setValueAtTime(0.065 * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn("Flee audio error:", e);
  }
};

/**
 * Plays a sparkling, triumphant battle victory arpeggio.
 */
export const playVictorySound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    // Bright Major 7th ascending cascade (C5 - E5 - G5 - B5 - C6)
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.10;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.05 * sfxVol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.5);
    });
  } catch (e) {
    console.warn("Victory audio error:", e);
  }
};

/**
 * Plays a low, somber, sliding tone for defeat.
 */
export const playDefeatSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sfxVol = getSfxVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(50, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);

    gain.gain.setValueAtTime(0.12 * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.4);
  } catch (e) {
    console.warn("Defeat audio error:", e);
  }
};
