# SURFBIT — Agent Rules

Rules for every AI agent (Codex, Claude Code, …) and human working in this
repo. Read this file fully before your first change.

## What this is

A pixel-art e-commerce site for a surf brand: users walk a character around a
beach town (Phaser), enter shops, inspect products placed in the world, and buy
them through a normal cart + checkout (React + commerce provider).

## Read before coding

| Doc | When |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | **Always.** It tells you what to build next and when it's done. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Before touching `src/game`, `src/state`, `src/commerce`, or adding routes. |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Before drawing sprites, choosing colors or building UI. |
| [docs/SCENES.md](docs/SCENES.md) + [docs/art-references/](docs/art-references/) | Before building or changing maps, buildings, props, characters or anything visual. The images are the visual target. |
| [docs/SPEC.md](docs/SPEC.md) | Product intent. The source of truth for *what*, not *how*. |

## Workflow

1. Take the **first unchecked step** in `docs/ROADMAP.md` whose dependencies
   are done. One roadmap step per change set. Don't build ahead.
2. Build it, meeting every **Accept** criterion.
3. Run `npm run check` (lint + typecheck + tests + build).
   It must pass before you hand the work back.
4. Tick the step in `ROADMAP.md`, add a Changelog line, update the ✅/🔲
   status in `ARCHITECTURE.md → Folder layout` if you added files.
5. **Do not commit, push, branch, stash or rewrite git history.** The owner
   commits every change themselves. Leave your work as uncommitted changes and
   end your reply with a suggested Conventional Commit message, scoped and
   referencing the step, e.g.
   `feat(world): 1.4 player movement and collision`,
   `fix(cart): clamp quantity to stock`, `docs: clarify map coordinates`.

If something in the docs is wrong or ambiguous, fix the doc as part of the same
change rather than silently doing something else. Deviations from the spec go in
`ARCHITECTURE.md → Decisions`.

### Git

Agents may use read-only git (`git status`, `git diff`, `git log`) to orient
themselves. Never run `git commit`, `git push`, `git checkout -b`, `git reset`,
`git stash`, `git rebase` or anything else that changes git state. If the tree
already has uncommitted changes when you start, stop and ask the owner before
building on top of them.

## Commands

```bash
npm run dev         # http://localhost:3000
npm run lint        # ESLint
npm run typecheck   # next typegen + tsc --noEmit
npm test            # Vitest unit tests
npm run build       # production build (prerender check)
npm run check       # lint + typecheck + tests + build
```

## Hard rules (architecture)

1. **Phaser is client-only.** Import it dynamically (`await import("phaser")`)
   inside an effect. Nothing under `src/game/**` except `bridge.ts` may be
   imported by Server Components or at module top level in `src/components/**`.
2. **React never imports Phaser; Phaser never renders DOM UI.** They talk only
   through Zustand stores (`src/state`) and `src/game/bridge.ts`.
3. **The world references products by handle only.** Never put titles, prices,
   stock or descriptions in map files. Tint colors for displays are fine.
4. **Commerce is server-only.** Only `src/commerce/index.ts` chooses the
   provider. Client code never calls a commerce API directly; checkout goes
   through `/api/checkout`, which re-prices on the server. Never trust client
   prices or quantities.
5. **Config over code.** Adding a shop, display, sign or NPC = editing a map
   definition. If you need to change a system to add content, generalise the
   system.
6. **No gameplay gates on purchasing.** Every product must stay reachable via
   `/shop` and `/products/[handle]` without the game.
7. **Secrets** live in `.env.local` (git-ignored). Only `NEXT_PUBLIC_*` vars may
   reach the client, and no tokens may be `NEXT_PUBLIC_*` except Shopify's
   public Storefront token.

## Hard rules (art & UI)

1. Colors come from `src/game/art/palette.ts` (game) and `--sb-*` tokens in
   `src/app/globals.css` (UI). **No ad-hoc hex values** in components or
   sprites. Need a new color? Add it to both files and to ART_DIRECTION.md.
2. 16 px tiles, 16×32 characters, outlines per ART_DIRECTION.md, integer
   zoom only, no rotating pixel sprites, no smoothing.
3. **Match the references.** Scenes must follow `docs/SCENES.md` and look like
   `docs/art-references/`. For visual steps, compare a screenshot with the
   reference and list the main differences in your summary. Never put a
   reference image into the game itself.
4. Pixel font (Press Start 2P) only for short labels; body, prices, forms and
   checkout use Inter.
5. Respect `prefersReducedMotion()` for every decorative animation.
6. Keyboard + touch must both work for every interaction.

## Code conventions

- TypeScript strict. No `any` (use `unknown` + narrowing). No `@ts-ignore`.
- Named exports, except where Next.js requires a default export
  (pages, layouts, route segment files) and map modules (`export default def`).
- Files: React components `PascalCase.tsx`; everything else `camelCase.ts`.
  Styles: co-located CSS Modules `Component.module.css`.
- Client Components start with `"use client"` and stay as small as possible;
  keep pages as Server Components that pass data down.
- Pure logic (map building, collision, cart math, money) lives in Phaser-free,
  React-free modules so it can be unit-tested.
- Game code: one system per file in `src/game/systems`; scenes orchestrate,
  systems do the work. Clean up timers/listeners on scene `shutdown`.
- Zustand from Phaser: `useX.getState()` / `useX.subscribe()`; never hooks.
- Money is always integer minor units (`Money.amount` in cents). Format only via
  `formatMoney`.
- Comments explain *why*, not *what*. Keep them short.
- Don't add dependencies without explaining why in your summary. Prefer
  the platform and what's already installed.

## Next.js version note

This project runs **Next.js 16** with `cacheComponents` and
`partialPrefetching` enabled. APIs differ from older versions (e.g. `params`
is a Promise, `PageProps<'/route'>` / `LayoutProps` helpers, Cache Components
rules for dynamic data). Check `node_modules/next/dist/docs/` before writing
routes, data fetching or caching code.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
