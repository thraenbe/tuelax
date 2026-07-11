# Deutsche Lacrosse-Meisterschaft 2026 — Tournament Website

Website for the German Lacrosse Championship weekend in Tübingen
(July 25–26, 2026), hosted by TSG Tübingen — plus a score-entry interface
for `edit.tuelax.de` that automatically advances winners to the next round.

The weekend combines three competitions, with the men's championship as the focus:

- **Herren-Meisterschaft (Final Four)** — semifinals, 3rd-place game and final, all on Saturday
- **Herren Play-Ins** — Stuttgart, Freiburg, München (round robin, 3 games)
- **Damen Play-Ins** — München, Heidelberg, Karlsruhe, Stuttgart (4 teams, 5 games)

## Structure

- `index.html` — the public site (`tuelax.de`). Static German-language page with the
  Final Four bracket, a filterable color-coded schedule and the play-in formats.
  Polls `/api/scores` every 45 s and fills in results: scores appear in the bracket
  and schedule, semifinal winners move into the final (losers into the 3rd-place
  game), the Damen play-in pairings for games 3–5 resolve themselves, and a
  champion banner appears once the final is decided. Works without JavaScript
  as a plain schedule.
- `edit.html` — the score-entry tool (`edit.tuelax.de`). Password-protected form,
  one card per game; saving a result immediately shows the propagated pairings.
  Falls back to a clearly-labeled browser-local demo mode when the API is
  unreachable.
- `games.js` — shared game definitions and the winner/loser propagation logic.
- `api/scores.js` — Vercel serverless function. `GET` returns the score state,
  `POST` upserts one game's score (Bearer password auth, timing-safe compare).
  State lives in Upstash Redis under one key.
- `vercel.json` — host-based rewrite: `edit.tuelax.de` → `/edit.html`.
- `WhatsApp Image 2026-07-10 at 11.33.23 PM.jpeg` — the source gameplan the
  schedule was transcribed from.

## Deployment (Vercel)

1. Import the repo into Vercel (framework preset: **Other**, no build step).
2. **Storage**: add the **Upstash Redis** integration from the Vercel Marketplace
   (`vercel integration add upstash` or Dashboard → Storage). This auto-provisions
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (the `KV_REST_API_*`
   names also work).
3. **Auth**: set an `EDIT_PASSWORD` environment variable — this is the password
   scorekeepers type into the edit page. Without it, all writes are rejected.
4. **Domains**: assign both `tuelax.de` and `edit.tuelax.de` to the project.
   The rewrite in `vercel.json` serves the edit tool on the subdomain; both
   domains share the same deployment and API.

Until Redis/password are configured the site still works read-only and the
edit page explains what is missing.

## Local development

```
npm install
vercel dev
```

Then pull env vars with `vercel env pull` once storage is provisioned. Opening
`index.html` directly in a browser also works (static plan, no live scores);
`edit.html` without an API runs in demo mode (results stored in localStorage).

## How score propagation works

`games.js` models each knockout slot as `{ ref, take: 'winner' | 'loser', label }`.
A slot resolves once the referenced game has a non-tied score, following chains
recursively (e.g. Damen Spiel 5 ← loser of Spiel 3 ← winner of Spiel 1). Ties in
a feeder game block propagation and the edit page warns about them. Clearing a
result reverts everything that depended on it.
