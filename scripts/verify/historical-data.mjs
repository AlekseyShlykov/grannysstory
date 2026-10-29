import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "content", "historical");
const readJson = async (file) => JSON.parse(await readFile(path.join(dataDir, file), "utf8"));
const manifest = await readJson("manifest.json");
const sources = await readJson("sources.json");
const worldSources = JSON.parse(await readFile(path.join(root, "public", "data", "world", "sources.json"), "utf8"));
const places = await readJson("places.json");
const national = await readJson("national.json");
const archiveCatalog = await readJson("archiveCatalog.json");
const sourceIds = new Set([...sources.map((source) => source.id), ...(worldSources.sources ?? []).map((source) => source.id)]);
const placeIds = new Set(places.map((place) => place.id));
const errors = [];
const eventIds = new Set();

const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

for (const source of sources) {
  if (!source.id || !source.title || !source.publisher || !source.url || !source.accessedAt || !source.rightsStatus) {
    errors.push(`Неполная запись источника: ${source.id ?? "без id"}`);
  }
  try { new URL(source.url); } catch { errors.push(`Некорректный URL источника ${source.id}`); }
}

for (const [countryId, country] of Object.entries(archiveCatalog.countries ?? {})) {
  if (!country.label || !country.sourceIds?.length) errors.push(`У страны ${countryId} нет названия или списка источников`);
  for (const sourceId of country.sourceIds ?? []) if (!sourceIds.has(sourceId)) errors.push(`У страны ${countryId} неизвестный источник ${sourceId}`);
}

const manifestRegionIds = new Set(manifest.regions.map((region) => region.id));
for (const [regionId, archiveSourceIds] of Object.entries(archiveCatalog.regions ?? {})) {
  if (!manifestRegionIds.has(regionId)) errors.push(`В каталоге архивов неизвестный регион ${regionId}`);
  if (!Array.isArray(archiveSourceIds) || !archiveSourceIds.length) errors.push(`У региона ${regionId} нет списка источников`);
  for (const sourceId of archiveSourceIds ?? []) if (!sourceIds.has(sourceId)) errors.push(`У региона ${regionId} неизвестный источник ${sourceId}`);
}

for (const place of places) {
  if (!sourceIds.has(place.sourceId)) errors.push(`У места ${place.id} неизвестный источник`);
  if (!Number.isFinite(place.coordinates?.lat) || !Number.isFinite(place.coordinates?.lon)) errors.push(`У места ${place.id} нет координат`);
  const names = [...(place.names ?? [])].sort((a, b) => a.from - b.from);
  for (let index = 1; index < names.length; index += 1) {
    if (names[index - 1].to >= names[index].from) errors.push(`Пересечение периодов названий у ${place.id}`);
  }
}

for (const region of manifest.regions) {
  if (!region.countryId || !archiveCatalog.countries?.[region.countryId]) errors.push(`У региона ${region.id} нет страны с каталогом архивов`);
  if (!archiveCatalog.regions?.[region.id]?.length) errors.push(`У региона ${region.id} нет регионального списка архивов`);
  const pack = await readJson(region.pack);
  if (pack.regionId !== region.id) errors.push(`ID пакета ${region.pack} не совпадает с манифестом`);
  if (!pack.coverage || !pack.events?.length) errors.push(`Пакет ${region.id} не описывает покрытие или не содержит событий`);
  for (const birthPlace of pack.birthPlaces ?? []) if (!placeIds.has(birthPlace)) errors.push(`Неизвестное место рождения ${birthPlace}`);
  for (const event of pack.events ?? []) {
    if (eventIds.has(event.id)) errors.push(`Дублирующийся ID события ${event.id}`);
    eventIds.add(event.id);
    if (event.classification !== "VERIFIED_HISTORICAL") errors.push(`Опубликованное событие ${event.id} не VERIFIED_HISTORICAL`);
    if (event.verificationStatus !== "verified") errors.push(`Опубликованное событие ${event.id} не проверено`);
    if (!sourceIds.has(event.sourceId)) errors.push(`У события ${event.id} нет зарегистрированного источника`);
    if (!placeIds.has(event.locationId)) errors.push(`У события ${event.id} некорректная география`);
    if (!validDate(event.startDate) || !validDate(event.endDate) || event.startDate > event.endDate) errors.push(`У события ${event.id} некорректные даты`);
    if (!event.historicalContext || !event.applicability?.residentPlaceIds?.length) errors.push(`У события ${event.id} нет контекста или применимости`);
    for (const residentPlace of event.applicability?.residentPlaceIds ?? []) if (!placeIds.has(residentPlace)) errors.push(`У события ${event.id} неизвестное применимое место ${residentPlace}`);
    if ("probability" in event || "weight" in event) errors.push(`У события ${event.id} есть неподтверждённая вероятность`);
  }
}

if (national.version !== manifest.datasetVersion) errors.push("Версия общего исторического слоя не совпадает с манифестом");
if (national.classification !== "VERIFIED_HISTORICAL" || national.verificationStatus !== "verified") {
  errors.push("Общий исторический слой не помечен как проверенный");
}
for (const event of national.events ?? []) {
  if (eventIds.has(event.id)) errors.push(`Дублирующийся ID события ${event.id}`);
  eventIds.add(event.id);
  if (!sourceIds.has(event.sourceId)) errors.push(`У общего события ${event.id} нет зарегистрированного источника`);
  if (!validDate(event.startDate) || !validDate(event.endDate) || event.startDate > event.endDate) errors.push(`У общего события ${event.id} некорректные даты`);
  if (!event.title || !event.historicalContext) errors.push(`У общего события ${event.id} нет заголовка или контекста`);
  if (event.scale && !["major", "cultural", "everyday"].includes(event.scale)) errors.push(`У общего события ${event.id} неизвестный масштаб`);
}
if ((national.events ?? []).filter((event) => event.scale === "cultural" || event.scale === "everyday").length < 14) {
  errors.push("В историческом пуле недостаточно культурных и повседневных событий");
}

if (manifest.conversationYear !== 2026) errors.push("Текущий предельный год разговора не соответствует последнему решению");
if (manifest.allowedBirthYears.from !== 1900 || manifest.allowedBirthYears.to !== 1940) errors.push("Диапазон годов не соответствует уточнению меню");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${eventIds.size} historical events, ${places.length} places and ${sources.length} sources`);
}
