import type { ChildrenStatus, KinshipVariant } from "../../src/data/types";

// How she names the family path to the player. Always concrete: «сестра твоей бабушки», «твоя мама».
// `bridge` is her sibling or cousin who is the player's grandparent; `parent` is the player's parent.
// Older saves without recorded sexes fall back to the neutral wording they were generated with.

export type Sex = "female" | "male" | undefined;

function grandparentGenitive(sex: Sex): string | null {
  if (sex === "female") return "твоей бабушки";
  if (sex === "male") return "твоего дедушки";
  return null;
}

export function spokenRelationship(variant: KinshipVariant, bridge: Sex, parent: Sex): string {
  switch (variant) {
    case "biological_grandmother":
      if (parent === "female") return "Я мама твоей мамы, родная бабушка. Но само родство ещё не делает людей близкими, это мы уже потом устроили.";
      if (parent === "male") return "Я мама твоего папы, родная бабушка. Но само родство ещё не делает людей близкими, это мы уже потом устроили.";
      return "Я твоя родная бабушка. Но само родство ещё не делает людей близкими, это мы уже потом устроили.";
    case "adoptive_grandmother":
      if (parent === "female") return "Твою маму я удочерила задолго до твоего рождения. Слово «приёмная» всё объясняет на бумаге и почти ничего между нами.";
      if (parent === "male") return "Твоего папу я усыновила задолго до твоего рождения. Слово «приёмная» всё объясняет на бумаге и почти ничего между нами.";
      return "Твоего родителя я приняла в семью задолго до твоего рождения. Слово «приёмная» всё объясняет на бумаге и почти ничего между нами.";
    case "great_aunt": {
      const grandparent = grandparentGenitive(bridge);
      if (!grandparent) return "Формально я сестра твоей бабушки или дедушки. Но в семье меня всегда звали бабушкой, и ты тоже.";
      const child = parent === "female" ? " Твоя мама в детстве звала меня тётей, а у тебя с первого слова вышло «бабушка», так и прижилось." : "";
      return `Формально я сестра ${grandparent}. Но в семье меня всегда звали бабушкой, и ты тоже.${child}`;
    }
    case "cousin_grandmother": {
      const grandparent = grandparentGenitive(bridge);
      if (!grandparent) return "Я двоюродная родственница твоей бабушки или дедушки. Для тебя с самого начала была просто бабушкой.";
      return `Я двоюродная сестра ${grandparent}, мы росли через два двора друг от друга. Для тебя я с самого начала была просто бабушкой.`;
    }
  }
}

export function spokenChildren(status: ChildrenStatus, parent: Sex): string {
  switch (status) {
    case "biological_parent":
      if (parent === "female") return "У меня родилась дочка, твоя мама. Только не думай, что после этого я сразу всё поняла про семью.";
      if (parent === "male") return "У меня родился сын, твой папа. Только не думай, что после этого я сразу всё поняла про семью.";
      return "У меня родился ребёнок, который потом стал твоим родителем. Только не думай, что после этого я сразу всё поняла про семью.";
    case "adoptive_parent": {
      const who = parent === "female" ? "Твою маму я удочерила" : parent === "male" ? "Твоего папу я усыновила" : "Твоего родителя я усыновила или удочерила";
      return `Биологических детей у меня не было. ${who}, а дальше были обычные семейные дни, хорошие и невозможные.`;
    }
    case "chose_no_children": return "Я сознательно не хотела собственных детей. Не из-за одной большой причины, просто не видела себя матерью. Жизнь от этого пустой не стала.";
    case "wanted_no_children": return "Детей я хотела, но их не было. Это было больно, потом стало частью жизни, но не единственным её названием.";
    case "circumstances_changed": return "Я всё откладывала решение о детях, а потом обстоятельства изменились. Иногда думаю об этом, но не считаю всю жизнь ошибкой.";
    case "no_strong_preference": return "Я никогда не чувствовала, что материнство обязательно должно стать центром моей жизни. Вокруг это понимали не все, а мне объяснять надоело.";
    case "mentor_without_children": return "Собственных детей у меня не было. Зато младшие родственники всё время оказывались у меня на кухне, и я для них была важным взрослым, хоть и не всегда удобным.";
  }
}
