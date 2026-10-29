const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const branchChoice = process.argv[3] ?? "pathA";
const viewportWidth = Number(process.argv[4] ?? 1280);
const openingChoice = process.argv[5] ?? "object";
const startMode = process.argv[6] ?? "manual";
const selectedBirthYear = Number(process.argv[7] ?? 1927);
const selectedRegion = process.argv[8] ?? "tver";
const targets = await fetch("http://127.0.0.1:9222/json/list").then((response) => response.json());
const target = targets.find((candidate) => candidate.type === "page" && candidate.url.startsWith(baseUrl));
if (!target?.webSocketDebuggerUrl) throw new Error("Chrome page target not found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const waiter = pending.get(message.id);
  if (waiter) {
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  }
});

const call = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id;
  pending.set(callId, { resolve, reject });
  socket.send(JSON.stringify({ id: callId, method, params }));
});
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = (milliseconds = 120) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const waitFor = async (selector, timeout = 4000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await wait(80);
  }
  throw new Error(`Timed out waiting for ${selector}`);
};
const click = async (selector) => {
  await waitFor(selector);
  const clicked = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.click(); return true; })()`);
  if (!clicked) throw new Error(`Element not found: ${selector}`);
  await wait();
};

await call("Page.enable");
await call("Emulation.setDeviceMetricsOverride", { width: viewportWidth, height: viewportWidth <= 500 ? 844 : 900, deviceScaleFactor: 1, mobile: viewportWidth <= 500 });
await call("Page.navigate", { url: baseUrl });
await wait(1200);
await evaluate("localStorage.clear()");
await call("Page.reload", { ignoreCache: true });
await wait(1200);
const startSummary = await evaluate(`({
  selectors: document.querySelectorAll(".picker-grid select").length,
  hasRandom: Boolean([...document.querySelectorAll("button")].find((button) => button.textContent?.includes("Случайная история")))
})`);
if (startMode === "manual") {
  await evaluate(`(() => {
    const region = document.querySelectorAll(".picker-grid select")[0];
    const year = document.querySelectorAll(".picker-grid select")[1];
    region.value = ${JSON.stringify(selectedRegion)};
    region.dispatchEvent(new Event("change", { bubbles: true }));
    year.value = ${JSON.stringify(String(selectedBirthYear))};
    year.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
  await wait();
}
await click(startMode === "random" ? ".secondary" : ".primary");
await waitFor(".questions", 8000);
const conversationSummary = await evaluate(`({
  visibleLines: document.querySelectorAll(".exchange p").length,
  questions: document.querySelectorAll(".questions button").length,
  hasCommentaryLayer: Boolean(document.querySelector(".scene-text, .scene-eyebrow, .thread"))
})`);
let turns = 0;
while (turns < 30 && await evaluate('Boolean(document.querySelector(".questions"))')) {
  const questionCount = await evaluate('document.querySelectorAll(".questions button").length');
  const regularChoice = openingChoice === "place" ? 3 : openingChoice === "family" ? 2 : turns % 3 + 1;
  const choice = questionCount === 2
    ? branchChoice === "pathB" ? 2 : 1
    : Math.min(regularChoice, questionCount);
  await click(`.questions button:nth-child(${choice})`);
  turns += 1;
}

const summary = await evaluate(`({
  title: document.querySelector("h1")?.textContent,
  events: document.querySelectorAll(".timeline li").length,
  routePoints: document.querySelectorAll(".atlas-map circle").length,
  sourceLinks: document.querySelectorAll(".timeline a").length,
  relationship: document.querySelector(".relationship-summary h2")?.textContent,
  familyDetail: [...document.querySelectorAll(".relationship-summary p")].at(-1)?.textContent,
  years: [...document.querySelectorAll(".event-date strong")].map((node) => Number(node.textContent)),
  historicalTitles: [...document.querySelectorAll(".event-historical h3")].map((node) => node.textContent),
  hasQuietMemory: Boolean(document.querySelector(".quiet-memory")),
  bodyOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
})`);
socket.close();

summary.birthYear = Math.min(...summary.years);
summary.latestYear = Math.max(...summary.years);
summary.expectedLatestYear = Math.min(summary.birthYear + 100, 2026);

if (
  startSummary.selectors !== 2
  || !startSummary.hasRandom
  || conversationSummary.visibleLines !== 1
  || conversationSummary.questions < 2
  || conversationSummary.hasCommentaryLayer
  || turns <= 12
  || summary.title !== "Её жизнь"
  || summary.events < 5
  || !summary.hasQuietMemory
  || summary.latestYear !== summary.expectedLatestYear
  || summary.bodyOverflow
) {
  throw new Error(`Browser playthrough failed: ${JSON.stringify({ startSummary, conversationSummary, summary })}`);
}
console.log(JSON.stringify({ branchChoice, viewportWidth, openingChoice, startMode, startSummary, turns, conversationSummary, ...summary }));
