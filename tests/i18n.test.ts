import { describe, expect, it } from "vitest";
import { translateText, yearsLabel } from "../src/i18n";
import catalog from "../src/i18n/en.generated.json";

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/u.test(value);

describe("English localization", () => {
  it("translates interface copy and Russian age forms", () => {
    expect(translateText("История бабушки", "en")).toBe("Grandmother's Story");
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

  it("has an English rendering for every extracted Russian content string", () => {
    const untranslated = Object.keys(catalog.exact).filter((source) => hasCyrillic(translateText(source, "en")));
    expect(untranslated.slice(0, 10)).toEqual([]);
  });
});
