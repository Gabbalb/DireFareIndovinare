// Web Audio API Synthesizer for Game Show Effects
// No external assets required, runs entirely in the browser!

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  // Zoom swell sound: rising pitch sweep
  zoom: (muted: boolean) => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.8);
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  },

  // Open flap sound: short crackle and snap
  open: (muted: boolean) => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Paper rustle (bandpass filtered noise)
      const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 2;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noise.start(now);
      noise.stop(now + 0.15);
      
      // Snap pop
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  },

  // Reveal sheet sound: sparkling brass triumph chord
  reveal: (muted: boolean) => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // We play a C Major chord (C4, E4, G4, C5) with triangle waves for a retro brassy/fluty game show vibe
      const frequencies = [261.63, 329.63, 392.00, 523.25];
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        // Slight detune for chorus effect
        osc.detune.value = (Math.random() - 0.5) * 10;
        
        // Staggered note onset for arpeggio feel
        const noteOn = now + idx * 0.08;
        
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.setValueAtTime(0.01, noteOn);
        gain.gain.linearRampToValueAtTime(0.12, noteOn + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.06, noteOn + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, noteOn + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(noteOn);
        osc.stop(noteOn + 1.3);
      });
      
      // Add a high pitch chime spark on top
      const oscChime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      oscChime.type = 'sine';
      oscChime.frequency.setValueAtTime(1200, now + 0.32);
      oscChime.frequency.exponentialRampToValueAtTime(2000, now + 0.8);
      
      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.setValueAtTime(0.08, now + 0.32);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      
      oscChime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      oscChime.start(now + 0.32);
      oscChime.stop(now + 0.9);
      
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  },

  // Close sound: soft descending slide
  close: (muted: boolean) => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }
};
