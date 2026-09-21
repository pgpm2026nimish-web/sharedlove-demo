# SharedLove — demo prototype

A focused rebuild of the SharedLove customer story for the SOM presentation:
browse → seller lists an item with AI condition grading → buyer sees the
grade with visible reasoning → buys → open-box delivery → accept or dispute
with a tiered resolution.

Built as a PWA so anyone can install it on their phone from a link — no App
Store, no APK.

## Run locally

```
npm install
npm run dev
```

Open the printed `localhost` URL. On your phone, use `--host` to test over
your local network:

```
npm run dev -- --host
```

## Deploy so others can open it on their phones

Fastest path (no login, no CLI):

1. `npm run build` — produces a `dist/` folder.
2. Go to **https://app.netlify.com/drop** in your browser.
3. Drag the `dist/` folder onto the page. You get a public URL instantly.
4. Share that URL. On a phone, opening it and choosing **"Add to Home
   Screen"** (Safari: Share → Add to Home Screen; Chrome: menu → Install
   app / Add to Home screen) installs it as an app icon that opens
   full-screen, no browser bar.

Re-deploy after changes: `npm run build`, then drag `dist/` onto
https://app.netlify.com/drop again (or connect the folder to a Netlify site
for one-click redeploys if you want a stable URL that doesn't change each
time).

## Grading providers

Settings → grading provider. **Simulated** is the default and needs no API
key — this is what the demo should run on, since it has no rate limit and
can't fail live. Gemini / OpenAI / Claude are wired in as real vision-API
calls if you add a key in Settings, and every grading call automatically
falls back to the simulated engine if the live call fails — so switching
providers can never break the demo mid-presentation.

Note: API keys are stored only in the browser's local storage and sent
directly to that provider from the browser. Fine for a demo, not a pattern
to use in production.

## What this covers vs. the original SharedLove

This is the **focused flow** only — the customer story needed for the SOM
presentation (grading + open-box dispute), not a full marketplace clone
(no auth, no seller dashboard, no multi-category browse/search). State is
in-memory (React Context) plus `localStorage` for settings only — refreshing
the page resets listings/orders back to the seed data.
