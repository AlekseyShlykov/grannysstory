import { describe, expect, it } from "vitest";
import { followUpAnswerBridges, timelineAnswerBridges } from "../content/scenes/answerBridges";
import { milestoneFollowUpQuestions } from "../content/scenes/historicalNarration";
import { finalQuestionForms, lifeCourseFragments, questionForms } from "../content/scenes/lifeCourse";
import { regionPacks } from "../src/data/catalog";
import { generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { translateText } from "../src/i18n";
import { selection } from "./helpers";

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/u.test(value);
const allBridges = [...Object.values(timelineAnswerBridges), ...Object.values(followUpAnswerBridges)].flat();

describe("answer bridges", () => {
  it("open the answer to every question she can be asked", () => {
    for (const question of [...Object.values(questionForms).flat(), ...Object.values(finalQuestionForms)]) {
      expect(timelineAnswerBridges[question], question).toBeDefined();
    }
    for (const question of milestoneFollowUpQuestions) expect(followUpAnswerBridges[question], question).toBeDefined();
    expect(new Set(allBridges).size).toBe(allBridges.length);
  });

  it("have English that also joins the memory after them", () => {
    const fragment = lifeCourseFragments.adult[0]!;
    for (const bridge of allBridges) {
      expect(hasCyrillic(translateText(bridge, "en")), bridge).toBe(false);
      expect(hasCyrillic(translateText(`${bridge} ${fragment.detail} ${fragment.feeling}`, "en")), bridge).toBe(false);
    }
  });

  it("start her answer with an opening to the question just asked, and stay out of the atlas text", () => {
    for (const seed of ["bridge-a", "bridge-b", "bridge-c"]) {
      let state = generateSession(selection("tver", 1925, seed), regionPacks.tver);
      for (let guard = 0; guard < 80 && state.screen === "conversation"; guard += 1) {
        const options = currentScene(state).options;
        const option = options[guard % options.length]!;
        state = chooseOption(state, option.id);
        const answer = state.dialogue.transcript.at(-1)!.text;
        const question = option.text.replace(/^(?:В|Сейчас) \d{4} (?:году|год), тебе (?:было )?\d+ (?:год|года|лет)\. /u, "");
        const pair = timelineAnswerBridges[question] ?? followUpAnswerBridges[question];
        if (pair) expect(pair.some((bridge) => answer.startsWith(bridge)), `${question} → ${answer.slice(0, 80)}`).toBe(true);
      }
      for (const event of state.biography.lifeEvents) {
        for (const bridge of allBridges) expect(event.text.includes(bridge), event.id).toBe(false);
      }
    }
  });
});
