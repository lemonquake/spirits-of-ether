// Web Audio API Synthesizer for Spirits of Ether
// Generates lightweight, premium sound effects without downloading heavy assets.

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
 * Initializes the audio context. Should be called on user interaction (e.g. click).
 */
export const initAudio = () => {
  try {
    const ctx = getAudioContext();
    return ctx;
  } catch (e) {
    console.warn("Failed to initialize AudioContext:", e);
    return null;
  }
};

/**
 * Play a light, crisp, high-frequency hover chime
 */
export const playHoverSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // We create a dual-sine bell sound
    const frequencies = [1500, 1900];
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq - 100, now + 0.12);
      
      gainNode.gain.setValueAtTime(0.015, now); // soft volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    });
  } catch (e) {
    // Ignore context warnings before interaction
  }
};

/**
 * Play a sparkling crystal arpeggio for confirm/click actions
 */
export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // C major pentatonic-like chime stack (C5 - E5 - G5 - C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const delay = idx * 0.035; // fast arpeggio
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      // Subtle pitch bend downwards
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + delay + 0.25);
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0.05, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
    
    // Add a gentle white-noise splash at the back for texture
    const bufferSize = ctx.sampleRate * 0.08; // 80ms of noise
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
    noiseGain.gain.setValueAtTime(0.015, now);
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
 * Play a sweeping magical synthesized wind/bell transition effect
 */
export const playAwakenSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // 1. Deep Bass Swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(55, now); // A1
    subOsc.frequency.linearRampToValueAtTime(110, now + 1.2); // A2
    
    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);
    
    // 2. Synthesizer Swell with Biquad Filter Sweep
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
    
    synthGain.gain.setValueAtTime(0.01, now);
    synthGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
    synthGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    synthOsc.connect(filter);
    filter.connect(synthGain);
    synthGain.connect(ctx.destination);
    
    synthOsc.start(now);
    synthOsc.stop(now + 1.4);
    
    // 3. Sparkling bell cascade at peak (delayed by 350ms)
    const peakTime = now + 0.35;
    const chimeFreqs = [880, 1100, 1320, 1760, 2200];
    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.05;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, peakTime + delay);
      
      gain.gain.setValueAtTime(0.035, peakTime + delay);
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
