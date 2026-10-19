// Ambient audio synthesizer using Web Audio API (no external file dependencies)
let audioCtx: AudioContext | null = null;
let currentSourceNodes: { stop: () => void } | null = null;

export function stopAmbientSound() {
  if (currentSourceNodes) {
    try {
      currentSourceNodes.stop();
    } catch {
      // ignore
    }
    currentSourceNodes = null;
  }
}

export function playAmbientSound(type: 'rain' | 'cafe' | 'binaural') {
  stopAmbientSound();

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (type === 'rain') {
      // Pink/Brownish noise for rain
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.08;
        b2 = 0.85 * b2 + white * 0.12;
        output[i] = (b0 + b1 + b2) * 0.3;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      currentSourceNodes = {
        stop: () => {
          whiteNoise.stop();
          whiteNoise.disconnect();
          filter.disconnect();
        }
      };
    } else if (type === 'cafe') {
      // Soft murmuring ambient noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal + 0.02 * white) / 1.02;
        output[i] = lastVal * 2.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(450, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

      noise.connect(bandpass);
      bandpass.connect(gainNode);
      noise.start();

      currentSourceNodes = {
        stop: () => {
          noise.stop();
          noise.disconnect();
          bandpass.disconnect();
        }
      };
    } else if (type === 'binaural') {
      // 210Hz left, 220Hz right (10Hz Alpha waves for focus)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(216, ctx.currentTime);
      oscR.frequency.setValueAtTime(226, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      merger.connect(gainNode);

      oscL.start();
      oscR.start();

      currentSourceNodes = {
        stop: () => {
          oscL.stop();
          oscR.stop();
          oscL.disconnect();
          oscR.disconnect();
          merger.disconnect();
        }
      };
    }
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}
