# SOFT//ARCANA

A mobile-first personal tarot interpretation app built for a private, evolving practice.

## What is in v0.2

- All **78 Rider-Waite-Smith-style card names** with concise upright and reversed reference meanings.
- Personal upright, reversed, and freeform notes for every card.
- Random readings with optional reversals.
- Common spreads: single card, 2-card Situation/Response, three different 3-card spreads, Five-Card Cross, and Celtic Cross.
- Persistent custom meanings for any **2-card or 3-card combination** as soon as that combination appears.
- A local "standard synthesis" for multi-card readings built from the component card meanings. It is intentionally not a claim that 79,000+ pair/triple combinations have one universal canonical meaning.
- Reading archive.
- JSON export/import so personal interpretations can be backed up and moved to another phone.
- Installable web-app manifest and lightweight service worker.
- GitHub Pages deployment workflow.

## Aesthetic direction

The shell is Y2K-futurist: translucent interface glass, chrome controls, orbital UI, data labels, pale aqua and steel.

The card faces lean **Gen X Soft Club**: subdued blue/green/grey/beige palettes, soft urban-futurist geometry, transit-interface typography, bloom/blur atmosphere, and minimal vector symbolism. The current card art is procedural CSS rather than finished illustration, which makes it easy to replace with a full bespoke deck later.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Vite writes the production site to `dist/`.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Add these files and push them to the `main` branch.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will build and publish on every push to `main`.

Because the app uses no URL router and Vite uses a relative asset base, it works from a normal GitHub Pages project subdirectory.

## Important data note

Personal meanings currently live in the browser's `localStorage`. That keeps the first version private and backend-free, but deleting browser data can erase the notebook. Use **Archive → Export JSON** for backups. A later version can add login/sync (Supabase, Firebase, etc.) if desired.

## Suggested next passes

- Replace procedural card faces with 78 custom Gen X Soft Club illustrations.
- Add a "question" field before a reading.
- Add editable user-created spreads.
- Add tagging and search across personal interpretations.
- Add optional cloud sync for wife-only access across devices.
- Add richer hand-authored standard interpretations for important card pairs/triples instead of only the local synthesis engine.


## New in v0.2

- Boot screen so the app feels like entering a strange little oracle program.
- Query input field before drawing.
- Faux scanning console during shuffling/drawing.
- Session report with protocol, dominant suit, Major Arcana count, anomaly note, and query status.
- Archive entries now also preserve the question/query text.
- Overall visual direction pushed darker, weirder, and more like a lost 2001 divination interface.
