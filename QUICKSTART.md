# Quick Start

## Prereqs
- Node 18+, pnpm 8+, Chrome 120+

## Setup
```bash
pnpm install
pnpm build
```
Add icons: `extension/icons/icon16.png`, `icon48.png`, `icon128.png`.

## Load
1) Open `chrome://extensions`
2) Enable Developer mode
3) Load unpacked → select `dist/`

## Use
- Go to a docs page → click extension → Extract → Start Sprint

## Dev
```bash
pnpm dev:panel
pnpm dev:worker
```

## Troubleshoot
- Ensure icons exist
- Reload page and extension
- Check Errors in `chrome://extensions`

