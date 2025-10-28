# Architecture

## Overview
- MV3 extension with Side Panel (React + TS)
- Content extraction (Readability + fallback)
- On-device AI layer (Mock default, Chrome AI optional)
- Local persistence via `chrome.storage.local`

## Main Parts
- Service Worker: side panel options, message routing
- Content Script: clone DOM, extract, sanitize, chunk 3–8
- Side Panel (React): LessonPlan, SprintView, Timer, Quiz
- State: Zustand store for sprint, progress, notes, prefs
- AI: `mockProvider`, `chromeProvider` via `aiProvider`
- Export: Markdown with anchors

## Data Flow
1) Panel → extract request
2) Content script → `extractPage()` → PageExtraction
3) Store extraction → render Lesson Plan
4) Start sprint → objectives + explainer + quiz via AI
5) Timer and quiz → save progress → optional export

## Types
- PageExtraction: `{ pageUrl, pageTitle, chunks[] }`
- LessonChunk: `{ id, title, text, html?, codeBlocks[], anchors }`
- ProgressIndex: `{ [pageUrl]: { chunks, prefs, updatedAt } }`

## Security & A11y
- DOMPurify for all HTML
- Minimal permissions
- Keyboard/ARIA, reduced motion

## Extensibility (Hooks)
- P1: `chooseVisualTemplate`, `explainCode`, `adjustLevel`, `translate`
- P2: Cloud fallback, Sync/Telemetry (opt-in)

