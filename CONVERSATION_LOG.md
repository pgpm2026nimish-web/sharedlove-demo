# SharedLove build log

A chronological record of what was asked for and what was built, across the
full conversation that produced this prototype. For architecture, file map,
and how to run it, see [HANDOFF.md](HANDOFF.md) instead; this file is the
"what happened and why, in order" companion to that.

## 1. Project origin

Carried over from a prior Systems & Design Thinking course project
(Group C-3) for this SPJIMR Service Operations Management Mini Project.
Core thesis: fast fashion's environmental footprint keeps growing;
secondhand resale is the chosen circular-economy lever; the specific
adoption barrier is that a new garment carries an implicit quality
guarantee and a secondhand one, until now, carried that guarantee from no
one. Buyers can't verify condition before committing. Three mechanisms
address this: AI condition grading, a Verified-Seller badge, and
Try-Before-You-Thrift (open-box delivery with disputable grading).

## 2. Scaffolding the prototype

- Original source code was unavailable, so the app was rebuilt from scratch:
  Vite + React 19 + Tailwind v4, `HashRouter`, `lucide-react`, PWA support.
- Rebranded from an inherited rose/pink colour scheme to green/emerald,
  since there was no sustainability logic behind the original choice.
- Added a double-click Windows launcher (`Start SharedLove.bat`) and made
  the dev server reachable on the local network for phone testing.
- Added admin/user role separation behind a password gate (later reworked,
  see section 10).

## 3. UI passes benchmarked against real marketplaces

Multiple rounds of redesign using user-supplied screenshot PDFs (Myntra,
Vinted, ThredUp, Vestiaire Collective) as inspiration, never copied
directly:

- Left-sidebar multi-select filters (Myntra-style) replacing an earlier
  right-drawer chip design.
- Product card redesign: removed coloured avatar-initial circles, added
  MRP/discount pricing, fixed uneven card heights (root-caused twice: first
  the text block below the image, then the image container itself).
- Product detail page: size row, delivery pincode checker, trust bullets,
  similar and complementary product rows.
- Sell flow restructured into an info page before the listing form,
  synthesized from ThredUp's Sell/Clean-Out-Guide pages and Vestiaire's
  consignment pages.

## 4. Photo sourcing discipline

Established early and used throughout: download every candidate photo
locally and visually inspect it before using its URL, rather than trusting
a keyword search blindly (an early attempt with Picsum/LoremFlickr returned
irrelevant photos, including a "WASHING DONE" poster and a cat statue).
Two hard rules were set and enforced on every photo added to the app,
including much later in the conversation for the 50-product catalog:

1. No humans in frame: mannequins, hangers, and flat-lay only, and only
   headless/faceless forms, never a photo of someone wearing the item.
2. Exactly one garment per photo: never a rack, never a layered outfit.

Several early listing photos were replaced after violating these rules
(a sweater listing that turned out to show a full human model, product
shots with more than one garment in frame).

## 5. Core commerce features

- Full Sell flow: condition questionnaire, Trust & Provenance fields
  (cleaning method, reason for selling, brand-tag photo, smoke/pet-free
  home), AI-generated description, AI-suggested base price.
- Browse page with Myntra-style filters (gender, category, grade, price,
  discount, seller, colour, location) and sort options.
- Authentication: login, registration with separate "real name" (private)
  and "display name" (public) fields, Steam-style, password confirmation,
  profile page with password change.
- Wishlist/cart/checkout/selling gated behind login; browsing stays open.
- Rewards/impact system: points for buyer and seller per completed
  transaction, a tree "planted" per transaction, badges
  (Seed to Sprout to Sapling to Young Tree to Full-Grown Tree) with a
  share action, all surfaced on Home, About Us, and Profile.

## 6. Grading engine and AI provider abstraction

- Trust & Provenance signals folded into the actual grading formula, not
  just displayed. Confidence-weighted defect penalties (full weight above
  0.75 confidence, half weight 0.4-0.75, zero weight below 0.4).
- AI-suggested base price added as the chosen "further use of AI condition
  grade" option, plus an explicit seller-payout / buyer-shipping-fee
  breakdown that hadn't existed before.
- Provider abstraction (`src/lib/providers/`): Simulated, Ollama (local),
  Gemini, OpenAI, Claude, OpenRouter, each behind the same function
  signature, with a guaranteed fallback contract, any failure falls back
  silently to the Simulated engine with a visible reason shown to the user.
  The same pattern was replicated for AI description generation and AI
  price suggestion.
- Connected to a local Ollama install for real vision-model grading,
  diagnosed and fixed a settings-merge bug, a "model not found" typo bug
  (fixed by converting a free-text model field to a dropdown), and a
  crash in the Simulated fallback caused by missing arguments.

## 7. Simulated payments and payouts

- Buyers can save UPI/card payment methods (Profile page) and pick one, or
  add a new one, at checkout.
- Sellers set a payout destination (UPI or bank) the first time they list
  an item; it's then shown auto-filled on every later listing with a
  "Change" option, exactly as asked for.
- Everything here is explicitly simulated, no real gateway, masked/partial
  details only (last 4 digits of a card, never a full number).

## 8. Hosting guidance

- Explained the local-network booth setup (`--host`, `OLLAMA_ORIGINS=*`,
  QR code sharing) versus deploying properly online (static build to
  Netlify/Vercel/Cloudflare Pages/GitHub Pages, since the app has no
  backend at all).
- Diagnosed an iPhone "blank page" issue when scanning the booth QR code:
  root cause was Vite's stricter Host-header allowlist on newer versions
  silently refusing LAN-IP requests; fixed with `allowedHosts: true` in
  `vite.config.js`. Also documented the other likely culprits (iOS
  Safari's auto-HTTPS-upgrade setting, Windows Firewall prompts, wifi
  client isolation).
- Added a second launcher, `Start SharedLove (Presentation).bat`, that
  builds once and serves via `vite preview` instead of the live dev
  server, fewer moving parts (no HMR websocket) for the actual demo.
- Discussed, and deliberately did not build, a small local Node server to
  centrally collect visitor activity across devices on the same wifi: it
  would break the "no backend" simplicity, not survive a later static
  deploy, be a single point of failure during the demo, and have no auth.
  Chose the simpler alternative in section 11 instead.

## 9. Support chatbot ("Sprout")

- Added a floating chat widget, available on every page, backed by a small
  FAQ knowledge base (`src/lib/faq.js`) and the same AI-provider
  abstraction used for grading, so it can answer from a connected LLM
  (grounded on the FAQ facts) or fall back to a keyword-matched FAQ answer
  if nothing is configured or a call fails.
- Named "Sprout" to tie into the Seed to Full-Grown-Tree badge theme, and
  explicitly instructed (in its system prompt and every UI label) never to
  call itself a bot, AI, or chatbot, so it reads as part of the app rather
  than bolted-on support software.

## 10. Admin access reworked

- Removed the visible "Admin" link/icon from the header entirely.
- The regular Login page now doubles as the admin gate: entering `admin`
  as the identifier with the admin password logs into admin mode instead
  of attempting a normal account match; a wrong password shows the same
  generic error as any failed login, no distinct hint that it's a special
  path.
- Fixed a bug this introduced: the identifier field was still
  `type="email"`, so the browser's native validation blocked the literal
  string "admin" before the form could submit; changed to `type="text"`.
- Login then extended further so any account (not just admin) can sign in
  with either its email or its public display name, plus password.

## 11. 50-product catalog with multi-photo listings

- Grew the seed catalog from 9 to 51 listings across all 7 categories
  (Shirts, Trousers, Pyjamas, One Piece, Jackets, Sweaters, Dresses),
  specifically so Browse has enough volume to demonstrate every filter and
  sort option meaningfully.
- Sourced roughly 20 new, individually verified photos, mostly from a Dutch
  municipal museum's clothing-collection archive on Wikimedia Commons,
  which turned out to have far better single-garment studio photography
  (headless mannequins, plain backgrounds) than general keyword search.
  Several candidates were rejected for violating the two hard rules from
  section 4: skin-toned or face-bearing mannequins, or a second garment
  visible in the same frame (an outfit layered under the item being
  photographed).
- Two listings (a printed pyjama onesie and a belted trench coat) use two
  genuine photos of the same real object (front and back), to exercise the
  listing page's existing photo-gallery thumbnail strip.
- The remaining volume comes from documented "reposts": the same verified
  real photo reused under a different size, price, location, seller, and
  condition, the way several sellers on a real marketplace independently
  list a similar secondhand piece. This is stated in a code comment, not
  hidden.
- Added a result count to the Browse page header (e.g. "51 products", or
  "12 of 51 products" once filters are active).

## 12. Exit survey and admin activity log

- Clicking "log out" now shows a skippable "Before you go" modal asking
  for a five-star rating and an optional "How can we improve?" comment,
  before the logout actually happens.
- Built a simulated backend (`src/lib/activityLog.js`) that persists to
  this browser's local storage (unlike most of the app's state, which
  resets on refresh) and automatically logs three event types: every
  login, every completed purchase, and every exit-survey response.
- Added an Admin "Activity & feedback" page: summary stats (logins,
  purchases, survey count, average rating), a filterable event list,
  per-entry delete, a "Clear log" action, a CSV download, and a native
  device Share button (sends the CSV straight to a teammate via the
  share sheet, with a clipboard-copy fallback).
- Flagged clearly that this "backend" is still local storage scoped to one
  browser/device, not a real shared server, consistent with the rest of
  the app's persistence model, so it won't aggregate data from every
  visitor's own phone automatically.

## 13. App-wide share button

- Added a `Share2` icon to the header, visible to every user on every
  page, logged in or not: opens the native share sheet with a friendly
  message and the app's link (falls back to copying the link to the
  clipboard with a toast), so anyone who likes the app can pass it along
  to a friend. This is separate from the admin-only CSV-report share
  button added in section 12.

## Known trade-offs, stated plainly

- No real backend anywhere; every "persisted" thing (settings, theme,
  accounts, activity log) lives in this one browser's local/session
  storage. Listings, orders, cart, and points reset on page refresh unless
  explicitly noted otherwise.
- Payment and payout details are simulated, no real gateway is involved
  anywhere.
- The 50-product catalog intentionally reuses a smaller set of uniquely
  verified real photos across multiple listings (see section 11) rather
  than inventing photos that don't exist.
- The admin activity log and the exit survey are both local-storage-only;
  they demonstrate the concept but don't aggregate across devices without
  someone manually sharing/exporting the CSV.
