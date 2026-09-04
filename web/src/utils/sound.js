/**
 * Web Audio API synthesizer for emergency sirens and notification alerts.
 * Operates without relying on external media assets, ensuring zero missing-file errors.
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
 * Plays an emergency dual-tone alarm siren for critical SOS alerts.
 */
export function playEmergencyAlarm() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';

    // Modulate pitch between 880Hz and 660Hz
    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(880, startTime);
    osc.frequency.linearRampToValueAtTime(660, startTime + 0.25);
    osc.frequency.linearRampToValueAtTime(880, startTime + 0.5);
    osc.frequency.linearRampToValueAtTime(660, startTime + 0.75);
    osc.frequency.linearRampToValueAtTime(880, startTime + 1.0);

    // Volume envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.05);
    gain.gain.setValueAtTime(0.25, startTime + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.1);
  } catch (err) {
    console.warn('Audio synthesis could not play alarm:', err);
  }
}

/**
 * Plays a pleasant ascending confirmation chime for resolved actions.
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
      gain.gain.exponentialRampToValueAtTime(0.15, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.28);
    });
  } catch (err) {
    console.warn('Audio synthesis could not play chime:', err);
  }
}
