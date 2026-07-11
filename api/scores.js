import { Redis } from '@upstash/redis';
import { createHash, timingSafeEqual } from 'node:crypto';

const KEY = 'dlm2026:state';
const GAME_IDS = new Set([
  'hpi1', 'hf1', 'hf2', 'dpi1', 'hpi2', 'dpi2',
  'p3', 'finale', 'dpi3', 'dpi4', 'hpi3', 'dpi5',
]);

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) { return null; }
  return new Redis({ url, token });
}

function authorized(req) {
  const expected = process.env.EDIT_PASSWORD;
  if (!expected) { return false; }
  const header = req.headers.authorization || '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

const isValidScore = (n) => Number.isInteger(n) && n >= 0 && n <= 99;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const redis = getRedis();

  if (req.method === 'GET') {
    if (!redis) { return res.status(200).json({ configured: false, scores: {} }); }
    const state = (await redis.get(KEY)) || { scores: {} };
    return res.status(200).json({ configured: true, ...state });
  }

  if (req.method === 'POST') {
    if (!authorized(req)) {
      return res.status(401).json({ error: 'Passwort falsch – oder auf dem Server ist kein EDIT_PASSWORD gesetzt.' });
    }
    if (!redis) {
      return res.status(503).json({ error: 'Kein Speicher konfiguriert: Upstash-Redis-Integration im Vercel-Projekt hinzufügen.' });
    }
    const body = (typeof req.body === 'object' && req.body !== null) ? req.body : {};
    const { id, home, away } = body;
    if (!GAME_IDS.has(id)) {
      return res.status(400).json({ error: 'Unbekannte Spiel-ID.' });
    }
    const clearing = home === null && away === null;
    if (!clearing && (!isValidScore(home) || !isValidScore(away))) {
      return res.status(400).json({ error: 'Ein Ergebnis besteht aus zwei ganzen Zahlen von 0 bis 99.' });
    }
    const state = (await redis.get(KEY)) || { scores: {} };
    if (!state.scores) { state.scores = {}; }
    if (clearing) { delete state.scores[id]; } else { state.scores[id] = { home, away }; }
    state.updatedAt = new Date().toISOString();
    await redis.set(KEY, state);
    return res.status(200).json({ configured: true, ...state });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Methode nicht erlaubt.' });
}
