# Link Cleaner Pro — Browser Extension

Cleans tracking garbage from URLs. One click.

[Chrome Web Store](https://chromewebstore.google.com/) — *coming soon*

## Features

- **Auto-clean on copy** — every URL you copy is stripped of tracking before it hits your clipboard
- **Right-click any link** — "Copy Clean Link" without opening the popup
- **Clean on click** — click a dirty link → auto-redirect to clean version
- **50+ trackers stripped** — utm_*, fbclid, gclid, ref, aff_id, srsltid, and more
- **Daily stats** — see how many URLs you cleaned and trackers blocked
- **Privacy first** — no data collection, no servers, everything runs locally

## 7-Day Free Trial

All Pro features are unlocked for 7 days after installation. After the trial, upgrade at **$4.99/year** via Stripe.

## Install from Chrome Web Store

1. Visit the [Chrome Web Store listing](#)
2. Click **Add to Chrome**
3. Start cleaning — no setup required

## Build from source (Developer Mode)

1. Download this repo as ZIP
2. Open **Chrome** → go to `chrome://extensions`
3. Toggle **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `link-cleaner` folder

## Files

- `manifest.json` — extension config (v3)
- `popup.html` — the popup UI
- `popup.js` — tracking param stripper + trial/license logic
- `background.js` — service worker for context menus + notifications
- `content.js` — auto-clean on copy + clean on click
- `PRIVACY.md` — privacy policy (no data collection)
- `icon16/48/128.png` — extension icons
