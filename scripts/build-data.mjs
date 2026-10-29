import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "content", "historical");
const targetDir = path.join(root, "public", "data");
await mkdir(path.join(targetDir, "regions"), { recursive: true });

const manifestPath = path.join(sourceDir, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const checksums = {};

for (const region of manifest.regions) {
  const source = path.join(sourceDir, region.pack);
  const destination = path.join(targetDir, "regions", region.pack);
  const data = await readFile(source);
  checksums[region.id] = createHash("sha256").update(data).digest("hex");
  await cp(source, destination);
}

await cp(path.join(sourceDir, "places.json"), path.join(targetDir, "places.json"));
await cp(path.join(sourceDir, "national.json"), path.join(targetDir, "national.json"));
await cp(path.join(sourceDir, "sources.json"), path.join(targetDir, "sources.json"));
await cp(path.join(sourceDir, "archiveCatalog.json"), path.join(targetDir, "archiveCatalog.json"));
await writeFile(path.join(targetDir, "manifest.json"), `${JSON.stringify({ ...manifest, checksums }, null, 2)}\n`);
console.log(`Compiled ${manifest.regions.length} regional packs and the national timeline to public/data`);
