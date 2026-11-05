import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const roots = ["src", "content", "public/data/world"];
const exact = new Set();
const patterns = new Set();
const hasRussian = (value) => /[А-Яа-яЁё]/u.test(value);

function addExact(value) {
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (normalized && hasRussian(normalized)) exact.add(normalized);
}

function visitTs(file) {
  const source = fs.readFileSync(file, "utf8");
  const quoted = /(["'`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/gu;
  for (const match of source.matchAll(quoted)) {
    const quote = match[1];
    const value = match[2]
      .replace(/\\n/gu, "\n")
      .replace(/\\r/gu, "\r")
      .replace(/\\t/gu, "\t")
      .replace(/\\(["'`\\])/gu, "$1");
    if (quote === "`" && value.includes("${")) {
      let index = 0;
      const pattern = value.replace(/\$\{[^}]+\}/gu, () => `{{${index++}}}`);
      if (hasRussian(pattern)) patterns.add(pattern.replace(/\s+/gu, " ").trim());
    } else {
      addExact(value);
    }
  }
  for (const match of source.matchAll(/>([^<>{}]*[А-Яа-яЁё][^<>{}]*)</gu)) addExact(match[1]);
}

function visitJson(file) {
  const walk = (value) => {
    if (typeof value === "string") addExact(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(JSON.parse(fs.readFileSync(file, "utf8")));
}

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

for (const relative of roots) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) continue;
  for (const file of filesUnder(directory)) {
    if (/\.tsx?$/u.test(file)) visitTs(file);
    else if (file.endsWith(".json")) visitJson(file);
  }
}

process.stdout.write(JSON.stringify({ exact: [...exact].sort(), patterns: [...patterns].sort() }, null, 2));
