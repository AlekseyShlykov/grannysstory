import { afterEach, describe, expect, it, vi } from "vitest";
import { StoryAudioController } from "../src/app/audio";

class FakeAudio {
  static created: FakeAudio[] = [];
  readonly src: string;
  preload = "";
  loop = false;
  volume = 1;
  muted = false;
  currentTime = 0;
  onended: ((event: Event) => void) | null = null;
  onerror: ((event: Event | string) => void) | null = null;
  play = vi.fn(async () => undefined);
  pause = vi.fn();

  constructor(src: string) {
    this.src = src;
    FakeAudio.created.push(this);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeAudio.created = [];
});

describe("story audio", () => {
  it("plays the tea cue first, then starts quiet looping music", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    const audio = new StoryAudioController();

    audio.startIntro();
    expect(FakeAudio.created).toHaveLength(2);
    const [tea, music] = FakeAudio.created;
    expect(tea!.src).toContain("assets/music/tea.wav");
    expect(music!.src).toContain("assets/music/music.mp3");
    expect(tea!.play).toHaveBeenCalledOnce();
    expect(music!.play).not.toHaveBeenCalled();
    expect(music!.loop).toBe(true);

    tea!.onended?.(new Event("ended"));
    await Promise.resolve();
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
