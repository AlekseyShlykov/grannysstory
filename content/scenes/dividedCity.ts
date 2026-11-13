// The side of a divided city she lived on, settled in conversation when it reaches the division (Berlin 1948).
// Fiction in her voice; it states only that the city was divided and where her home was, nothing about the
// politics of either side. English in src/i18n/en/names.json.

export interface DividedCitySide {
  /** The player's question that settles this side. */
  question: string;
  /** Her answer; from then on history reaches her through this part of the city. */
  answer: string;
  /** Title of the life event in the atlas. */
  eventTitle: string;
}

export const dividedCitySides: Record<string, DividedCitySide> = {
  "de-berlin-west": {
    question: "Когда Берлин разделили, твой дом оказался на западной стороне?",
    eventTitle: "Дом оказался на западной стороне Берлина",
    answer: "На западной. Улица осталась той же, соседи те же, а город вокруг будто поделили на две квартиры с общей лестницей. Мы долго думали, что это ненадолго."
  },
  "de-berlin-east": {
    question: "Или на восточной?",
    eventTitle: "Дом оказался на восточной стороне Берлина",
    answer: "На восточной. Сначала казалось, что всё это только на бумаге, а дом как стоял, так и стоит. Мы долго думали, что это ненадолго."
  }
};
