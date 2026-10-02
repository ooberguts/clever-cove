export type DigitTone = "correct" | "incorrect";

type WebkitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export class GameSoundService {
  private audioContext?: AudioContext;

  digit(tone: DigitTone, muted = false): void {
    if (muted) return;
    this.play([{ frequency: tone === "correct" ? 660 : 220, duration: tone === "correct" ? 0.07 : 0.11 }]);
  }

  clear(muted = false): void {
    if (muted) return;
    this.play([{ frequency: 310, duration: 0.09 }]);
  }

  success(muted = false): void {
    if (muted) return;
    this.play([
      { frequency: 523, duration: 0.09 },
      { frequency: 659, duration: 0.09 },
      { frequency: 784, duration: 0.18 },
    ]);
  }

  retry(muted = false): void {
    if (muted) return;
    this.play([
      { frequency: 330, duration: 0.09 },
      { frequency: 262, duration: 0.13 },
    ]);
  }

  private play(notes: Array<{ frequency: number; duration: number }>): void {
    const AudioContextConstructor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.audioContext ??= new AudioContextConstructor();
    const context = this.audioContext;
    if (context.state === "suspended") void context.resume();

    let start = context.currentTime;
    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + note.duration + 0.015);
      start += note.duration;
    }
  }
}
