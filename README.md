# Deutsche Lacrosse-Meisterschaft 2026 — Tournament Website

One-page website for the German Lacrosse Championship weekend in Tübingen
(July 25–26, 2026), hosted by TSG Tübingen.

The weekend combines three competitions, with the men's championship as the focus:

- **Herren-Meisterschaft (Final Four)** — semifinals, 3rd-place game and final, all on Saturday
- **Herren Play-Ins** — Stuttgart, Freiburg, München (round robin, 3 games)
- **Damen Play-Ins** — München, Heidelberg, Karlsruhe, Stuttgart (4 teams, 5 games)

## Structure

- `index.html` — the entire site: self-contained static HTML with inline CSS/JS
  (schedule filter + hero countdown), German-language, light/dark theme aware.
- `WhatsApp Image 2026-07-10 at 11.33.23 PM.jpeg` — the source gameplan the
  schedule was transcribed from.

## Development

No build step. Open `index.html` in a browser.

## Deployment

Static site — deploys to Vercel as-is (import the repo or run `vercel`);
no configuration required.
