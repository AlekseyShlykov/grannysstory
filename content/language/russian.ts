/** A number with the Russian form of «год»: 21 год, 93 года, 100 лет. */
export function yearsCount(value: number): string {
  const years = Math.max(0, Math.floor(value));
  const lastTwo = years % 100;
  const last = years % 10;
  const noun = lastTwo >= 11 && lastTwo <= 14
    ? "лет"
    : last === 1
      ? "год"
      : last >= 2 && last <= 4
        ? "года"
        : "лет";
  return `${years} ${noun}`;
}
