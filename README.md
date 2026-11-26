# SURFBIT

**More than a store. A world to explore.**

A pixel-art e-commerce site for a surf & lifestyle brand. Walk around a beach
town, step into the Boards, Wear and Gear shops, inspect products placed in the
world and check out with a normal, secure cart.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Phaser 3 · Zustand ·
mock commerce provider (Shopify Storefront planned) · Vercel.

## Getting started

Local checks require Node.js `^20.19.0`, `^22.12.0`, or `>=24.0.0`.

```bash
npm install
cp .env.example .env.local   # optional until Shopify is connected
npm run dev                  # http://localhost:3000
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
| [docs/SPEC.md](docs/SPEC.md) | Full product concept |

## Status

The foundation and test setup are complete. The next roadmap step is **1.2 map types, builder and the town map**.
