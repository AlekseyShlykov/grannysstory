// Editorial weighting of verified records for the spoken conversation. The records themselves stay unchanged
// and complete in the atlas; this only decides which of them she brings up herself. She talks about turning
// points of public life (wars, crises, strikes, disasters, reforms that changed everyday money and work),
// not about acts, codes, censuses or new web domains, however true they are.

/** Records she brings up herself and may use to frame a turning point. */
export const MIN_SPOKEN_SIGNIFICANCE = 3;
/** Noticeable but secondary records, voiced only when five years hold nothing weightier. Below this: never voiced. */
export const MIN_FALLBACK_SIGNIFICANCE = 2;

const categoryWeight: Record<string, number> = {
  war_conflict: 5,
  occupation: 5,
  repression: 5,
  economic_crisis: 4,
  disaster: 4,
  migration: 3,
  political_change: 3,
  public_health: 3,
  labor: 2,
  local_economy: 2,
  housing_urban: 2,
  consumer_life: 2,
  sport: 2,
  environment: 2,
  religion: 2,
  healthcare: 2,
  social_policy: 1,
  women_rights: 1,
  education: 1,
  media_communication: 1,
  culture_leisure: 1,
  infrastructure_transport: 1,
  technology: 1,
  everyday_life: 1,
  border_administrative: 1,
  family_law: 0
};

// Hand-checked weights for records whose category says little (legacy national records are all political_change).
const overrides: Record<string, number> = {
  russian_japanese_war_1904: 4,
  october_manifesto_1905: 4,
  "ru-nat-1905-october-manifesto": 4,
  first_world_war_russia_1914: 5,
  february_revolution_1917: 5,
  "ru-nat-1917-october-revolution": 5,
  "ru-nat-1917-abdication": 4,
  "ru-nat-1921-nep": 4,
  ussr_formed_1922: 4,
  first_five_year_plan_1928: 4,
  universal_primary_education_1930: 2,
  tver_names_1931_1990: 3,
  war_begins_1941: 6,
  kalinin_liberated_1941: 6,
  victory_1945: 6,
  monetary_reform_1947: 5,
  "ru-tver-1947-flood": 3,
  stalin_death_1953: 5,
  "su-nat-1954-virgin-lands": 4,
  "su-nat-1957-housing-programme": 4,
  sputnik_1957: 4,
  gagarin_1961: 5,
  "su-nat-1961-monetary-reform": 3,
  leonov_1965: 3,
  "su-nat-1967-five-day-week": 3,
  bam_construction_1974: 3,
  soyuz_apollo_1975: 3,
  moscow_olympics_1980: 3,
  "ru-tverobl-1984-kalinin-npp": 3,
  perestroika_1985: 5,
  "su-nat-1985-anti-alcohol": 4,
  chernobyl_1986: 5,
  "su-nat-1991-august-coup": 5,
  ussr_dissolution_1991: 6,
  "ru-nat-1992-price-liberalisation": 5,
  "ru-nat-1992-vouchers": 4,
  "ru-nat-1998-redenomination": 3,
  financial_crisis_1998: 5,
  "ru-nat-2005-benefits-monetisation": 4,
  financial_crisis_2008: 4,
  "ru-tver-2010-smog": 3,
  sochi_olympics_2014: 3,
  "ru-nat-2018-pension-age-raised": 4,
  covid_2020: 5,
  ukraine_war_2022: 5,
  victory_anniversary_2025: 2,
  // Real and dated, but not what a person recalls as the event of those years.
  ussr_constitution_1924: 1,
  ussr_constitution_1936: 1,
  ussr_constitution_1977: 1,
  russian_constitution_1993: 1,
  census_1970: 0,
  census_2002: 0,
  census_2010: 0,
  census_2021_digital: 0,
  family_support_law_2006: 1,
  radio_day_first_celebration_1925: 0,
  regular_television_1931: 1,
  electronic_television_centers_1938: 1,
  mass_television_kvn_1949: 2,
  kalinin_tv_relay_1955: 1,
  color_television_1967: 1,
  ekran_satellite_1976: 1,
  bam_through_traffic_1984: 2,
  ru_domain_1994: 0,
  distributed_domain_registration_2001: 0,
  gosuslugi_launch_2009: 0,
  cyrillic_domain_2010: 0
};

// Mass upheavals named in the title outweigh a modest category (a strike filed under labor, a flood under disaster).
const MAJOR = /войн|революц|забастов|стачк|кризис|депресс|дефолт|освобожд|оккупац|блокад|побед|распад|путч|пандеми|карантин|covid|катастроф|авари|голод|наводнен|половод|перестройк|целин|мобилизац|референдум|отпуск цен|денежная реформа|карточн|закрыти[ея] (завод|сталел|шахт|комбинат|верф)|банкротств|упадок|смерть|космос|спутник|май 68|зима недовольства/i;
// Acts, codes and paperwork: voiced only when an editor raised them above in `overrides`.
const PAPERWORK = /закон|декрет|указ|кодекс|конституц|перепис|домен|портал|хартия|постановлени|регистрац|пособи|программы средней школы/i;

export function historicalSignificance(id: string, title: string, category?: string): number {
  const override = overrides[id];
  if (override !== undefined) return override;
  const base = category ? categoryWeight[category] ?? 1 : 2;
  if (PAPERWORK.test(title)) return Math.min(base, 1);
  if (MAJOR.test(title)) return Math.max(base, 4);
  return base;
}

export function isSpokenSignificant(id: string, title: string, category?: string): boolean {
  return historicalSignificance(id, title, category) >= MIN_SPOKEN_SIGNIFICANCE;
}
