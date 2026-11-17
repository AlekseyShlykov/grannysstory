/** Conservative limits of the authored travel model, not claims that historical migration was impossible. */
export const unreviewedMigrationWindows = [
  {
    country: "ES", fromYear: 1936, toYear: 1939,
    eventIds: ["es-1936-civil-war", "es-1939-dictatorship"],
    note: "Civil War front-line passages between the four cities are not reviewed. Do not generate a route through a front from a shared ES country code. Whole-year restriction matches residence precision."
  },
  {
    country: "JP", fromYear: 1944, toYear: 1951,
    eventIds: ["jp-1941-pacific-war", "jp-1945-allied-occupation", "jp-1952-occupation-ends"],
    note: "Late-war and occupation-era routes are not reviewed. A conservative authored-model window, not a historical ban on domestic travel. New choices move outside it; existing disclosed residences are preserved."
  }
] as const;
