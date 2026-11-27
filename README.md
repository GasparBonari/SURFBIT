# SURFBIT

**More than a store. A world to explore.**

A pixel-art e-commerce site for a surf & lifestyle brand. Walk around a beach
town, step into Boards, Wear, Gear, Goods, the Workshop or the Beach Club,
inspect products in the world and place a demo order.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Phaser 3 · Zustand ·
mock commerce provider (demo catalog and checkout) · Vercel.

## Getting started

Local checks require Node.js `^20.19.0`, `^22.12.0`, or `>=24.0.0`.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3005
npm test                     # Vitest unit tests
npm run check                # lint + typecheck + tests + build
```

## Docs

| Doc | What's in it |
|---|---|
| [AGENTS.md](AGENTS.md) | Rules and workflow for contributors and AI agents |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Step-by-step build plan with acceptance criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, data flow, map format, decisions |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Palette, pixel rules, UI guidelines |
| [docs/SCENES.md](docs/SCENES.md) | Scene layouts, buildings, product placement, asset checklist |
| [docs/art-references/](docs/art-references/) | Visual target (concept art) |
| [docs/SPEC.md](docs/SPEC.md) | Full product concept |

## Status

All six shops are open in town. The in-game directory can take you to each
entrance or open its section of the online catalog at `/shop`.
