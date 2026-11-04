const SOUND_PREFERENCE_KEY = "babushka-sound-enabled";

type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function storedSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_PREFERENCE_KEY) !== "false";
  } catch {
    return true;
  }
}

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

/**
 * One audio session for the whole application. The tea cue starts directly from the user's click, while
 * story data may continue loading. Music enters only after that cue and is coloured in Web Audio rather
 * than shipping a second derivative recording.
 */
export class StoryAudioController {
  private enabled = storedSoundPreference();
  private tea: HTMLAudioElement | null = null;
  private music: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private musicConnected = false;

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
    } catch {
      // Sound still works for this page even when storage is unavailable.
    }
    if (this.tea) this.tea.muted = !enabled;
    if (this.music) this.music.muted = !enabled;
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(enabled ? 1 : 0, this.context.currentTime, 0.025);
    }
    if (enabled && this.context?.state === "suspended") void this.context.resume().catch(() => undefined);
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  startIntro(): void {
    if (typeof Audio === "undefined") return;
    this.ensureMedia();
    this.ensureRecordChain();
    if (!this.tea || !this.music) return;

    this.stopSurfaceNoise();
    this.music.pause();
    this.music.currentTime = 0;
    this.tea.pause();
    this.tea.currentTime = 0;
    this.tea.muted = !this.enabled;
    this.tea.onended = () => this.startMusic();
    this.tea.onerror = () => this.startMusic();

    try {
      const playback = this.tea.play();
      void playback?.catch(() => this.startMusic());
    } catch {
      this.startMusic();
    }
  }

  private ensureMedia(): void {
    if (!this.tea) {
      this.tea = new Audio(assetUrl("assets/music/tea.wav"));
      this.tea.preload = "auto";
    }
    if (!this.music) {
      this.music = new Audio(assetUrl("assets/music/music.mp3"));
      this.music.preload = "auto";
      this.music.loop = true;
      this.music.volume = 0.42;
    }
    this.tea.muted = !this.enabled;
    this.music.muted = !this.enabled;
  }

  private ensureRecordChain(): void {
    if (!this.music || this.musicConnected || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(this.music);
      const highPass = context.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 105;
      const lowPass = context.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 6_300;
      lowPass.Q.value = 0.45;
      const warmth = context.createWaveShaper();
      warmth.curve = this.saturationCurve();
      warmth.oversample = "2x";
      const musicGain = context.createGain();
      musicGain.gain.value = 0.72;
      const masterGain = context.createGain();
      masterGain.gain.value = this.enabled ? 1 : 0;

      source.connect(highPass).connect(lowPass).connect(warmth).connect(musicGain).connect(masterGain).connect(context.destination);
      this.context = context;
      this.masterGain = masterGain;
      this.musicConnected = true;
      void context.resume().catch(() => undefined);
    } catch {
      // The plain looping track remains a complete fallback when Web Audio is unavailable.
      this.context = null;
      this.masterGain = null;
      this.musicConnected = false;
    }
  }

  private saturationCurve(): Float32Array<ArrayBuffer> {
    const curve = new Float32Array(new ArrayBuffer(256 * Float32Array.BYTES_PER_ELEMENT));
    for (let index = 0; index < curve.length; index += 1) {
      const x = (index * 2) / (curve.length - 1) - 1;
      curve[index] = Math.tanh(x * 1.35) / Math.tanh(1.35);
    }
    return curve;
  }

  private startMusic(): void {
    if (!this.music) return;
    this.music.muted = !this.enabled;
    if (this.context?.state === "suspended") void this.context.resume().catch(() => undefined);
    this.startSurfaceNoise();
    try {
      const playback = this.music.play();
      void playback?.catch(() => undefined);
    } catch {
      // A browser may still deny playback; the rest of the game is intentionally unaffected.
    }
  }

  private startSurfaceNoise(): void {
    if (!this.context || !this.masterGain || this.noise) return;
    const duration = 8;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    let seed = 0x5f3759df;
    const random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 0xffffffff;
    };
    let click = 0;
    for (let index = 0; index < channel.length; index += 1) {
      if (random() < 0.00055) click = 0.65 + random() * 0.35;
      channel[index] = (random() * 2 - 1) * 0.075 + click;
      click *= 0.86;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const highPass = this.context.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 1_200;
    const lowPass = this.context.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 5_800;
    const gain = this.context.createGain();
    gain.gain.value = 0.055;
    source.connect(highPass).connect(lowPass).connect(gain).connect(this.masterGain);
    source.start();
    this.noise = source;
  }

  private stopSurfaceNoise(): void {
    if (!this.noise) return;
    try {
      this.noise.stop();
      this.noise.disconnect();
    } catch {
      // The node may already have ended during navigation.
    }
    this.noise = null;
  }
}

export const storyAudio = new StoryAudioController();
