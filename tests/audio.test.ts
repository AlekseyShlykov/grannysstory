import { afterEach, describe, expect, it, vi } from "vitest";
import { StoryAudioController } from "../src/app/audio";

class FakeAudio {
  static created: FakeAudio[] = [];
  readonly src: string;
  preload = "";
  loop = false;
  volume = 1;
  muted = false;
  paused = true;
  currentTime = 0;
  onended: ((event: Event) => void) | null = null;
  onerror: ((event: Event | string) => void) | null = null;
  play = vi.fn(async () => { this.paused = false; });
  pause = vi.fn(() => { this.paused = true; });

  constructor(src: string) {
    this.src = src;
    FakeAudio.created.push(this);
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  FakeAudio.created = [];
});

describe("story audio", () => {
  it("starts music after two seconds while the tea cue continues", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Audio", FakeAudio);
    const audio = new StoryAudioController();

    audio.startIntro();
    expect(FakeAudio.created).toHaveLength(2);
    const [tea, music] = FakeAudio.created;
    expect(tea!.src).toContain("assets/music/tea.mp3");
    expect(music!.src).toContain("assets/music/music.mp3");
    expect(tea!.play).toHaveBeenCalledOnce();
    expect(music!.play).not.toHaveBeenCalled();
    expect(music!.loop).toBe(true);
    expect(music!.volume).toBeCloseTo(0.42 * 0.8);
    expect(tea!.volume).toBeCloseTo(0.85 * 0.6);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(music!.play).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await Promise.resolve();
    expect(music!.play).toHaveBeenCalledOnce();
    expect(tea!.pause).toHaveBeenCalledOnce();

    tea!.onended?.(new Event("ended"));
    expect(music!.play).toHaveBeenCalledOnce();
  });

  it("mutes both parts of the sequence with one preference", () => {
    vi.stubGlobal("Audio", FakeAudio);
    const audio = new StoryAudioController();
    audio.startIntro();

    expect(audio.toggle()).toBe(false);
    expect(FakeAudio.created.every((item) => item.muted)).toBe(true);
    expect(localStorage.getItem("babushka-sound-enabled")).toBe("false");
  });
});
