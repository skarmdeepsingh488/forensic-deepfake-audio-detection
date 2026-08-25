// Synthetic audio generator using Web Audio API to provide real audible speech-like waveforms and synthesis artifacts
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Generate a realistic speech-like audio buffer using formant synthesis:
 * - Real human: Smooth fundamental frequency (F0) inflection around 120-180Hz, vowel formants (F1: 700Hz, F2: 1220Hz, F3: 2600Hz), natural vibrato & micro-pauses
 * - AI Voice Clone / Deepfake: Fixed mechanical pitch, sharp vocoder harmonics, metallic high-frequency ringing (>8kHz)
 * - AI Telephony Fraud Bot: Robotic stepped tones, flat pitch, buzz vocoder artifacts
 */
export function createSyntheticSpeechAudio(type: 'human' | 'clone' | 'fraud' | 'default', durationSec: number = 8): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const numFrames = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, numFrames, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Synthesize audio waveform based on voice profile
  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === 'human') {
      // Natural human speech modulation (vocal pulses, formants, subtle breathiness)
      // Sentence intonation pitch contour
      const f0 = 130 + 25 * Math.sin(2 * Math.PI * 0.4 * t) + 10 * Math.sin(2 * Math.PI * 1.2 * t);
      const phase = 2 * Math.PI * f0 * t;
      
      // Glottal pulse fundamental + harmonics
      const glottal = Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase);
      
      // Formant filters simulation (F1 = 700Hz, F2 = 1200Hz, F3 = 2500Hz)
      const f1 = Math.sin(2 * Math.PI * 700 * t) * Math.exp(-((t * 20) % 1) * 3);
      const f2 = Math.sin(2 * Math.PI * 1220 * t) * Math.exp(-((t * 20) % 1) * 4);
      const f3 = Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-((t * 20) % 1) * 6);
      
      // Breath noise (unvoiced components)
      const breath = (Math.random() * 2 - 1) * 0.02;

      // Speech envelope (natural pauses between words)
      const envelope = Math.max(0, Math.sin(2 * Math.PI * 0.8 * t) * Math.sin(2 * Math.PI * 1.8 * t));
      
      sample = (glottal * 0.4 + (f1 * 0.3 + f2 * 0.2 + f3 * 0.1) * envelope + breath) * Math.min(1, Math.max(0, envelope * 1.5));
    } else if (type === 'clone') {
      // ElevenLabs-style AI clone: Rigid pitch, phase alignment anomalies, 9.5kHz vocoder hiss
      const f0 = 145; // Locked unnatural pitch
      const phase = 2 * Math.PI * f0 * t;
      const buzz = Math.sin(phase) + 0.7 * Math.sin(2 * phase) + 0.6 * Math.sin(3 * phase) + 0.5 * Math.sin(4 * phase);
      
      // Vocoder buzz with metallic overtone (>8 kHz)
      const vocoderArtifact = Math.sin(2 * Math.PI * 8800 * t) * 0.08;
      const subHarmonic = Math.sin(2 * Math.PI * (f0 / 2) * t) * 0.1;
      
      // Fast repetitive neural cadences
      const envelope = Math.max(0.1, Math.abs(Math.sin(2 * Math.PI * 1.4 * t)));
      sample = (buzz * 0.4 + vocoderArtifact + subHarmonic) * envelope;
    } else {
      // AI Telephony / HiFi-GAN Fraud: Stepped pitch levels, buzz vocoder, robotic cadence
      const stepPitch = 120 + Math.floor((t * 2) % 4) * 25;
      const phase = 2 * Math.PI * stepPitch * t;
      const square = Math.sign(Math.sin(phase)) * 0.3;
      const saw = (((phase / Math.PI) % 2) - 1) * 0.2;
      const roboticChirp = Math.sin(2 * Math.PI * 6500 * t) * 0.05;
      
      const envelope = ((t * 3) % 1 > 0.15) ? 0.8 : 0.05;
      sample = (square + saw + roboticChirp) * envelope;
    }

    // Soft limiter
    channelData[i] = Math.max(-0.95, Math.min(0.95, sample * 0.7));
  }

  return buffer;
}

export function playAudioBuffer(
  buffer: AudioBuffer,
  onEnded?: () => void,
  onProgress?: (progressSec: number, totalSec: number) => void
): { stop: () => void } {
  const ctx = getAudioContext();
  stopActiveAudio();

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.8, ctx.currentTime);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  currentSource = source;
  const startTime = ctx.currentTime;
  const duration = buffer.duration;

  let animFrameId: number | null = null;

  const updateProgress = () => {
    if (!currentSource) return;
    const elapsed = ctx.currentTime - startTime;
    if (onProgress) {
      onProgress(Math.min(elapsed, duration), duration);
    }
    if (elapsed < duration) {
      animFrameId = requestAnimationFrame(updateProgress);
    }
  };

  source.onended = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    currentSource = null;
    if (onEnded) onEnded();
  };

  source.start(0);
  animFrameId = requestAnimationFrame(updateProgress);

  return {
    stop: () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      stopActiveAudio();
      if (onEnded) onEnded();
    }
  };
}

export function playFileAudio(
  file: File,
  onEnded?: () => void,
  onProgress?: (progressSec: number, totalSec: number) => void
): Promise<{ stop: () => void }> {
  const ctx = getAudioContext();
  stopActiveAudio();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        const control = playAudioBuffer(decodedBuffer, onEnded, onProgress);
        resolve(control);
      } catch (err) {
        // If file format is not decodable directly by WebAudio, fallback to synthesized preview
        console.warn('Audio decoding fallback:', err);
        const fallbackBuffer = createSyntheticSpeechAudio('human', 6);
        const control = playAudioBuffer(fallbackBuffer, onEnded, onProgress);
        resolve(control);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function stopActiveAudio(): void {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch {
      // ignore if already stopped
    }
    currentSource = null;
  }
}
