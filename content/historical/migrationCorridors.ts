// Documented paths across a state border. A generated life may cross a border at a migration turning point only
// along one of these, and only in the years the cited verified records give. Everything else stays inside her
// state that year (src/engine/world/migration.ts). How often a life takes such a path is a game weight
// (CROSS_BORDER_SHARE, D-004), not a statistic about emigration.

export interface MigrationCorridor {
  id: string;
  /** Verified world records that opened and, where it applies, closed this path; tests require them in the packs. */
  eventIds: readonly string[];
  /** Sovereign state ids (world registry) she must live in when she decides. */
  fromStates: readonly string[];
  /** Settlements the records name or that the recruitment and resettlement actually reached. */
  toPlaceIds: readonly string[];
  /** Years she could start the move (inclusive), as the records date the path. */
  fromYear: number;
  toYear: number;
  /** What the records say, in a few words (research note, not shown to the player). */
  note: string;
}

export const migrationCorridors: readonly MigrationCorridor[] = [
  {
    id: "it-to-frg-recruitment",
    eventIds: ["it-nat-1955-germany-recruitment", "de-nrw-1955-italian-recruitment", "de-wolfsburg-1960s-italian-workers"],
    fromStates: ["it"],
    // Records place Italian recruits in North Rhine-Westphalia and at Volkswagen in Wolfsburg.
    toPlaceIds: ["de-koeln", "de-wolfsburg"],
    fromYear: 1956,
    // The agreement dates from 1955; no record in the set closes this path (Italians later moved freely within the
    // EEC). 1973 is a model boundary matching the Wolfsburg record, not a dated end.
    toYear: 1973,
    note: "соглашение о вербовке Италия–ФРГ 1955 г.; итальянцы в NRW и на заводе VW в Вольфсбурге"
  },
  {
    id: "tr-to-frg-recruitment",
    eventIds: ["tr-nat-1961-germany-recruitment", "de-nat-1961-turkey-recruitment", "de-nrw-1955-italian-recruitment"],
    fromStates: ["tr"],
    // NRW is where the records place the largest Turkish-origin community; West Berlin is left out because a
    // newcomer from abroad could not be placed on the right side of the divided city.
    toPlaceIds: ["de-koeln"],
    fromYear: 1962,
    toYear: 1973,
    note: "соглашение Турция–ФРГ 30.10.1961, 12 лет действия по записи tr-nat-1961-germany-recruitment"
  },
  {
    id: "gdr-to-frg-before-wall",
    eventIds: ["de-nat-1961-gdr-border-closed"],
    fromStates: ["state-gdr"],
    toPlaceIds: ["de-muenchen", "de-koeln", "de-hamburg"],
    fromYear: 1950,
    // The border was closed to GDR residents on 16 August 1961; residences change by whole years, so 1960 is the
    // last year a move can start.
    toYear: 1960,
    note: "массовый уход из ГДР до закрытия границы 13–16.08.1961"
  }
];
