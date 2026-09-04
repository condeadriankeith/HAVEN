/**
 * Tactical Web Audio Synthesizer for HAVEN Command Center
 * High-performance sound effects without external audio file dependencies.
 */

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Dual-tone emergency siren for incoming SOS dispatches
 */
export function playEmergencyAlarm() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';

    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(880, startTime);
    osc.frequency.linearRampToValueAtTime(660, startTime + 0.25);
    osc.frequency.linearRampToValueAtTime(880, startTime + 0.5);
    osc.frequency.linearRampToValueAtTime(660, startTime + 0.75);
    osc.frequency.linearRampToValueAtTime(880, startTime + 1.0);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.05);
    gain.gain.setValueAtTime(0.25, startTime + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.1);
  } catch (err) {
    console.warn('Audio synthesis warning:', err);
  }
}

/**
 * Ascending harmonic confirmation chime
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = startTime + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.28);
    });
  } catch (err) {
    console.warn('Audio synthesis warning:', err);
  }
}

/**
 * Crisp tactical micro-click for immediate tactile UI interaction feedback
 */
export function playClickFeedback() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(1400, startTime);
    osc.frequency.exponentialRampToValueAtTime(700, startTime + 0.03);

    gain.gain.setValueAtTime(0.06, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.03);
  } catch {}
}

/**
 * High-tech radar scan blip when a target is acquired on map
 */
export function playRadarBlip() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(1960, startTime);
    osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.08);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.09);
  } catch {}
}
