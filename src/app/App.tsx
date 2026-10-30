import { useEffect, useMemo, useState } from "react";
import archiveCatalogJson from "../../content/historical/archiveCatalog.json";
import sourcesJson from "../../content/historical/sources.json";
import memorySources from "../../content/memory/memorySources.json";
import worldSourcesJson from "../../public/data/world/sources.json";
import { ensureWorldPacks } from "../data/worldStore";
import { manifest } from "../data/world";
import { loadRegionPack } from "../data/regionStore";
import type { GameSessionState, RegionId, StartSelection } from "../data/types";
import { atlasRoute, historicalBackdrop, knownAtlasEvents, laterInterpretation, unknownPeriods } from "../engine/atlas";
import { generateSession } from "../engine/biography";
import { chooseOption, currentScene } from "../engine/dialogue";
import { clearSave, loadGame, saveGame } from "../engine/persistence";
import { freshSeed } from "../engine/random";
import { allowedYears, interviewYearForBirthYear, menuRegions } from "../engine/setup";

interface SourceRecord {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

const sourceRecords: SourceRecord[] = [
  ...(sourcesJson as SourceRecord[]),
  ...worldSourcesJson.sources.map((source) => ({ id: source.id, title: source.name ?? source.id, publisher: source.publisher ?? source.name ?? source.id, url: source.url ?? "" }))
];

/** Loads the world packs a life can inherit from: every residence plus the planned destination of an open branch. */
async function prepareHistory(state: GameSessionState): Promise<void> {
  const places = [
    ...state.biography.residenceHistory.map((residence) => residence.placeId),
    ...state.biography.branches.map((branch) => branch.destinationPlaceId).filter((id): id is string => Boolean(id))
  ];
  await ensureWorldPacks(places, state.selection.birthYear, state.selection.conversationYear);
}

interface ArchiveCatalog {
  countries: Record<string, { label: string; sourceIds: string[] }>;
  regions: Record<string, string[]>;
}

const archiveCatalog = archiveCatalogJson as ArchiveCatalog;

function cryptoIndex(length: number): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return (value[0] ?? 0) % length;
}

function StartScreen({ onStart }: { onStart: (selection: StartSelection) => Promise<void> }) {
  const regions = menuRegions();
  const years = allowedYears();
  const [saved] = useState(() => loadGame());
  const [birthRegionId, setBirthRegionId] = useState<RegionId>(regions.some((region) => region.id === "tver") ? "tver" : regions[0]!.id as RegionId);
  const [birthYear, setBirthYear] = useState(Math.max(years[0]!, Math.min(manifest.conversationYear - 100, years.at(-1)!)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startSelection = async (regionId: RegionId, year: number) => {
    setLoading(true);
    setError("");
    try {
      await onStart({
        birthRegionId: regionId,
        birthYear: year,
        runSeed: freshSeed(),
        datasetVersion: manifest.datasetVersion,
        conversationYear: interviewYearForBirthYear(year)
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось начать историю.");
      setLoading(false);
    }
  };

  const startRandom = () => {
    const region = regions[cryptoIndex(regions.length)];
    const year = years[cryptoIndex(years.length)];
    if (!region || year === undefined) {
      setError("Для случайной истории пока нет доступных данных.");
      return;
    }
    void startSelection(region.id as RegionId, year);
  };

  const interviewYear = interviewYearForBirthYear(birthYear);
  const selectedRegion = regions.find((region) => region.id === birthRegionId);
  const selectedCountry = selectedRegion?.countryId ? archiveCatalog.countries[selectedRegion.countryId as keyof typeof archiveCatalog.countries] : undefined;
  const archiveSources = [
    ...(selectedCountry?.sourceIds ?? []),
    ...((archiveCatalog.regions as Record<string, string[] | undefined>)[birthRegionId] ?? [])
  ].map((sourceId) => sourceRecords.find((source) => source.id === sourceId)).filter((source): source is SourceRecord => Boolean(source));
  const regionGroups = Object.entries(regions.reduce<Record<string, typeof regions>>((groups, region) => {
    const countryId = region.countryId ?? "unknown";
    (groups[countryId] ??= []).push(region);
    return groups;
  }, {})).sort(([first], [second]) => {
    if (first === "russia") return -1;
    if (second === "russia") return 1;
    return (archiveCatalog.countries[first]?.label ?? first).localeCompare(archiveCatalog.countries[second]?.label ?? second, "ru");
  });

  return (
    <main id="main" className="start-shell">
      <section className="start-card" aria-labelledby="game-title">
        <p className="kicker">короткая история о долгой жизни</p>
        <h1 id="game-title">Бабушка</h1>
        <p className="lede">Вы решили поговорить с бабушкой о её жизни.</p>
        <p className="lede">Выберите место и год рождения или доверьте выбор случаю. Каждая история генерируется случайным образом, но исторический фон и события опираются на архивные данные.</p>

        {saved && (
          <button className="resume" type="button" onClick={() => void onStart(saved.selection)} data-testid="resume">
            Продолжить разговор <span>{saved.selection.birthYear} · {menuRegions(true).find((region) => region.id === saved.selection.birthRegionId)?.label}</span>
          </button>
        )}

        {error && <p className="load-error" role="alert">{error}</p>}
        <div className="picker-grid">
          <label>
            <span>Где она родилась?</span>
            <select value={birthRegionId} onChange={(event) => setBirthRegionId(event.target.value as RegionId)} disabled={loading}>
              {regionGroups.map(([countryId, countryRegions]) => (
                <optgroup key={countryId} label={archiveCatalog.countries[countryId]?.label ?? "Другие места"}>
                  {countryRegions.map((region) => <option key={region.id} value={region.id}>{region.label}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            <span>В каком году?</span>
            <select value={birthYear} onChange={(event) => setBirthYear(Number(event.target.value))} disabled={loading}>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        </div>
        <p className="coverage-note">{selectedRegion?.coverage}</p>
        <p className="interview-note">Год разговора: {interviewYear}. Бабушке {interviewYear - birthYear} лет.</p>
        <div className="start-actions">
          <button className="primary" type="button" onClick={() => void startSelection(birthRegionId, birthYear)} disabled={loading}>{loading ? "Загружаем местный пакет…" : "Начать с выбранными данными"}</button>
          <button className="secondary" type="button" onClick={startRandom} disabled={loading}>Случайная история</button>
        </div>
        <section className="archive-note" aria-labelledby="archive-note-title">
          <p className="archive-note-title" id="archive-note-title">История создается на основании архивов</p>
          <details className="archive-disclosure">
            <summary>Архивы и официальные источники: {selectedCountry?.label ?? "страна не указана"}</summary>
            <ul className="archive-links">
              {archiveSources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.publisher}: {source.title}</a>
                </li>
              ))}
            </ul>
          </details>
        </section>
        <section className="archive-note" aria-labelledby="memory-sources-title">
          <p className="archive-note-title" id="memory-sources-title">{memorySources.title}</p>
          <details className="archive-disclosure">
            <summary>{memorySources.summary}</summary>
            <p className="archive-text">{memorySources.intro}</p>
            <ul className="archive-links">
              {memorySources.sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.name}, {source.description}</a>
                </li>
              ))}
            </ul>
            <p className="archive-text">{memorySources.closing}</p>
          </details>
        </section>
      </section>
    </main>
  );
}

function Conversation({ state, onChange, onNew }: { state: GameSessionState; onChange: (next: GameSessionState) => void; onNew: () => void }) {
  const scene = currentScene(state);
  const recent = state.dialogue.transcript.length === 1 ? state.dialogue.transcript : state.dialogue.transcript.slice(-2);
  return (
    <main id="main" className="conversation-shell">
      <header className="conversation-header">
        <span>Бабушка</span>
        <button className="text-button" type="button" onClick={onNew}>Другая история</button>
      </header>
      <section className="conversation" aria-live="polite" aria-atomic="false">
        <div className="exchange" aria-label="Последний вопрос и ответ">
          {recent.map((line, index) => (
            <p className={line.speaker === "player" ? "player-question" : "grandmother-answer"} key={`${state.dialogue.step}-${index}-${line.text}`}>{line.text}</p>
          ))}
        </div>
        <div className="questions" role="group" aria-label="Что спросить">
          {scene.options.map((option) => (
            <button key={option.id} type="button" onClick={() => onChange(chooseOption(state, option.id))}>{option.text}</button>
          ))}
        </div>
      </section>
      <footer className="conversation-footer">Разговор сохраняется после каждого ответа</footer>
    </main>
  );
}

function AtlasMap({ state }: { state: GameSessionState }) {
  const { points: route, bounds } = atlasRoute(state);
  const polyline = route.map((point) => `${point.x},${point.y}`).join(" ");
  const lonLabel = (value: number) => `${Math.abs(Math.round(value))}° ${value < 0 ? "з." : "в."} д.`;
  const latLabel = (value: number) => `${Math.abs(Math.round(value))}° ${value < 0 ? "ю." : "с."} ш.`;
  return (
    <figure className="atlas-map">
      <figcaption>
        <span>Места жизни</span>
        <small>Схема: точки построены по координатам, прямые линии не означают точный путь.</small>
      </figcaption>
      <svg viewBox="0 0 600 310" role="img" aria-label={`Схема мест жизни: ${route.map((point) => point.name).join(", ")}`}>
        <g className="map-grid" aria-hidden="true">
          <rect x="30" y="40" width="540" height="230" />
          <line x1="210" y1="40" x2="210" y2="270" /><line x1="390" y1="40" x2="390" y2="270" />
          <line x1="30" y1="117" x2="570" y2="117" /><line x1="30" y1="194" x2="570" y2="194" />
          <text x="30" y="292">{lonLabel(bounds.minLon)}</text><text x="520" y="292">{lonLabel(bounds.maxLon)}</text>
          <text x="4" y="45">{latLabel(bounds.maxLat)}</text><text x="4" y="274">{latLabel(bounds.minLat)}</text>
        </g>
        {route.length > 1 && <polyline className="route-line" points={polyline} />}
        {route.map((point, index) => (
          <g key={`${point.placeId}-${point.fromYear}`} transform={`translate(${point.x} ${point.y})`}>
            <circle r="7" />
            <text x={index % 2 ? -10 : 10} y={index % 2 ? -14 : 22} textAnchor={index % 2 ? "end" : "start"}>{point.name}</text>
            <text className="map-year" x={index % 2 ? -10 : 10} y={index % 2 ? -1 : 38} textAnchor={index % 2 ? "end" : "start"}>{point.fromYear}–{point.toYear}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

function Atlas({ state, onNew }: { state: GameSessionState; onNew: () => void }) {
  const events = knownAtlasEvents(state);
  const gaps = unknownPeriods(state);
  const backdrop = historicalBackdrop(state);
  // The memory she holds dearest need not be the one that changed her life most.
  const dearest = state.memories.find((memory) => memory.recalled && memory.atlas?.personalSignificance === "central" && (memory.atlas.lifeImpact === "slight" || memory.atlas.lifeImpact === "notable"));
  const quiet = events.find((event) => event.id === dearest?.lifeEventId) ?? events.find((event) => event.salience === "quiet");
  const rows = [
    ...events.map((event) => ({ year: event.year, key: event.id, event, entry: null })),
    ...backdrop.map((entry) => ({ year: entry.year, key: entry.id, event: null, entry }))
  ].sort((a, b) => a.year - b.year || Number(Boolean(a.entry)) - Number(Boolean(b.entry)));
  const familyKnown = events.some((event) => event.id === "life:family-connection");
  return (
    <main id="main" className="atlas-shell">
      <header className="atlas-heading">
        <p className="kicker">после разговора</p>
        <h1>Её жизнь</h1>
        <p>Не вся, только та часть, которой она сегодня поделилась.</p>
      </header>

      <section className="relationship-summary" aria-labelledby="relationship-title">
        <p className="kicker">Кем вы друг другу</p>
        <h2 id="relationship-title">{state.biography.relationship.playerRelationLabel}</h2>
        <p>{state.biography.relationship.introduction}</p>
        <p>{familyKnown ? state.biography.relationship.childrenText : "О собственных детях она сегодня не рассказала."}</p>
      </section>

      <AtlasMap state={state} />

      <section className="timeline" aria-labelledby="timeline-title">
        <h2 id="timeline-title">Хронология</h2>
        <ol>
          {rows.map(({ key, event, entry }) => entry ? (
            <li key={key} className="event-backdrop">
              <div className="event-date"><strong>{entry.year}</strong><span>{entry.age === 0 ? "рождение" : `${entry.age} лет`}</span></div>
              <div>
                <p className="event-kind">фон эпохи · {entry.placeName}</p>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <p className="event-framing">{entry.placeOccupied ? "Её город в это время был под оккупацией. " : ""}Об этом она сегодня не рассказывала.</p>
                {entry.sourceIds.map((sourceId) => {
                  const source = sourceRecords.find((candidate) => candidate.id === sourceId);
                  return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">Источник: {source.publisher}</a> : null;
                })}
              </div>
            </li>
          ) : event && (
            <li key={key} className={`event-${event.salience}`}>
              <div className="event-date"><strong>{event.year}</strong><span>{event.age === 0 ? "рождение" : `${event.age} лет`}</span></div>
              <div>
                <p className="event-kind">{event.provenance === "VERIFIED_HISTORICAL" ? "исторический контекст" : event.salience === "quiet" ? "личная память" : "её жизнь"} · {event.placeName}</p>
                <h3>{event.title}</h3>
                <p>{event.text}</p>
                {laterInterpretation(state, event.id) && <p className="event-framing">Спустя годы: {laterInterpretation(state, event.id)}</p>}
                {event.historicalContextIds?.map((contextId) => {
                  const framing = events.find((candidate) => candidate.id === `context:world:${contextId}`);
                  return framing ? <p key={contextId} className="event-framing">Тогда же: {framing.title.toLocaleLowerCase("ru")}</p> : null;
                })}
                {event.sourceIds.map((sourceId) => {
                  const source = sourceRecords.find((candidate) => candidate.id === sourceId);
                  return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">Источник: {source.publisher}</a> : null;
                })}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="gaps" aria-labelledby="gaps-title">
        <h2 id="gaps-title">О чём она сегодня не рассказала</h2>
        <p>{gaps.length ? `Между известными эпизодами остаются годы: ${gaps.join(", ")}.` : "Даже между названными датами осталось многое, чего нет на этой странице."}</p>
      </section>

      {quiet && (
        <blockquote className="quiet-memory">
          <p>{quiet.text}</p>
          <footer>Почему-то именно это она вспомнила без подсказки.</footer>
        </blockquote>
      )}

      <section className="last-note">
        <p>На кухне щёлкает выключатель чайника. Разговор можно было продолжить, но на сегодня достаточно.</p>
        <button className="primary" type="button" onClick={onNew}>Послушать другую жизнь</button>
      </section>
    </main>
  );
}

export function App() {
  const [session, setSession] = useState<GameSessionState | null>(() => loadGame());
  const [showStart, setShowStart] = useState(() => !loadGame());
  const [historyReady, setHistoryReady] = useState(() => !loadGame());

  useEffect(() => {
    if (session) saveGame(session);
  }, [session]);

  // A resumed life needs its packs (IndexedDB or network) before the next answer picks historical background.
  useEffect(() => {
    if (historyReady || !session) return;
    void prepareHistory(session).finally(() => setHistoryReady(true));
  }, [historyReady, session]);

  const start = async (selection: StartSelection) => {
    const saved = loadGame();
    if (saved && saved.selection.runSeed === selection.runSeed) {
      await prepareHistory(saved);
      setSession(saved);
    } else {
      const pack = await loadRegionPack(selection.birthRegionId);
      const birthPlaces = pack.birthPlaces;
      await ensureWorldPacks(birthPlaces, selection.birthYear, selection.conversationYear);
      const generated = generateSession(selection, pack);
      await prepareHistory(generated);
      setSession(generated);
    }
    setHistoryReady(true);
    setShowStart(false);
  };

  const newStory = () => {
    clearSave();
    setSession(null);
    setShowStart(true);
  };

  const screen = useMemo(() => {
    if (showStart || !session) return <StartScreen onStart={start} />;
    if (!historyReady) return <main id="main" className="conversation-shell"><p className="grandmother-answer" role="status">Сейчас, только очки найду…</p></main>;
    if (session.screen === "atlas") return <Atlas state={session} onNew={newStory} />;
    return <Conversation state={session} onChange={setSession} onNew={newStory} />;
  }, [session, showStart, historyReady]);

  return (
    <>
      <a className="skip-link" href="#main">К содержанию</a>
      {screen}
    </>
  );
}
