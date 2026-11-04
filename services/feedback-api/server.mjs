import http from "node:http";
import { Pool } from "pg";

const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS
  ?? "https://buildtounderstand.dev,https://www.buildtounderstand.dev,https://alekseyshlykov.github.io,http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:4173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean));
const pool = new Pool({ connectionString: databaseUrl });

await pool.query(`
  CREATE TABLE IF NOT EXISTS event_feedback (
    voter_id VARCHAR(64) NOT NULL,
    event_id VARCHAR(220) NOT NULL,
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    dataset_version VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (voter_id, event_id)
  )
`);

function corsHeaders(origin) {
  return origin && allowedOrigins.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" }
    : {};
}

function reply(response, status, body = "", headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8_192) reject(new Error("body too large"));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin;
  const cors = corsHeaders(origin);
  if (origin && !allowedOrigins.has(origin)) return reply(response, 403, JSON.stringify({ error: "origin_not_allowed" }));
  if (request.method === "OPTIONS") return reply(response, 204, "", cors);
  if (request.method === "GET" && request.url === "/health") return reply(response, 200, JSON.stringify({ ok: true }), cors);
  if (request.method !== "POST" || request.url !== "/event-feedback") return reply(response, 404, JSON.stringify({ error: "not_found" }), cors);

  try {
    const input = await readJson(request);
    const valid = input && typeof input === "object"
      && typeof input.voterId === "string" && input.voterId.length >= 8 && input.voterId.length <= 64
      && typeof input.eventId === "string" && input.eventId.length >= 1 && input.eventId.length <= 220 && /^[a-z0-9:._-]+$/i.test(input.eventId)
      && (input.vote === 1 || input.vote === -1)
      && typeof input.datasetVersion === "string" && input.datasetVersion.length >= 1 && input.datasetVersion.length <= 100;
    if (!valid) return reply(response, 400, JSON.stringify({ error: "invalid_feedback" }), cors);
    await pool.query(
      `INSERT INTO event_feedback (voter_id, event_id, vote, dataset_version)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (voter_id, event_id) DO UPDATE
       SET vote = EXCLUDED.vote, dataset_version = EXCLUDED.dataset_version, updated_at = NOW()`,
      [input.voterId, input.eventId, input.vote, input.datasetVersion]
    );
    return reply(response, 204, "", cors);
  } catch {
    return reply(response, 400, JSON.stringify({ error: "invalid_request" }), cors);
  }
});

server.listen(port, "0.0.0.0");

const shutdown = async () => {
  server.close();
  await pool.end();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
