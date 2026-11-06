import { describe, expect, it } from "vitest";
import { translateText, yearsLabel } from "../src/i18n";
import catalog from "../src/i18n/en.generated.json";
import { speakableSentence } from "../content/scenes/historicalVoice";

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/u.test(value);

describe("English localization", () => {
  it("translates interface copy and Russian age forms", () => {
    expect(translateText("История бабушки", "en")).toBe("Granny's Story");
    expect(translateText("Мне тогда было 24 года.", "en")).toBe("I was 24 years old then.");
    expect(yearsLabel(1, "en")).toBe("1 year old");
    expect(yearsLabel(52, "en")).toBe("52 years old");
  });

  it("translates generated birth and historical sentences without changing their variables", () => {
    const birth = translateText("Родилась я в 1932 году, в Калинине. Это я точно знаю, так в паспорте записано.", "en");
    const history = translateText("Я помню, взрослые за ужином говорили, что алексей Леонов первым в мире вышел из космического корабля в открытый космос.", "en");
    expect(birth).toContain("1932");
    expect(hasCyrillic(birth)).toBe(false);
    expect(hasCyrillic(history)).toBe(false);
  });

  it("normalizes the inflected Russian spelling of Łódź in translated records", () => {
    const text = translateText("В 1948 г. в Лодзи основана Государственная высшая киношкола.", "en");
    expect(text).toContain("Łódź");
    expect(hasCyrillic(text)).toBe(false);
  });

  it("keeps paragraph breaks of multi-paragraph answers", () => {
    const text = translateText("Мне тогда было 24 года.\n\nМне тогда был год.", "en");
    expect(text).toMatch(/^I was 24 years old then\.\n\nI was [^\n]+$/u);
  });

  it("renders place names and locatives with correct English spelling and capitals", () => {
    expect(translateText("Тверь", "en")).toBe("Tver");
    expect(translateText("в Калинине", "en")).toBe("in Kalinin");
    expect(translateText("Краков", "en")).toBe("Kraków");
    expect(translateText("в Плозеве", "en")).toBe("in Plozévet");
    expect(translateText("Ле-Крёзо", "en")).toBe("Le Creusot");
    expect(translateText("Смоленская область", "en")).toBe("Smolensk Oblast");
    const leaked = Object.values(catalog.exact).filter((value) => /\b(?:kalinin|tver|smolensk|novgorod|petrograd)\b|Łód(?!ź)|Le Croeso|Plozew/u.test(value));
    expect(leaked).toEqual([]);
  });

  it("translates historical facts she retells without their date", () => {
    const text = translateText("Польша стала членом НАТО.", "en");
    expect(text).toMatch(/NATO/u);
    expect(hasCyrillic(text)).toBe(false);
    expect(text).not.toMatch(/\d/u);
  });

  it("translates truncated memory headlines and filled-in memory placeholders", () => {
    const headline = translateText("После смерти мамы я долго не могла привыкнуть к свободным вечерам и пошла в библиотечный кружок просто потому, что там горел свет,…", "en");
    expect(hasCyrillic(headline)).toBe(false);
    const memory = translateText("Мы с моим родным человеком, брат, много лет были в обиде друг на друга, уже и не помню из-за чего", "en");
    expect(memory).toMatch(/^My brother/u);
    expect(translateText("Тогда не стало папы", "en")).toMatch(/my dad$/u);
  });

  it("does not cut a spoken fact at an initial or at U.S.", () => {
    expect(speakableSentence("Мост построил инженер Л. И. Машек. Потом его перестроили.")).toBe("Мост построил инженер Л. И. Машек.");
    expect(speakableSentence("На заводе U.S. Steel работали тысячи людей. Потом он закрылся.")).toBe("На заводе U.S. Steel работали тысячи людей.");
  });

  it("has an English rendering for every extracted Russian content string", () => {
    const untranslated = Object.keys(catalog.exact).filter((source) => hasCyrillic(translateText(source, "en")));
    expect(untranslated.slice(0, 10)).toEqual([]);
  });
});
