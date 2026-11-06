/**
 * Granny's Story — приём прохождений в Google Таблицу (docs/analytics.md, docs/decisions.md D-031).
 *
 * Вставьте этот файл в Расширения → Apps Script таблицы и опубликуйте как веб-приложение
 * («Выполнять от имени: меня», «Доступ: все»). Игра отправляет одну строку, когда прохождение доходит до
 * очередного пятилетнего этапа, и одну, когда открывается финальный экран.
 */

const SHEET_NAME = "Прохождения";

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

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.event !== "stage" && data.event !== "finished") return text_("ignored");
    const row = COLUMNS.map(([key]) => (key === "receivedAt" ? new Date() : clean_(data[key])));
    sheet_().appendRow(row);
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

/** Короткие значения; строки не могут начинаться с символов формулы. */
function clean_(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = String(value).slice(0, 100);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function sheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, title]) => title));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function text_(message) {
  return ContentService.createTextOutput(message);
}
