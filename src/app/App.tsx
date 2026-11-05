import { useEffect, useMemo, useRef, useState } from "react";
import archiveCatalogJson from "../../content/historical/archiveCatalog.json";
import sourcesJson from "../../content/historical/sources.json";
import memorySources from "../../content/memory/memorySources.json";
import { yearsCount } from "../../content/language/russian";
import worldSourcesJson from "../../public/data/world/sources.json";
import { ensureWorldPacks } from "../data/worldStore";
import { manifest } from "../data/world";
import { loadRegionPack } from "../data/regionStore";
import type { GameSessionState, RegionId, StartSelection } from "../data/types";
import { historicalBackdrop, knownAtlasEvents, laterInterpretation } from "../engine/atlas";
import { generateSession } from "../engine/biography";
import { chooseOption, currentScene } from "../engine/dialogue";
import { clearSave, loadGame, saveGame } from "../engine/persistence";
import { freshSeed } from "../engine/random";
import { allowedYears, interviewYearForBirthYear, menuRegions } from "../engine/setup";
import { storyAudio } from "./audio";
import { eventFeedbackId, loadEventVotes, recordEventVote, syncEventFeedback, type EventVote } from "./eventFeedback";
import { LifePathGraph } from "./LifePathGraph";
import { LifeReplay } from "./LifeReplay";

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

function SiteHeader({ onNew }: { onNew?: () => void }) {
  return (
    <header className="site-header">
      <span className="site-title">История бабушки</span>
      {onNew && <button className="text-button" type="button" onClick={onNew}>Другая история</button>}
    </header>
  );
}

function SiteFooter({ soundEnabled, onToggleSound }: { soundEnabled: boolean; onToggleSound: () => void }) {
  const soundLabel = soundEnabled ? "Выключить звук" : "Включить звук";
  const iconRoot = `${import.meta.env.BASE_URL}assets/icons/`;
  return (
    <footer className="site-footer">
      <button className="footer-icon-button" type="button" onClick={onToggleSound} aria-label={soundLabel} title={soundLabel}>
        <img src={`${iconRoot}${soundEnabled ? "sound-on.png" : "sound-off.png"}`} alt="" aria-hidden="true" />
      </button>
      <a className="footer-credit" href="https://buildtounderstand.dev/" target="_blank" rel="noreferrer">Created by Alex Shlykov</a>
      <a className="footer-mail-link" href="mailto:buildtounderstand@gmail.com" aria-label="Написать Алексу Шлыкову" title="Написать Алексу Шлыкову">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect x="4.5" y="7" width="23" height="18" rx="2" />
          <path d="M6 9l10 8 10-8M6 23l7.5-7M26 23l-7.5-7" />
        </svg>
      </a>
    </footer>
  );
}

function cryptoIndex(length: number): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return (value[0] ?? 0) % length;
}

function StartScreen({ onStart }: { onStart: (selection: StartSelection) => Promise<void> }) {
  const regions = menuRegions();
  const years = allowedYears();
  const [saved] = useState(() => loadGame());
  // Each visit opens on a different supported place and year, so the first choice already feels open.
  const [birthRegionId, setBirthRegionId] = useState<RegionId>(() => regions[cryptoIndex(regions.length)]!.id as RegionId);
  const [birthYear, setBirthYear] = useState(() => years[cryptoIndex(years.length)]!);
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
        <h1 id="game-title">История бабушки</h1>
        <p className="lede">Посмотрите на историю глазами простых людей. Каждая история генерируется случайным образом. Исторический фон и события опираются на архивные данные и воспоминания людей.</p>
        <p className="lede">Выберите место и год рождения или доверьте выбор случаю.</p>

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
        <div className="start-actions">
          <button className="primary" type="button" onClick={() => void startSelection(birthRegionId, birthYear)} disabled={loading}>{loading ? "Загружаем местный пакет…" : "Начать с выбранными данными"}</button>
          <button className="secondary" type="button" onClick={startRandom} disabled={loading}>Случайная история</button>
        </div>
        <footer className="start-footer">
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
        </footer>
      </section>
    </main>
  );
}

function Conversation({ state, onChange }: { state: GameSessionState; onChange: (next: GameSessionState) => void }) {
  const scene = currentScene(state);
  const recent = state.dialogue.transcript.length === 1 ? state.dialogue.transcript : state.dialogue.transcript.slice(-2);
  return (
    <main id="main" className="conversation-shell">
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
    </main>
  );
}

function EventVoteButtons({ eventId, title, value, onVote }: { eventId: string; title: string; value?: EventVote; onVote: (eventId: string, vote: EventVote) => void }) {
  return (
    <div className="event-vote" role="group" aria-label={`Оценить событие «${title}»`}>
      <button type="button" className={value === 1 ? "selected" : ""} aria-pressed={value === 1} aria-label={`Понравилось событие «${title}»`} title="Понравилось" onClick={() => onVote(eventId, 1)}>👍</button>
      <button type="button" className={value === -1 ? "selected" : ""} aria-pressed={value === -1} aria-label={`Не понравилось событие «${title}»`} title="Не понравилось" onClick={() => onVote(eventId, -1)}>👎</button>
    </div>
  );
}

function Atlas({ state, onNew }: { state: GameSessionState; onNew: () => void }) {
  const [shareMessage, setShareMessage] = useState("");
  const [eventVotes, setEventVotes] = useState<Record<string, EventVote>>(() => loadEventVotes());
  const events = knownAtlasEvents(state);
  const backdrop = historicalBackdrop(state);
  // The memory she holds dearest need not be the one that changed her life most.
  const dearest = state.memories.find((memory) => memory.recalled && memory.atlas?.personalSignificance === "central" && (memory.atlas.lifeImpact === "slight" || memory.atlas.lifeImpact === "notable"));
  const quiet = events.find((event) => event.id === dearest?.lifeEventId) ?? events.find((event) => event.salience === "quiet");
  const rows = [
    ...events.map((event) => ({ year: event.year, key: event.id, feedbackId: eventFeedbackId(event.id, event.title, event.text), event, entry: null })),
    ...backdrop.map((entry) => ({ year: entry.year, key: entry.id, feedbackId: eventFeedbackId(entry.id, entry.title, entry.summary), event: null, entry }))
  ].sort((a, b) => a.year - b.year || Number(Boolean(a.entry)) - Number(Boolean(b.entry)));

  useEffect(() => {
    void syncEventFeedback();
    const retry = () => void syncEventFeedback();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  const voteFor = (eventId: string, vote: EventVote) => {
    setEventVotes((current) => ({ ...current, [eventId]: vote }));
    recordEventVote(eventId, vote, state.selection.datasetVersion);
    void syncEventFeedback();
  };

  const shareGame = async () => {
    const url = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMessage("ссылка на игру добавлена в буфер обмена.");
        return;
      }
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = typeof document.execCommand === "function" && document.execCommand("copy");
      field.remove();
      setShareMessage(copied ? "ссылка на игру добавлена в буфер обмена." : "Не удалось скопировать ссылку.");
    } catch {
      setShareMessage("Не удалось скопировать ссылку.");
    }
  };

  return (
    <main id="main" className="atlas-shell">
      <LifeReplay state={state} />

      {quiet && (
        <blockquote className="quiet-memory">
          <p>{quiet.text}</p>
          <footer>Почему-то именно это она вспомнила без подсказки.</footer>
        </blockquote>
      )}

      <header className="atlas-heading">
        <h1>История бабушки</h1>
        <p>Вы можете помочь и улучшить эту игру. Если какое-то событие вам сильно запомнилось, поставьте палец вверх, а если какое-то показалось лишним, поставьте палец вниз.</p>
      </header>

      <section className="timeline" aria-labelledby="timeline-title">
        <h2 id="timeline-title">Хронология</h2>
        <ol>
          {rows.map(({ key, feedbackId, event, entry }) => entry ? (
            <li key={key} className="event-backdrop">
              <div className="event-date"><strong>{entry.year}</strong><span>{entry.age === 0 ? "рождение" : yearsCount(entry.age)}</span></div>
              <div>
                <div className="event-meta-row">
                  <p className="event-kind">Исторический контекст · {entry.placeName}</p>
                  <EventVoteButtons eventId={feedbackId} title={entry.title} value={eventVotes[feedbackId]} onVote={voteFor} />
                </div>
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
              <div className="event-date"><strong>{event.year}</strong><span>{event.age === 0 ? "рождение" : yearsCount(event.age)}</span></div>
              <div>
                <div className="event-meta-row">
                  <p className="event-kind">{event.provenance === "VERIFIED_HISTORICAL" ? "Исторический контекст" : "Личная жизнь"} · {event.placeName}</p>
                  <EventVoteButtons eventId={feedbackId} title={event.title} value={eventVotes[feedbackId]} onVote={voteFor} />
                </div>
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

      <LifePathGraph state={state} />

      <section className="last-note">
        <p>На кухне щёлкает выключатель чайника. Разговор можно было продолжить, но на сегодня достаточно.</p>
        <p className="feedback-note">Если хотите оставить фидбек или обратить внимание на неточность, пишите мне на <a href="mailto:buildtounderstand@gmail.com">buildtounderstand@gmail.com</a>.</p>
        <nav className="final-actions" aria-label="Действия и ссылки автора">
          <a className="secondary" href="https://buildtounderstand.dev/" target="_blank" rel="noreferrer">Другие мои игры</a>
          <a className="secondary" href="https://buildtounderstand.substack.com/" target="_blank" rel="noreferrer">Подписаться на мои обновления</a>
          <button className="secondary share-button" type="button" onClick={() => void shareGame()}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="1" /><path d="M16 8V5H5v11h3" /></svg>
            Поделиться игрой
          </button>
          <button className="primary" type="button" onClick={onNew}>Послушать другую жизнь</button>
        </nav>
        {shareMessage && <p className="share-status" role="status">{shareMessage}</p>}
      </section>

    </main>
  );
}

export function App() {
  const scrollViewport = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<GameSessionState | null>(() => loadGame());
  const [showStart, setShowStart] = useState(() => !loadGame());
  const [historyReady, setHistoryReady] = useState(() => !loadGame());
  const [soundEnabled, setSoundEnabled] = useState(() => storyAudio.isEnabled());

  useEffect(() => {
    if (session) saveGame(session);
  }, [session]);

  // A resumed life needs its packs (IndexedDB or network) before the next answer picks historical background.
  useEffect(() => {
    if (historyReady || !session) return;
    void prepareHistory(session).finally(() => setHistoryReady(true));
  }, [historyReady, session]);

  const start = async (selection: StartSelection) => {
    // Starts inside the click gesture; history loading continues independently while the tea cue plays.
    storyAudio.startIntro();
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
    if (scrollViewport.current) scrollViewport.current.scrollTop = 0;
  };

  const newStory = () => {
    clearSave();
    setSession(null);
    setShowStart(true);
    if (scrollViewport.current) scrollViewport.current.scrollTop = 0;
  };

  const changeSession = (next: GameSessionState) => {
    if (session) storyAudio.playStageTransition(session, next);
    setSession(next);
    if (scrollViewport.current) scrollViewport.current.scrollTop = 0;
  };

  const screen = useMemo(() => {
    if (showStart || !session) return <StartScreen onStart={start} />;
    if (!historyReady) return <main id="main" className="conversation-shell"><p className="grandmother-answer" role="status">Сейчас, только очки найду…</p></main>;
    if (session.screen === "atlas") return <Atlas state={session} onNew={newStory} />;
    return <Conversation state={session} onChange={changeSession} />;
  }, [session, showStart, historyReady]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">К содержанию</a>
      <SiteHeader onNew={!showStart && session ? newStory : undefined} />
      <div className="app-screen" ref={scrollViewport}>{screen}</div>
      <SiteFooter soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(storyAudio.toggle())} />
    </div>
  );
}
