/**
 * Web Audio API procedural sound engine.
 * Implements pitch escalation on pentatonic scales for tactile "juice" without external assets.
 */

const PENTATONIC_HZ = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  1046.5, // C6
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    delay: number,
    type: OscillatorType,
    volume: number,
    slideToFreq?: number,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playCardSelect() {
    this.playTone(520, 0.07, 0, 'sine', 0.08, 660);
  }

  playHoverTick() {
    this.playTone(380, 0.035, 0, 'triangle', 0.025);
  }

  playBulldoze() {
    this.playTone(170, 0.16, 0, 'sawtooth', 0.08, 85);
    this.playTone(120, 0.14, 0.06, 'triangle', 0.09, 70);
  }

  /**
   * Tactile marimba pop + rising pentatonic arpeggio proportional to synergy count.
   */
  playPlace(synergyCount: number, isNegativeOnly: boolean) {
    if (isNegativeOnly) {
      this.playTone(240, 0.12, 0, 'triangle', 0.11, 185);
      return;
    }
    // Base wooden pop
    this.playTone(280, 0.11, 0, 'triangle', 0.14, 340);

    const steps = Math.min(Math.max(synergyCount, 1), 6);
    for (let i = 0; i < steps; i++) {
      const note = PENTATONIC_HZ[Math.min(i + 2, PENTATONIC_HZ.length - 1)];
      this.playTone(note, 0.18, 0.045 * (i + 1), 'sine', 0.09);
    }
  }

  /**
   * Rich harmonic chord + ascending sparkle for Merge / Chain reactions!
   */
  playMerge(chainCount: number, mergedLevel: number) {
    const rootIdx = Math.min(2 + chainCount * 2 + (mergedLevel - 2), 6);
    const notes = [
      PENTATONIC_HZ[rootIdx],
      PENTATONIC_HZ[Math.min(rootIdx + 2, PENTATONIC_HZ.length - 1)],
      PENTATONIC_HZ[Math.min(rootIdx + 3, PENTATONIC_HZ.length - 1)],
      PENTATONIC_HZ[Math.min(rootIdx + 5, PENTATONIC_HZ.length - 1)],
    ];
    notes.forEach((hz, idx) => {
      this.playTone(hz, 0.34, idx * 0.055, 'triangle', 0.12);
      this.playTone(hz * 2, 0.24, idx * 0.055 + 0.02, 'sine', 0.045);
    });
  }

  playQuestComplete() {
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((hz, i) => {
      this.playTone(hz, 0.22, i * 0.065, 'sine', 0.1);
    });
  }

  playRankUp() {
    const fanfare = [392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((hz, i) => {
      const dur = i === fanfare.length - 1 ? 0.52 : 0.18;
      this.playTone(hz, dur, i * 0.08, 'triangle', 0.13);
      if (i === fanfare.length - 1) {
        this.playTone(523.25, 0.52, i * 0.08, 'sine', 0.09);
        this.playTone(659.25, 0.52, i * 0.08, 'sine', 0.08);
      }
    });
  }

  playUndo() {
    this.playTone(440, 0.1, 0, 'sine', 0.08, 310);
  }

  playGameOver() {
    const chord = [523.25, 440.0, 392.0, 329.63];
    chord.forEach((hz, i) => {
      this.playTone(hz, 0.36, i * 0.11, 'sine', 0.09);
    });
  }
}

export const sound = new SoundEngine();
