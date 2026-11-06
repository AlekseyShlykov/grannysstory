/**
 * Granny's Story — приём прохождений в Google Таблицу (docs/analytics.md, docs/decisions.md D-031).
 *
 * Вставьте этот файл в Расширения → Apps Script таблицы и опубликуйте как веб-приложение
 * («Выполнять от имени: меня», «Доступ: все»). Игра отправляет одну строку, когда прохождение доходит до
 * очередного пятилетнего этапа, и одну, когда открывается финальный экран.
 *
 * Лист «Playthroughs» — все события подряд. Лист «Players» — сводка: один игрок, одна строка; обновляется при
 * каждом событии. Чтобы пересчитать сводку по уже накопленным событиям, выполните rebuildPlayers()
 * (или меню «Granny's Story» → «Пересчитать лист Players»).
 */

const SHEET_NAME = "Playthroughs";
const PLAYERS_SHEET_NAME = "Players";
// Earlier versions of this script used Russian sheet names; existing sheets are renamed, not duplicated.
const LEGACY_SHEET_NAMES = { Playthroughs: "Прохождения", Players: "Игроки" };

// [ключ в данных игры, заголовок столбца]
const COLUMNS = [
  ["receivedAt", "Получено"],
  ["clientTime", "Время у игрока"],
  ["sessionId", "Прохождение"],
  ["playerId", "Игрок"],
  ["event", "Событие"],
  ["stage", "Этап"],
  ["stagesTotal", "Всего этапов"],
  ["inGameYear", "Год в игре"],
  ["age", "Возраст героини"],
  ["finished", "Закончил"],
  ["language", "Язык"],
  ["birthRegionId", "Место рождения"],
  ["birthYear", "Год рождения"],
  ["datasetVersion", "Версия данных"]
];

// Сводка по игроку. Последние два столбца служебные (скрыты): списки его прохождений.
const PLAYER_COLUMNS = [
  ["playerId", "Игрок"],
  ["runs", "Прохождений"],
  ["finishedRuns", "Закончено прохождений"],
  ["lastSession", "Последнее прохождение"],
  ["stage", "Дошёл до этапа"],
  ["stagesTotal", "Всего этапов"],
  ["progress", "Пройдено"],
  ["inGameYear", "Год в игре"],
  ["age", "Возраст героини"],
  ["finishedLast", "Закончил последнее"],
  ["language", "Язык"],
  ["birthRegionId", "Место рождения"],
  ["birthYear", "Год рождения"],
  ["firstAt", "Первый раз"],
  ["lastAt", "Последний раз"],
  ["datasetVersion", "Версия данных"],
  ["sessions", "Все прохождения (служебное)"],
  ["finishedSessions", "Законченные прохождения (служебное)"]
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.event !== "stage" && data.event !== "finished") return text_("ignored");
    const row = COLUMNS.map(([key]) => (key === "receivedAt" ? new Date() : clean_(data[key])));
    sheet_().appendRow(row);
    updatePlayer_(eventFromRow_(row));
    return text_("ok");
  } catch (error) {
    return text_("error");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return text_("Granny's Story progress endpoint");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Granny's Story")
    .addItem("Пересчитать лист Players", "rebuildPlayers")
    .addToUi();
}

/** Пересчитывает лист «Players» целиком по листу «Playthroughs». */
function rebuildPlayers() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const events = sheet_();
    const rows = events.getLastRow() > 1 ? events.getRange(2, 1, events.getLastRow() - 1, COLUMNS.length).getValues() : [];
    const players = new Map();
    rows
      .map(eventFromRow_)
      .filter((event) => event.playerId && (event.event === "stage" || event.event === "finished"))
      .sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt))
      .forEach((event) => {
        const key = playerKey_(event);
        players.set(key, applyEvent_(players.get(key) || null, event));
      });
    const sheet = playersSheet_();
    if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, PLAYER_COLUMNS.length).clearContent();
    const output = [...players.values()].map(playerToRow_);
    if (output.length) sheet.getRange(2, 1, output.length, PLAYER_COLUMNS.length).setValues(output);
    formatPlayers_(sheet);
  } finally {
    lock.releaseLock();
  }
}

/** Обновляет или добавляет строку одного игрока. */
function updatePlayer_(event) {
  const sheet = playersSheet_();
  const key = playerKey_(event);
  const found = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 1)
    .createTextFinder(key)
    .matchEntireCell(true)
    .findNext();
  if (found && found.getRow() > 1) {
    const range = sheet.getRange(found.getRow(), 1, 1, PLAYER_COLUMNS.length);
    range.setValues([playerToRow_(applyEvent_(playerFromRow_(range.getValues()[0]), event))]);
  } else {
    sheet.appendRow(playerToRow_(applyEvent_(null, event)));
    formatPlayers_(sheet);
  }
}

/**
 * Одно событие в сводке игрока. Этап, язык и место рождения берутся из его последнего прохождения;
 * событие старого прохождения учитывается только в счётчиках.
 */
function applyEvent_(player, event) {
  const at = event.receivedAt instanceof Date ? event.receivedAt : new Date(event.receivedAt);
  const record = player || {
    playerId: playerKey_(event),
    sessions: [],
    finishedSessions: [],
    lastSession: "",
    stage: 0,
    firstAt: at,
    lastAt: at
  };
  const known = record.sessions.indexOf(event.sessionId) !== -1;
  if (!known) record.sessions.push(event.sessionId);
  if (event.event === "finished" && record.finishedSessions.indexOf(event.sessionId) === -1) record.finishedSessions.push(event.sessionId);
  if (at < record.firstAt) record.firstAt = at;
  if (at > record.lastAt) record.lastAt = at;

  const isLatestRun = event.sessionId === record.lastSession;
  if (!known || isLatestRun) {
    if (!isLatestRun) {
      record.lastSession = event.sessionId;
      record.stage = 0;
    }
    if (Number(event.stage) >= Number(record.stage)) {
      record.stage = Number(event.stage);
      record.stagesTotal = Number(event.stagesTotal);
      record.inGameYear = event.inGameYear;
      record.age = event.age;
    }
    record.language = event.language;
    record.birthRegionId = event.birthRegionId;
    record.birthYear = event.birthYear;
    record.datasetVersion = event.datasetVersion;
  }
  return record;
}

function playerToRow_(player) {
  const finishedLast = player.finishedSessions.indexOf(player.lastSession) !== -1;
  const values = {
    playerId: player.playerId,
    runs: player.sessions.length,
    finishedRuns: player.finishedSessions.length,
    lastSession: player.lastSession,
    stage: player.stage,
    stagesTotal: player.stagesTotal || "",
    progress: player.stagesTotal ? (finishedLast ? 1 : player.stage / player.stagesTotal) : "",
    inGameYear: player.inGameYear,
    age: player.age,
    finishedLast: finishedLast ? "да" : "нет",
    language: player.language,
    birthRegionId: player.birthRegionId,
    birthYear: player.birthYear,
    firstAt: player.firstAt,
    lastAt: player.lastAt,
    datasetVersion: player.datasetVersion,
    sessions: player.sessions.join(" "),
    finishedSessions: player.finishedSessions.join(" ")
  };
  return PLAYER_COLUMNS.map(([key]) => (values[key] === undefined ? "" : values[key]));
}

function playerFromRow_(row) {
  const values = {};
  PLAYER_COLUMNS.forEach(([key], index) => { values[key] = row[index]; });
  const list = (text) => String(text || "").split(" ").filter(Boolean);
  return {
    playerId: String(values.playerId),
    sessions: list(values.sessions),
    finishedSessions: list(values.finishedSessions),
    lastSession: String(values.lastSession || ""),
    stage: Number(values.stage) || 0,
    stagesTotal: Number(values.stagesTotal) || 0,
    inGameYear: values.inGameYear,
    age: values.age,
    language: values.language,
    birthRegionId: values.birthRegionId,
    birthYear: values.birthYear,
    firstAt: values.firstAt instanceof Date ? values.firstAt : new Date(values.firstAt),
    lastAt: values.lastAt instanceof Date ? values.lastAt : new Date(values.lastAt),
    datasetVersion: values.datasetVersion
  };
}

function eventFromRow_(row) {
  const event = {};
  COLUMNS.forEach(([key], index) => { event[key] = row[index]; });
  event.sessionId = String(event.sessionId);
  event.playerId = String(event.playerId);
  return event;
}

/** Без хранилища в браузере у игрока нет постоянного id: тогда каждое его прохождение считается отдельно. */
function playerKey_(event) {
  return event.playerId === "ephemeral" ? "ephemeral:" + event.sessionId : event.playerId;
}

/** Короткие значения; строки не могут начинаться с символов формулы. */
function clean_(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = String(value).slice(0, 100);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/** The sheet by its English name; a sheet with the earlier Russian name is renamed in place. */
function namedSheet_(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const existing = spreadsheet.getSheetByName(name);
  if (existing) return existing;
  const legacy = LEGACY_SHEET_NAMES[name] && spreadsheet.getSheetByName(LEGACY_SHEET_NAMES[name]);
  if (legacy) return legacy.setName(name);
  return spreadsheet.insertSheet(name);
}

function sheet_() {
  const sheet = namedSheet_(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, title]) => title));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function playersSheet_() {
  const sheet = namedSheet_(PLAYERS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PLAYER_COLUMNS.map(([, title]) => title));
    sheet.setFrozenRows(1);
    sheet.hideColumns(PLAYER_COLUMNS.length - 1, 2);
  }
  return sheet;
}

function formatPlayers_(sheet) {
  const column = (key) => PLAYER_COLUMNS.findIndex(([name]) => name === key) + 1;
  const rows = Math.max(sheet.getMaxRows() - 1, 1);
  sheet.getRange(2, column("progress"), rows, 1).setNumberFormat("0%");
  sheet.getRange(2, column("firstAt"), rows, 2).setNumberFormat("dd.mm.yyyy hh:mm");
}

function text_(message) {
  return ContentService.createTextOutput(message);
}
