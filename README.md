# LearnMyWay

Chrome MV3 extension that turns documentation pages into micro-lessons and 10-minute focus sprints.

## Install

```bash
pnpm install
pnpm build
```
Load `dist/` in `chrome://extensions` (Developer mode → Load unpacked).

## Use

1) Open a docs page (MDN/React/Python).
2) Click the extension icon → "Extract Content".
3) Pick a chunk → Start Sprint.
4) Read explainer, answer 2 questions, take notes.
5) Export Markdown.

## Features (P0)

- Side Panel UI
- Content extraction & 3–8 chunking (H2/H3)
- Reading Mode (120–180w explainer)
- Logical Mode (2–3 objectives, 1 MCQ + 1 fill-in)
- 10:00 timer (start/pause/reset, auto-complete)
- Local persistence (progress, scores, notes)
- Markdown export with source anchors
- On-device; no remote storage (P0)
- A11y basics (keyboard, ARIA, reduced motion)

## Tech

- MV3 + Side Panel, TypeScript, React, Vite
- Zustand, DOMPurify, Mozilla Readability
- Vitest, ESLint, Prettier, Tailwind CSS

## Dev Scripts

```bash
pnpm dev:panel     # Side panel dev server
pnpm dev:worker    # Service worker watch
pnpm build         # Build all
pnpm test          # Unit tests
pnpm lint          # Lint
pnpm typecheck     # TS check
pnpm zip           # Pack zip
```

## AI Providers

- Default: Mock (deterministic, offline)
- Optional: Chrome built-in AI (if available)

## Roadmap

- P1: Visual Mode, Code Explain, Level, Bilingual
- P2: Video shorts, Cloud fallback (opt-in), Sync/Telemetry

## License

MIT

