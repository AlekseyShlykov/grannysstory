import { afterEach, describe, expect, it } from "vitest";
import { clearWorldPacks, registerWorldPack, worldManifest } from "../src/data/worldStore";
import { translateText } from "../src/i18n";
import { spokenFactSentence } from "../content/scenes/historicalNarration";

afterEach(() => clearWorldPacks());

describe("historical translations loaded with geographic packs", () => {
  it("refreshes cached fallback text when a pack arrives, and removes its translations when cleared", () => {
    clearWorldPacks();
    const ru = "Архивный буклет с зелёной переплётной нитью.";
    const en = "An archival booklet sewn with green binding thread.";
    const before = translateText(ru, "en");
    registerWorldPack({ locationId: "es-oviedo", version: worldManifest.worldDatasetVersion,
      events: [], contexts: [], translations: { [ru]: en } });
    expect(translateText(ru, "en")).toBe(en);
    clearWorldPacks();
    expect(translateText(ru, "en")).toBe(before);
  });

  it("translates a shortened spoken fact from its pack without loading other countries", () => {
    const ru = "В 1984 году вышел местный переписной бюллетень. Он различал виды домохозяйств.";
    registerWorldPack({ locationId: "es-madrid", version: worldManifest.worldDatasetVersion,
      events: [], contexts: [], translations: {
        [ru]: "In 1984 a local census bulletin appeared. It distinguished household types."
      } });
    const spoken = spokenFactSentence(ru);
    expect(spoken).not.toBeNull();
    const text = translateText(spoken!, "en");
    expect(text).toContain("local census bulletin");
    expect(text).not.toMatch(/[А-Яа-яЁё]|1984/u);
  });
});
