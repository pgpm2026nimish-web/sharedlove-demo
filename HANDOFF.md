# SharedLove: Development Handoff

This document summarizes everything built and decided in the build sessions so far, for
whoever picks this up next. It's a snapshot, not a spec: read it alongside the actual code,
which is the source of truth if anything here goes stale.

## 1. Project context

This is the working prototype for an SPJIMR Service Operations Management mini-project.
SharedLove is a secondhand clothing marketplace, carried over from an earlier Systems &
Design Thinking course project. The core thesis, from that earlier research:

- Fast fashion's environmental footprint keeps growing because efficiency gains increase
  volume rather than holding it steady.
- The chosen leverage point is **circular economy mechanisms** (resale), which don't depend
  on regulatory timelines.
- The specific adoption barrier ("aware-but-untried" buyers): **a new garment carries an
  implicit quality guarantee; a secondhand one currently carries that guarantee from no one.**
  Buyers hesitate because they can't verify condition before committing.
- Three mechanisms address this: **AI condition grading**, a **Verified-Seller badge**, and
  **Try-Before-You-Thrift** (open-box inspection with courier present, disputable grading).

The full original research (market sizing, consumer psychology research, competitive
differentiation vs. ThredUp/Vestiaire/Vinted, the SOM assignment rubric itself) lives in
`../Assignment_and_SharedLove_Notes.md`, one level up from this project folder. Read that
first for the *why*; this document is the *what got built*.

## 2. Tech stack

- **Vite + React 19** (JavaScript, not TypeScript), **Tailwind CSS v4**
- **react-router-dom** with `HashRouter` (chosen so the app works from a static file host or
  `file://` without server rewrite rules)
- **lucide-react** for icons
- **No backend.** All app state lives in one React Context (`AppContext.jsx`), in memory.
  A handful of things persist across a refresh via `localStorage`/`sessionStorage` (see
  §6); everything else (listings you create, cart, orders, points) resets on reload.
- Built as a **PWA** (installable via "Add to Home Screen") via `vite-plugin-pwa`.

## 3. Running it

```
npm install
npm run dev
```

Or double-click **`Start SharedLove.bat`** in this folder: installs dependencies on first
run, starts the dev server with `--host` (so it's reachable from other devices on the same
wifi/hotspot), and opens it in your browser. Useful for a booth demo: find this machine's
local IP with `ipconfig`, share `http://<that-ip>:5173` (or the QR code, if one was
generated: see chat history), and anyone on the same network can open and install it.

**Deploying a public link:** `npm run build`, then drag the `dist/` folder onto
https://app.netlify.com/drop for an instant URL, no login needed.

## 4. Demo credentials

- **Admin** (Settings/grading-provider config): password **`admin`** (set in `src/lib/auth.js`)
- **Demo buyer account:** `buyer@demo.com` / `1111`
- **Demo seller account:** `seller@demo.com` / `2222`

All client-side-only checks, no real security: fine for a demo, not for anything beyond it.

## 5. File map

```
src/
  App.jsx                 route table
  main.jsx                entry point, wraps App in HashRouter + AppProvider
  context/AppContext.jsx  all app state: listings, orders, cart, wishlist, users/auth,
                           points/impact, settings, theme, admin
  components/
    Layout.jsx             header (search, nav, wishlist/cart icons, theme toggle, user menu)
                            + responsive nav (desktop top bar / mobile bottom tabs) + Footer
    Footer.jsx
    ListingCard.jsx         the product card used everywhere (Browse, Home rows, Wishlist,
                            Similar/Complementary products)
    FilterSidebar.jsx       generic multi-select filter sidebar (Browse page)
    GradeBadge.jsx          the A/B/C grade pill
    SizeGuideModal.jsx
    DeliveryCheck.jsx       pincode → estimated delivery date (demo logic, not a real API)
  pages/
    Home.jsx                split hero (buyer/seller), category tiles, trending/new arrivals,
                            rewards callout, testimonials carousel, trust section
    Browse.jsx              filterable/sortable grid
    ListingDetail.jsx       product page: gallery, price/discount, size, trust bullets,
                            provenance, "why this grade", similar + complementary products
    SellInfo.jsx             /sell: info page (why sell, how it works, FAQ) before the form
    SellForm.jsx             /sell/list: the actual listing form (gated: must be logged in)
    Cart.jsx, MyOrders.jsx, Wishlist.jsx
    OpenBox.jsx              delivery/inspection/accept/dispute flow
    Login.jsx, Register.jsx, Profile.jsx
    Admin.jsx, AdminLogin.jsx
    AboutUs.jsx, HowItWorks.jsx, ContactUs.jsx
  lib/
    scoring.js               the grading formula (questionnaire + provenance + AI defects → score/price)
    categories.js, sizes.js, attributes.js  taxonomy constants (genders, categories, sizes,
                            colors, locations, price/discount buckets, grades)
    provenance.js            cleaning-method / sell-reason option lists
    pricing.js                platform fee + shipping fee constants and payout math
    impact.js                 points/trees/waste-reduced stats
    badges.js                 badge tiers (Seed → Sprout → Sapling → Young Tree → Full-Grown Tree)
    fakeStats.js              deterministic pseudo-random social-proof numbers (likes, seller stats)
    seed.js                   the 6 seed listings shown on first load
    sellerNames.js             whimsical seller-handle pool (unused now that real accounts exist
                            for new listings, but seed listings still use these names)
    users.js                   the 2 seed demo accounts
    auth.js                    admin password
    providers/
      index.js                 provider registry + runGrading() dispatcher (the fallback contract)
      shared.js                 shared prompts + response-parsing helpers
      simulated.js, gemini.js, openai.js, claude.js, ollama.js, openrouter.js
                                 one grading implementation per provider
      describe.js                AI description generation (same provider pattern)
      suggestPrice.js             AI base-price suggestion (same provider pattern)
```

## 6. What persists vs. what doesn't

- **Persists across refresh** (via `localStorage`): grading-provider settings, theme
  (light/dark)
- **Persists for the current browser tab only** (`sessionStorage`): admin unlock, logged-in
  user session
- **Resets on every refresh:** listings you create, cart, wishlist, orders, points,
  impact events, registered accounts you create at runtime. This is a known, deliberate
  simplification (no backend): flag it if it surprises anyone testing the app.

## 7. The grading pipeline (core mechanic)

Two inputs combine into one score, in `src/lib/scoring.js`:

1. **Seller questionnaire**: stains, tears, fading, stitching, pilling, tags attached;
   each answer has a fixed penalty.
2. **AI-detected defects from photos**: whichever provider is selected in Settings looks at
   the photos and returns `[{label, severity, confidence, imageIndex, xPct, yPct}, ...]`.
   Each defect's penalty is **scaled by the AI's own confidence** (full weight above 0.75,
   half weight 0.4–0.75, zero weight below 0.4: a low-confidence guess can't hurt the score).
3. **Trust & Provenance signals** also feed in as penalties: no cleaning disclosed, no
   brand-tag photo, not a smoke-free/pet-free home. `sellReason` is deliberately excluded;
   it's context, not a condition/trust signal.

```
score = clamp(100 - totalPenalty, 0, 100)
letter = A (≥80) / B (≥55) / C (<55)
price  = basePrice × (score / 100)
```

That `price` formula is also what powers the "MRP struck-through → X% off" display on every
card: the discount is literally `100 - score`, not a marketing number.

### Provider system & fallback contract

`src/lib/providers/index.js` exports `PROVIDERS` (Simulated / Ollama / Gemini / OpenAI /
Claude / OpenRouter) and `runGrading()`. **Every** AI call in the app: grading, description
generation (`describe.js`), price suggestion (`suggestPrice.js`): follows the same pattern:
try the selected provider, and on *any* failure (no key, offline, malformed response),
silently fall back to the Simulated engine and surface *why* it fell back to the user. This
means switching providers, or a provider going down mid-demo, can never leave the UI stuck.

**Simulated** is the default and recommended provider for live demos: no API key, no rate
limit, can't fail. **Ollama** (local vision model, e.g. `llava`) was set up and verified
working in this environment: see chat history for the exact setup steps (`OLLAMA_ORIGINS=*`
for CORS, the model must be pulled first, the endpoint must be the presenter's LAN IP if
other devices need to reach it). Gemini/OpenAI/Claude/OpenRouter are wired in but untested
without real API keys.

## 8. Feature inventory

**Browsing & discovery**
- Homepage: split hero (buyer story / seller story, each with a real, human-free,
  freely-licensed photo from Wikimedia Commons: do not use Picsum/LoremFlickr, they return
  irrelevant random images), gender category tiles, Trending Now / New Arrivals rows,
  rewards callout, auto-rotating buyer+seller testimonials, trust bullets.
- Browse page: Myntra-style **left-sidebar multi-select filters** (Gender, Category, Grade,
  Price, Discount, Brand/Seller, Colour, Location) + a **sort dropdown** (Relevance,
  Popularity, Latest, Grade, Price). All filter state lives in the URL (shareable/bookmarkable).
- Search bar in the header, right-aligned (not centered).
- Product cards: fixed-pixel-height images (not `aspect-square`: that let some photos
  render taller than others), grade badge on the image, MRP/discount pricing, wishlist heart.

**Product page**
- Photo gallery, size row (all sizes shown, only the listing's actual size enabled: each
  listing is one unique physical item, not stock-per-size), size guide modal.
- Price + discount breakdown, seller-attested Trust & Provenance block, full "why this
  grade" transparency (questionnaire + provenance + AI defects, each with its penalty).
- Delivery-date-by-pincode checker (demo logic).
- Trust bullets including explicit "Try & Buy" and "no returns after acceptance" messaging.
- Similar products (same category) + Complementary products ("Complete the look": same
  gender, different category) rows.

**Selling**
- `/sell` is an **info page** (why sell, how it works, what's accepted, FAQ) shown before
  the actual form at `/sell/list`: not skipped straight to the form.
- The form: title, **AI-generated description** (button, from photos; always lands in the
  editable textarea for seller review before publishing, never auto-publishes), gender/
  category/size/colour/location, **AI-suggested base price** (button, from photos), full
  condition questionnaire, Trust & Provenance fields (cleaning method, sell reason, optional
  brand-tag photo, smoke-free/pet-free toggles), grading, and a **seller payout breakdown**
  (sale price → platform fee → what you actually receive) before publishing.
- Requires login; shows a login prompt if not signed in.

**Cart & orders**
- Cart: itemized Subtotal → Shipping & packing → Total, payment method selection
  (UPI/Card/COD: cosmetic only, no real payment integration), requires login to place order.
- Open-box flow: out-for-delivery → inspecting → accept/dispute. Disputes show both sides
  the original grading reasoning and offer full refund / partial refund / keep-as-is.
- On acceptance: both buyer and seller get a **"Thank you"** message, points, and a tree
  is logged as planted in both their names (see §9).

**Accounts**
- Register asks for **Real name** (private) and **Display name** (public, Steam-style)
  separately, plus password confirmation.
- Login/logout, per-tab session.
- **Profile page**: impact stats (points, trees, waste reduced, purchases/sales), badge
  grid, change-password form, recent activity log.
- Login is required (with a redirect back to where you were) for: wishlisting, adding to
  cart, checking out, and listing an item. Browsing itself stays open to everyone.
- Separate **Admin** gate (password, not a user account) for grading-provider Settings only.

**Rewards & impact** (`src/lib/impact.js`, `src/lib/badges.js`)
- Buyer earns 100 points and seller earns 10 points per completed (buyer-accepted) sale.
- One tree "planted" per completed transaction, credited to both parties.
- Badge tiers by total completed transactions (buying + selling): Seed (default, everyone
  starts here) → Sprout (1) → Sapling (3) → Young Tree (6) → Full-Grown Tree (10). Unearned
  badges shown greyed out with their unlock condition; earned ones in color with a checkmark.
- Share button on the profile page (native share sheet on mobile, clipboard fallback) with a
  pre-written impact message.
- Highlighted on Home and About Us, not just buried in the profile.

**Other**
- Dark/light mode toggle, persisted.
- Fully responsive: phone-shaped layout + bottom tab nav below `md`, real desktop website
  layout (top nav, wide grids, two-column product page) above it: one codebase, not two.
- Footer with About/How It Works/Contact/legal-style links.

## 9. Known gaps / placeholder economics: flag these explicitly if asked

Every one of these was a deliberate scope decision, documented as such in the code comments
at the point of use (grep for "placeholder", "illustrative", or "not a validated" if you
need to find them all):

- **Platform fee (10%) and flat shipping fee (₹49)** in `lib/pricing.js` are illustrative
  numbers, not a researched business model. This was flagged as a gap in the original
  project notes ("Viability/monetization gap"): the current numbers close the gap for the
  demo but should be revisited before anyone treats them as real.
- **Points are tracked but not yet redeemable**: the profile shows a balance, but nothing
  at checkout lets a buyer actually spend points against a purchase.
- **"Waste reduced" (~0.5kg per transaction)** is a placeholder estimate, not a measured or
  sourced figure.
- **Brand-tag/logo photo** only checks *presence* for the trust-score penalty; the AI does
  not actually inspect the tag image for authenticity yet (the original notes called for
  "AI-cross-checked" verification: that's a real next step, not done).
- **No real reviews per listing**: the testimonials on Home are homepage-level social
  proof, not attached to individual listings.
- **Dispute resolution is manual** (buyer/admin picks a radio button): no AI comparison of
  what the buyer actually received against the original grading photos.
- **Photo licensing**: hero/category images are real Wikimedia Commons photos (verified
  human-free, verified to actually match the subject), mostly CC BY / CC BY-SA, which
  technically require attribution for public use. No attribution/credits page exists yet.
- **No real backend/persistence**: see §6. Everything except settings/theme/session resets
  on refresh.
- Admin password and demo-account passwords are trivially readable in the JS bundle,
  acceptable for a demo, not real auth.

## 10. Suggested next steps

Roughly in order of "closes a flagged gap" vs. "net-new scope":

1. Points redemption at checkout (the reward loop is currently one-directional).
2. A real backend (even a lightweight one) so listings/orders/accounts survive a refresh:
   the single biggest limitation for anything beyond a live demo.
3. AI-assisted brand-tag verification (the "cross-checked" authenticity idea from the
   original research).
4. AI-assisted dispute resolution (buyer uploads what they received, compare against the
   original grading).
5. Real per-listing reviews.
6. Photo attribution/credits page for the Wikimedia Commons images.
7. Validate the platform-fee/shipping-fee numbers against something real, or at minimum
   keep the "not validated" disclosure visible wherever they're shown.
