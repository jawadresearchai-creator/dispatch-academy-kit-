# Dispatch Academy — Product Specification

**Product:** a desktop learning-and-simulation app for carrier-side U.S. truck dispatch, built on the 11-handbook course “Truck Dispatch from Pakistan”.
**Primary user:** Jawad, a trainee dispatcher in Pakistan, working alone on his own computer (Windows desktop or laptop), mostly at night Pakistan time.
**Builder:** Google AI Studio (Build mode). The app must also run as a desktop app (Electron) and as an installable web app (PWA).
**Version of this spec:** 1.0 (October 2026)

> Read this whole file before writing any code. Build in the phases listed in `docs/PROMPTS.md`. Do not skip the content and data rules in section 3: they are what make this app trustworthy.

---

## 0. Table of contents

1. Vision and success criteria
2. Repository layout and the content pack
3. Content and accuracy rules (non-negotiable)
4. Technical architecture
5. Design system (look and feel)
6. App shell and navigation
7. Feature specifications (screens)
   - 7.1 Home / Dashboard
   - 7.2 Learn: Module Library and Page Reader
   - 7.3 AI Tutor (grounded)
   - 7.4 Quizzes, Module Checks and Flashcards
   - 7.5 Toolbox (calculators and references)
   - 7.6 Map and Geography Lab
   - 7.7 Hours-of-Service and Trip Planner
   - 7.8 Economics Lab
   - 7.9 Load Board Simulator
   - 7.10 Broker Vetting and Fraud Lab
   - 7.11 Document Lab
   - 7.12 Dispatch Board (load execution)
   - 7.13 Problems and Claims Simulator
   - 7.14 Role-play Studio (AI voice/text)
   - 7.15 Drill Studio (speaking practice)
   - 7.16 Week Simulation (capstone game)
   - 7.17 Progress, Readiness and Certificate
   - 7.18 Settings
8. Simulation engines (algorithms)
9. AI features: prompts, schemas and safety
10. Data model and persistence
11. Desktop and offline behaviour
12. Accessibility, performance and quality
13. Acceptance tests (definition of done)

---

## 1. Vision and success criteria

Dispatch Academy turns the course into a **place to practise the real job**. Reading is only the start: the learner should be able to search a realistic load board, do the money math, check hours of service, vet a broker, negotiate with an AI broker by voice, read real documents, run a load from rate con to invoice, handle problems, and finally run a full simulated week with three trucks.

The app is successful when:

1. Every page of all 11 handbooks can be read inside the app, with its diagrams and photos, and opened in the original PDF.
2. Every formula, number, rule and practice dataset in the course is usable interactively (calculators, simulators, exercises with feedback).
3. The learner can practise every speaking drill (1–12) and every role-play (18 defined, plus custom ones) with scoring and feedback.
4. The week simulation can be played end to end and produces a weekly KPI report and a readiness score.
5. Progress is saved locally and survives restarts; the learner can export/import it.
6. It looks like a professional training product: illustrated, clear, calm, consistent; never a bare demo.

Non-goals: real load-board integration, real broker contact, live market data feeds, multi-user accounts, payments.

---

## 2. Repository layout and the content pack

The repository already contains a content pack. **Do not delete or rename these files.** Read them at runtime (import JSON or fetch from `/content/...` after copying to `public/` — see 4.4).

```
/docs/SPEC.md                 ← this file
/docs/PROMPTS.md              ← phase-by-phase build prompts
/content/course.json          ← 11 modules + 292 pages (markdown + images), see 2.1
/content/modules/*.md         ← the same pages as one markdown file per module (for reading/search)
/content/quizzes.json         ← 128 module-check questions with model answers
/content/glossary.json        ← 230 glossary terms (term, definition, module)
/content/drills.json          ← speaking drills 1–12 with scripts
/content/roleplays.json       ← scoring rubric + 18 role-play definitions
/content/practice-data.json   ← all practice datasets (trucks, cost model, boards, plans, brokers, Load 2, real docs, simulation)
/content/cities.json          ← 103 freight cities (lat/lon, state, IANA time zone, DAT zone, tier) + DAT zone table
/content/document-hotspots.json ← clickable hotspots on 3 real documents (rate con, BOL, POD)
/public/assets/diagrams/<moduleId>/*.jpg ← all course diagrams (illustrations), referenced by course.json
/public/assets/photos/*.jpg   ← real photos and real document scans used in the course
/public/pdfs/*.pdf            ← the 11 original handbooks
```

### 2.1 `course.json` shape

```ts
type Course = {
  modules: {
    id: string;            // "m00-01", "m02" … "m11"
    title: string;
    pdf: string;           // "/pdfs/Module_7_Load_Economics_Lane_Planning_Handbook.pdf"
    pageCount: number;
    coverImage: string|null; // "/assets/photos/hero_dryvan.jpg"
    sections: { name: string; pageIds: string[] }[]; // "Introduction", "7.1", "7.2", …, "Practice & review"
  }[];
  pages: {
    id: string;            // "m07-p08" (page 8 of module 7 = page 8 of the PDF)
    module: string;
    page: number;          // PDF page number
    kicker: string;        // e.g. "Lesson 7.3 · Break-even"
    title: string;         // page heading
    images: string[];      // image paths used on the page (first may be a background photo)
    markdown: string;      // page content as GitHub-flavoured markdown
  }[];
};
```

Markdown conventions inside `pages[].markdown`:

- Callout boxes are blockquotes whose first line is `**[TYPE] Title**`, where TYPE is one of: `KEY RULE`, `WARNING / CORRECTION`, `SAY IT OUT LOUD`, `REAL-WORLD TIP`, `CHECKLIST`, `TRY IT`, `FACT`. Render these as styled callout cards (section 5.4), not as plain quotes.
- Images use absolute paths like `/assets/diagrams/m07/breakeven.jpg`.
- Tables are GFM tables.
- Cover and opener pages (page 1 and usually page 3 of each module) contain big display text; render them as hero cards using `images[0]` as the background photo.
- Some extraction artefacts exist (duplicated kicker/title lines, run-together words on cover pages). Clean them at render time: hide a first line that repeats the kicker or title.

### 2.2 Module list

| id | Title |
|---|---|
| m00-01 | Foundations: the U.S. freight ecosystem and your role (Modules 0 and 1 combined) |
| m02 | Equipment Mastery |
| m03 | Geography, Corridors and Time |
| m04 | Hours of Service, ELD and Feasibility |
| m05 | Carrier Onboarding and Documents |
| m06 | Load Board Mastery |
| m07 | Load Economics and Lane Planning |
| m08 | Broker Vetting, Fraud and Negotiation |
| m09 | Booking, Load Execution and Paperwork |
| m10 | Accessorials, Problems and Claims |
| m11 | Working from Pakistan and the Full Simulation |

---

## 3. Content and accuracy rules (non-negotiable)

1. **The course is the source of truth.** Lessons, rules, formulas and practice numbers come from `/content`. Do not invent regulations, numbers or company facts.
2. **Practice vs real.** Blue Line Transport, its trucks, drivers, brokers, loads, rate ranges and KPIs are fictional practice data. Label them “Practice data” wherever shown. The OMNITECH documents for load #12354 (rate con, BOL, POD) are real scans supplied by the user; label them “Real document”.
3. **Dated snapshots.** Diesel price (EIA, 28 Sep 2026: $6.382), DAT August 2026 averages, ATRI figures and CargoNet figures are snapshots. Always show the source and date, and let the user edit market inputs in Settings → Market inputs (defaults from `practice-data.json → marketSnapshots`).
4. **Carrier-side ethics everywhere.** The app must never teach or reward: brokering loads to other carriers, taking broker payments, sharing logins, misrepresenting identity, pushing drivers past hours-of-service limits, or ignoring fraud red flags. Simulations treat these as automatic fails.
5. **AI grounding.** AI features (tutor, quiz generation, grading, role-plays) must be given the relevant course pages as context and must cite page IDs (e.g. “m07-p08”). If something isn’t in the course, the AI says so and suggests checking the official source (FMCSA, eCFR, DAT/Truckstop help, EIA).
6. **Not legal or tax advice.** Show a small disclaimer on pages about law, claims, tax and payments (modules m05, m08, m10, m11).
7. **Time zones are computed, not hard-coded.** Use the IANA zones in `cities.json` and `Intl.DateTimeFormat` so U.S. daylight saving changes (e.g., 1 Nov 2026, 14 Mar 2027) are handled automatically. Pakistan is always `Asia/Karachi` (UTC+5, no DST).

---

## 4. Technical architecture

### 4.1 Stack

- **Frontend:** React + TypeScript (AI Studio default), Vite. Client-side routing (React Router, hash router so Electron `file://` works).
- **Styling:** Tailwind CSS (or CSS modules) with the tokens in section 5. Fonts bundled locally (`@fontsource/poppins`, `@fontsource/inter` optional) so the desktop app works offline.
- **State:** Zustand (or React context + reducers). **Persistence:** IndexedDB via Dexie (see section 10).
- **Markdown:** `react-markdown` + `remark-gfm`, custom renderers for callouts, images (lightbox), tables (sticky header, horizontal scroll).
- **Charts:** Recharts. **Maps:** `d3-geo`, `topojson-client`, `us-atlas` (offline US states topology). No map tiles required.
- **PDF:** open `/pdfs/*.pdf` in an in-app viewer (`<iframe src="/pdfs/x.pdf#page=N">` is acceptable; `react-pdf` preferred if it works in the preview).
- **Icons:** `lucide-react`. **Motion:** `framer-motion` (subtle).
- **AI:** `@google/genai` (Gemini). See 4.3.
- **Audio:** `MediaRecorder` for recording; transcription by sending audio to Gemini (works in Electron, unlike the Web Speech recognition API); text-to-speech with `window.speechSynthesis` (works offline in Electron) with an option to use a Gemini TTS model when online.

### 4.2 Folder structure (target)

```
src/
  app/            routes, layout, providers
  components/     ui kit (Button, Card, Callout, Pill, Stat, Table, Drawer, Modal, Tabs, Lightbox, EmptyState, Kbd)
  features/
    learn/        library, reader, search, notes, bookmarks
    tutor/        grounded chat
    quiz/         module checks, generated quizzes, flashcards (SRS)
    toolbox/      calculators and references
    map/          geography lab
    hos/          trip planner + ELD log grid
    economics/    cost/break-even/FSC/plans
    loadboard/    simulator, filters, results, load detail, load card
    vetting/      broker lab, fraud scenarios
    documents/    real docs with hotspots, rate con checker, BOL/POD compare, invoice builder
    dispatch/     dispatch board (execution pipeline)
    problems/     event simulator, detention/TONU/layover/lumper
    roleplay/     studio, chat, voice, scoring
    drills/       drill studio, phonetic + number trainers
    simulation/   week simulation game
    progress/     dashboard, readiness, certificate
    settings/
  engines/        pure TS: distance, timezones, hos, economics, loadgen, broker gen, detention, scoring helpers (unit-tested)
  data/           loaders for /content JSON (typed)
  ai/             aiClient, prompts, schemas
  db/             Dexie schema + repositories
  styles/
```

All engines in `src/engines` must be **pure functions with unit tests** (Vitest). Examples in section 8 are the test cases.

### 4.3 AI client (two transports)

Create `src/ai/aiClient.ts` with one interface and two transports:

1. **Server transport (default inside AI Studio / Cloud Run):** the client calls the app’s own server routes (`/api/ai/generate`, `/api/ai/chat`, `/api/ai/transcribe`); the server uses `GEMINI_API_KEY` (AI Studio injects it server-side). The key never reaches the browser.
2. **Direct transport (desktop/offline builds):** the user pastes their own Gemini API key in Settings → AI; it is stored locally (Electron: `safeStorage`-encrypted file; browser: IndexedDB) and calls go directly from the app with `@google/genai`. Show a clear note: “Personal use only. Never share an app build that contains your key.”

Transport is chosen automatically: if `/api/ai/health` responds, use the server; otherwise use direct mode if a key is saved; otherwise AI features show a friendly “AI is off” state and **all non-AI features keep working**.

Model choice lives in Settings (text fields with sensible defaults): a fast model for chat/role-plays/transcription (default: the current Gemini Flash model available in AI Studio) and a stronger model for grading and quiz generation (default: the current Gemini Pro model). Do not hard-code a model that may be retired; read from settings.

All AI calls: timeout, retry once, streaming for chat, JSON mode with response schemas for structured outputs (section 9), and graceful error messages.

### 4.4 Content loading

Copy `/content/*.json` into the bundle at build time (import JSON) or fetch from `public/content/` (copy the folder). Lazy-load `course.json` once and keep it in memory; build a search index (MiniSearch or Fuse.js) over page titles, kickers, markdown text and glossary terms on first load and cache it in IndexedDB.

---

## 5. Design system (look and feel)

The app should feel like the handbooks: **photo-led, diagram-rich, calm navy and amber**, generous spacing, rounded cards, strong typography.

### 5.1 Colour tokens

| Token | Hex | Use |
|---|---|---|
| ink | #0E1A2B | primary text, dark surfaces |
| navy | #13294B | headers, primary buttons, nav |
| amber | #F5A524 | accent, highlights, kickers on dark, focus ring |
| amberText | #C98500 | kicker text on light |
| teal | #0E9F9A | success-adjacent, “say it” callouts, good |
| red | #E5484D | warnings, errors, fraud, over limits |
| green | #22A35A | pass, book, within limits |
| purple | #7C5CC4 | practice/exercise accents |
| bg | #F3F5F8 | app background, light cards |
| pale (amber) | #FFF4DE | rule callouts |
| paleRed | #FDECEC | warning callouts |
| paleTeal | #E2F5F4 | say/fact callouts |
| muted | #5B6576 | secondary text |

Provide a **dark theme** (ink background, navy cards, same accents) and a light theme; follow system preference by default.

### 5.2 Typography

Poppins (headings 600–800, body 400–500). Sizes: display 40/48, h1 30, h2 22, h3 18, body 15–16, small 13. Kicker: 11–12 px, uppercase, letter-spacing 2px, amberText.

### 5.3 Components

Cards (radius 14 px, subtle shadow), Pills (`BOOK` green, `COUNTER/PLAN/CAUTION` amber, `PASS/REJECT/STOP` red), Stat tiles (big number + label + source line), Tables (navy header, zebra rows), Drawer (right side for details), Stepper, Tabs, Toasts, Empty states with an illustration (use course photos/diagrams), Skeleton loaders.

### 5.4 Callouts (from markdown)

| Tag | Icon | Background | Border |
|---|---|---|---|
| KEY RULE | lightbulb | pale | amber |
| WARNING / CORRECTION | alert-triangle | paleRed | red |
| SAY IT OUT LOUD | mic | paleTeal | teal — also shows a “Practise this” button that opens Drill Studio with the text |
| REAL-WORLD TIP | eye | bg | navy |
| CHECKLIST | clipboard-check | bg | navy — render list items as tickable checkboxes saved per page |
| TRY IT | pencil | #F1ECFB | purple — shows “Show answer” if the answer is in the module’s answer pages (link to page) |
| FACT | book | paleTeal | teal |

### 5.5 Illustration rules

- Every module card, lesson header and simulator uses imagery from `/public/assets` (photos and diagrams). Diagrams open in a zoomable lightbox (pinch/scroll zoom, pan, download).
- Simulators draw their own visuals with SVG: truck icons by equipment type, route lines on the US map, timelines, gauges, waterfall bars, document mock-ups. Keep them clean and labelled.
- Use the real document scans (rate con, BOL, POD) with clickable hotspots (`document-hotspots.json`).

---

## 6. App shell and navigation

- **Left sidebar** (collapsible): Home · Learn · Tutor · Practice (Quizzes, Flashcards, Drills, Role-plays) · Labs (Map, HOS, Economics, Load Board, Vetting, Documents, Dispatch Board, Problems) · Week Simulation · Toolbox · Progress · Settings.
- **Top bar:** global search (Ctrl+K command palette: pages, glossary terms, tools, role-plays), **dual clock** (PKT and a selectable U.S. zone, default ET, with live DST status, e.g. “ET (EDT, UTC−4) · PKT = ET + 9 h”), current streak, AI status dot.
- **Right “Study panel”** (toggle): notes for the current page, bookmarks, “Ask the tutor about this page”.
- Keyboard shortcuts: Ctrl+K search, ←/→ previous/next page in reader, N new note, / focus search, Esc close drawers.
- Breadcrumbs on every screen. Deep links for pages: `#/learn/m07/m07-p08`.
- First-run onboarding (3 screens): welcome + course map image (`/assets/diagrams/m11/coursemap.jpg`), set U.S. zone preference and daily study goal, optional AI key setup.

---

## 7. Feature specifications

### 7.1 Home / Dashboard

- Hero: “Continue where you left off” card (last page, with its first image as background) + big Resume button.
- Today panel: daily goal ring (pages/minutes), streak, due flashcards count, next recommended activity (from the readiness engine, 7.17).
- Course map: 11 module cards (cover photo, title, progress bar, quiz best score, drill/role-play badges).
- Quick tools row: Rate per mile, Break-even, Time converter, HOS check, Detention calculator.
- “Today in U.S. time” strip: what time it is in ET/CT/MT/PT and whether brokers are in business hours.

### 7.2 Learn: Module Library and Page Reader

**Library:** grid of modules (photo cards). Clicking opens the module overview: description, sections (from `sections`), page list with read status, estimated time, drills and role-plays belonging to the module, “Open original PDF”.

**Reader:**

- Shows one page at a time in a beautifully typeset column (max 820 px) with the page’s images rendered inline at full width and clickable.
- Header: kicker, title, page n of N, “Open in PDF (page N)”, bookmark, mark as understood (✓), confidence slider (1–3).
- Callouts rendered per 5.4; tables responsive; numbers in practice tables can be clicked to “Open in calculator” when they match a known formula (nice to have).
- Footer: previous/next, section navigation, “Quiz me on this page” (AI, 7.4), “Explain simpler” and “Explain in Urdu/Roman Urdu” (AI, 7.3), “Practise this” when the page contains a SAY IT OUT LOUD callout.
- Notes: markdown notes per page, with highlights (select text → highlight colour → saved). Notes page lists all notes with links.
- Reading progress: a page counts as read after 20 seconds of visibility and scrolling to the end; module progress = read pages / total.
- Search results deep-link to the page with the matching text highlighted.

### 7.3 AI Tutor (grounded)

- Chat screen + side-panel mini chat on every page.
- **Retrieval:** for each question, select up to 6 relevant pages (search index score + current page + same section) and send their markdown (trimmed to ~2,500 characters each) as context, plus the glossary entries that match terms in the question.
- **Answer format:** short direct answer first, then explanation, then “Sources: m07-p08, m07-p09” as clickable chips that open the page.
- Modes (toggle): Explain · Simplify · Example with Truck 12 · Quiz me · Urdu/Roman Urdu explanation (keep technical terms in English).
- Must refuse to invent facts outside the course and must keep carrier-side ethics (section 3).
- Conversation history saved per topic; “Clear chat”.

### 7.4 Quizzes, Module Checks and Flashcards

**Module checks (static):** from `quizzes.json` (128 questions across 11 checks). The learner types an answer; then sees the model answer and self-grades (Correct / Partly / Wrong). If AI is on, offer “Grade my answer” (AI compares to the model answer and returns score 0–2 + feedback, schema in 9.3). Store attempts and best scores.

**Generated quizzes (AI):** for a page, section or module, generate 5–10 questions (multiple choice, true/false, numeric calculation, scenario) strictly from the selected pages, with the correct answer, explanation and source page ID. Numeric questions use the course formulas and must be verified by the app’s own engine before display (recompute; if the AI’s number differs by more than 1 cent, discard that question).

**Formula drills (no AI):** endless generator for rate per total mile, break-even with fees, fuel per mile, FSC, time zone conversion, detention billing, HOS feasibility (simple). Randomised inputs within realistic ranges, instant feedback, timer and streak (Module 6 “speed round” target: 10 s per rate-per-mile question).

**Flashcards:** decks from `glossary.json` (per module and all), from module-check Q&A, and from the learner’s own notes (“Make flashcard” on any highlight). Spaced repetition using SM-2 (again/hard/good/easy). Daily due queue on Home.

### 7.5 Toolbox (calculators and references)

Each tool is a card with inputs, a live result, a short explanation and a link to the course page that teaches it.

| Tool | Inputs → outputs | Course page |
|---|---|---|
| Rate per mile | rate, loaded miles, deadhead → per loaded mile, per total mile, vs break-even/target | m06/m07 |
| Cost per mile builder | weekly fixed items, miles/week, mpg, diesel, variable items → fixed/mi, variable/mi, operating cost | m07-p04/p05 |
| Break-even & target | operating cost, fee %, profit cushion → break-even, target; ask price and walk-away for a trip | m07-p08 |
| Diesel sensitivity | diesel range × miles/week → break-even grid (reproduce the Module 7 table) | m07 |
| Fuel surcharge | EIA price, base, mpg, miles → FSC/mi, FSC total, all-in | m07-p07 |
| Rate per day | trip revenue, days → per day vs weekly need | m07-p15 |
| Payment paths | invoice, quick-pay %, factoring % → amounts | m09-p14 |
| Detention | appointment, arrival, out time, free hours, rate, billing increment, late rule → billable time and amount | m10-p05 |
| Time zone converter | U.S. city or zone + date/time ↔ PKT, shows DST status | m03, m11-p04 |
| Distance & deadhead | origin, destination (from cities) → straight-line, estimated road miles, driving time at 50 mph | m03/m06 |
| Pallet & weight check | pallets, weight per pallet, trailer type → cube/weight fit vs practice limits | m02 |
| Equipment codes | searchable table V, VA, VM, VC, R, RA, F, FD, SD, PO, SB, MV, VH, VR + suffix letters | m02-p29 |
| DAT zones | Z0–Z9 table + map | m03 |
| Formula sheet | all formulas from 8.4 with worked Truck 12 examples | m07 |
| Glossary | 230 terms, filter by module, search, add to flashcards | all |
| Phonetic alphabet | NATO table + audio | m00-01 |

### 7.6 Map and Geography Lab

- Offline US map (states from `us-atlas`, AlbersUsa projection). Layers: DAT zones (colours from the course), time zones (shade states by primary zone; note split states), freight cities (dot size by tier), selected interstates (optional simplified lines if available; otherwise skip).
- Click a city: name, state, zone, local time vs PKT, tier.
- **Route tool:** pick origin and destination; draw a great-circle line, show straight-line and estimated road miles (×1.18), driving hours at 50 mph, number of 10-hour breaks needed, time-zone changes along the way, and arrival time in destination zone and PKT.
- **Deadhead circles:** draw DH-O/DH-D radius circles (in miles) around a city, list cities inside (to teach Module 6 searches).
- **Games:** “Find the city” (click the map), “Name the zone”, “Which interstate?” (multiple choice from course content), “Time zone sprint”. Track scores.

### 7.7 Hours-of-Service and Trip Planner

Teach and test Module 4.

**Trip planner:** inputs — start location and local start time, remaining clocks (11-hour drive, 14-hour window, time since last 30-minute break, hours left on 70/8), stops (pickup/delivery with appointment windows and expected on-duty minutes), average speed (default 50 mph). Output — a timeline (Gantt) with driving, on-duty, breaks, 10-hour off periods; arrival at each stop vs appointment; violations or risks highlighted; all times shown in the stop’s local zone and PKT. “Can we make it?” verdict: ✅ feasible with buffer, ⚠ tight (<60 min buffer), ❌ not feasible, with the reason.

**ELD log grid exercise:** a 24-hour grid with four rows (Off duty, Sleeper berth, Driving, On duty not driving). The learner draws a day by clicking/dragging; the checker reports totals per row and violations (11-hour, 14-hour, 30-minute break after 8 hours driving, 10 hours off). Provide 6 preset scenarios from Module 4 content plus random ones.

**Rules engine (property-carrying, standard rules):** 11 hours driving max after 10 consecutive hours off; no driving after the 14th hour after coming on duty; 30-minute break required after 8 cumulative hours of driving; 60/70-hour limit in 7/8 days with 34-hour restart; adverse driving conditions exception (up to +2 hours driving and +2 hours window when conditions were not known at dispatch); sleeper-berth split as an “advanced” toggle (explain, do not use by default). Show a note that the course mentions FMCSA pilot programs announced in August 2026; the app uses the standard rules.

Coercion warning: if the learner tries to schedule beyond limits, show a red banner citing 49 CFR 390.6 (coercion prohibited) and Module 4.

### 7.8 Economics Lab

Interactive version of Module 7.

1. **Cost per mile builder** with Truck 12 defaults (`practice-data.json → costModelTruck12`), stacked bar of cost components vs the ATRI 2025 benchmark bar.
2. **Fixed vs miles chart:** line chart of fixed cost per mile and break-even vs miles per week (1,500–3,500).
3. **Diesel slider:** moves fuel per mile, break-even and target live; shows how the old $2.40 minimum compares.
4. **Break-even waterfall:** operating cost → fees → break-even → profit cushion → target.
5. **Load economics card:** fill posted rate, loaded miles, deadhead, days, market range, next-leg strength, hours → computed rate per total mile, per day, decision suggestion (BOOK/COUNTER/PASS) with reasons; save cards to a history list (“after a month they show the carrier’s real lanes”).
6. **Plan comparator:** Plans A/B/C from the course preloaded; the learner can edit legs or create new plans; table + bar charts (first-load RPM, trip RPM, per day), margin vs break-even, hours used, end location on a mini map.
7. **Pocket view:** follow a rate to the carrier’s pocket (factoring, dispatch fee, cost of miles → result).

### 7.9 Load Board Simulator

A realistic DAT/Truckstop-style board (styled generically; do **not** copy any real brand’s logo or exact UI).

**Search form:** truck (choose Truck 12/7/3 or custom), origin city, DH-O (miles), destination (blank / city / state / zones multi-select), DH-D, equipment (multi), load type (Full/Partial/Both), length, max weight, pickup date range, search back (hours). Save searches; alarms (a toast when new matching loads are generated).

**Results:** table with columns Age, Pickup, Truck, F/P, DH-O, Origin, Trip, Destination, DH-D, Company, CS, DTP, Length, Weight, Rate, $/mi (loaded) and a computed **$/total mi** column the learner can toggle on (off by default to train mental math). Sort by any column; new loads “arrive” every 30–90 seconds while the board is open (generator, 8.5); loads age and disappear (covered).

**Load detail drawer:** all fields + commodity, pickup/delivery windows and time zones, comments, broker profile (name, MC (fictional), authority age, bond status, credit score, days to pay, contact email domain, phone), market range for the lane (practice), mini map with DH circle and route, “Load economics card” prefilled, HOS feasibility quick check for the selected truck.

**Actions:** Screen (mark Call / Plan / Reject with a reason; the app grades against the truck constraints), Vet broker (opens 7.10 with this broker), Call broker (opens a role-play in 7.14 with this load’s facts given to the AI broker), Book (requires: broker vetted, rate ≥ walk-away or carrier approval note, HOS feasible) → creates a load on the Dispatch Board (7.12) with a generated rate con.

**Practice mode:** “Module 6 board” loads exactly the 12 course loads with the course answers for grading (`module6Board`). “Module 11 Tuesday board” loads the 6 simulation loads.

**Scoring:** for each screening session, show time taken, accuracy (vs engine’s ideal decisions), money left on the table, and red flags missed.

### 7.10 Broker Vetting and Fraud Lab

- **Seven-check workflow** (Module 8): authority, $75,000 security, contact match, age/history, credit & pay, tools, rate con check. Each step shows a simulated record:
  - SAFER-style snapshot (entity type, status, phone, address, authority) — clearly labelled “Simulated record (practice)”.
  - L&I-style filings (broker authority status, BMC-84/BMC-85 amount, cancellation date if any).
  - Email and phone comparison (official website vs message), with lookalike-domain detection practice.
  - Credit score/DTP, factor decision.
- Decision: PASS / CAUTION / STOP + flags + next action; feedback with the course reasoning.
- Preset cases A–F from `module8Brokers`; plus a generator for endless cases (mix of honest brokers and fraud patterns: new authority + free email + high rate; impersonation with lookalike domain; carrier-only authority offering loads; pending bond cancellation; slow payer).
- **Spot-the-impersonator email game:** side-by-side emails; click the suspicious parts.
- **Six-step response trainer:** given a fraud scenario, put the steps (Stop, Verify, Tell the carrier, Protect, Report, Record) in order and choose the right report channels.
- Info panel: the $75,000 rule timeline (2 business days, 7 business days, suspension) and 49 U.S.C. 14916 summary from the course.

### 7.11 Document Lab

1. **Real documents with hotspots:** rate con, BOL and POD for load #12354 (`document-hotspots.json`). Two modes: Explore (click numbered hotspots to read explanations) and Quiz (“Find the weight mismatch”, “Find the clause that costs $150 if the POD is late”, “Is this POD clean?”) — the learner clicks on the image; correct if within 40 px of the hotspot.
2. **Rate con checker:** the practice rate con for Load 2 (render as a styled document) next to the call notes; the learner clicks fields that are wrong and types the correction; grade against `practiceRateConErrors` and the clause to question. Then generate random rate cons from booked loads with 0–3 injected errors.
3. **BOL vs rate con comparator:** table comparing fields; learner marks match/mismatch and chooses the action.
4. **Dispatch sheet builder:** form that produces a driver-ready dispatch sheet (with time zones); validator checks missing fields and time-zone labels.
5. **Invoice builder:** produce an invoice (number, load, lines, attachments) from a delivered load; check it matches the rate con; export to PDF (print stylesheet) and save to the load’s folder.
6. **File naming trainer:** rename sample files to the Module 9 convention (`YYYY-MM-DD_LOAD#_Origin-Destination/01_RateCon_signed.pdf …`).

### 7.12 Dispatch Board (load execution)

A Kanban + timeline of loads moving through the eight steps (Module 9): Booked → Rate con checked/signed → Dispatched → At pickup → Loaded → In transit → Delivered → Paperwork sent → Paid.

- Each card shows truck, lane, appointment times (local + PKT), next action, documents status (RC/BOL/POD/Invoice), and alerts (late risk, detention clock running, missing document).
- Clicking a card opens the load file: details, generated rate con, dispatch sheet, check-call log (add entries with time and zone), problem log, documents, invoice, payment tracker.
- A **simulated clock** (pause, 1×, 10×, 60×) advances events: driver check-ins, BOL photo arrival (with occasional mismatches), tracking pings on the map, delays, delivery, POD (clean or exception).
- **Invoice tracker** table (sent, path, due, paid) and **handover note** generator (summarises all trucks for the end of the shift).

### 7.13 Problems and Claims Simulator

- **Accessorials menu** cards (detention, layover, TONU, lumper, extra stop, driver assist, redelivery, scale/tarp) with practice values and proof needed.
- **Detention clock** interactive timeline: drag arrival, appointment, door and out times; see free time, billable time and amount under different billing rules; “Send notice” step must be done before free time ends to qualify.
- **Event cards:** the 8 problems (late, breakdown, reefer temperature, refused load, accident, weather, hours running out, short/damaged freight) and the 6 situations from Module 10. For each: choose and order the first actions from a list, write the message to the broker (AI grades it if on), pick the evidence to collect. Feedback quotes the course.
- **Late ETA calculator** (miles left ÷ realistic speed + buffer + hours check) then a role-play call (drill 12).
- **Claims timeline** explainer (9 months / 30 days / 120 days / 2 years) and a “claim response note” exercise.

### 7.14 Role-play Studio (AI voice/text)

- Library of the 18 role-plays in `roleplays.json`, grouped by module, each with the learner briefing, difficulty (Easy / Medium / Hard), estimated time and best score. Plus “Custom role-play”: pick any load from the board and a counterpart (broker, driver, carrier owner, shipper/receiver, insurance agent, suspicious broker).
- **Session screen:** left = briefing card, the learner’s numbers (break-even, target, walk-away computed automatically), notes area, timer; centre = chat (bubbles, typing indicator); bottom = text box + push-to-talk mic button. Voice: record → transcribe (Gemini) → send; AI reply is spoken with TTS if enabled (choose voice and speed).
- The AI stays in character, uses the role-play’s hidden facts, reacts to difficulty, keeps replies short like a real phone call, and never breaks character until the learner types `/end` or clicks End call.
- **Scoring:** after End call, send the transcript + briefing + hidden facts + rubric to the grading model; display rubric scores (5 × 0–2), automatic-fail checks, three things done well, three to improve, the best moment, and a “10/10 version” of the call. Save the transcript and score; show progress over attempts.
- “Replay as a 10/10 dispatcher” button (AI generates a model dialogue). “Try again with a harder broker” button.

### 7.15 Drill Studio (speaking practice)

- Drills 1–12 from `drills.json`. For each: script (teleprompter mode with adjustable speed), “Listen” (TTS reads the script), “Record”, playback, transcript, and AI feedback (clarity, completeness vs checklist, missing elements, filler words, words per minute; schema 9.4). Store recordings locally (IndexedDB blobs) with dates.
- **Phonetic alphabet trainer:** random MC numbers, seal numbers, load references, VIN endings; the learner says them; transcript checked for correct NATO words/digits.
- **Number read-back trainer:** the app reads load details aloud (TTS) and the learner types or says the read-back; graded for exactness (times with zones, numbers digit by digit).
- **Accent-neutral clarity tips** section from the course (short, practical).

### 7.16 Week Simulation (capstone game)

A full, saved, stateful game based on Module 11.

- **Setup:** Blue Line fleet (Trucks 12, 7, 3) with Monday positions, hours and constraints from `module11Simulation`; market inputs from settings; difficulty level.
- **Day loop (Mon–Fri):** each day has phases: Plan → Book → Execute → Problems → Close. The simulated clock runs in U.S. time with PKT shown. Days use the course’s day cards and events (Tuesday board, Wednesday/Thursday events, Friday close), plus random extra events at higher difficulty.
- **Embedded activities:** search and book on the simulator (7.9), vet brokers (7.10), check rate cons (7.11), run role-plays A–H at the right moments (7.14), handle problems (7.13), dispatch board updates (7.12), handover notes at shift end.
- **Rules:** booking below the truck’s target requires an “Ask Mike” step (AI Mike may approve or refuse with reasons); automatic fails (section 3.4) end the day with a debrief.
- **Weekly report:** computed from the learner’s actual booked loads — revenue, loads, total and loaded miles, rate per total mile, deadhead %, revenue per truck per day, detention billed/paid, invoices open; per-truck table with below-break-even flags; the learner writes “three lines for Mike”; AI grades the report (role-play H).
- **Capstone:** after the week, the capstone message (Memphis/Harbor Point/$6.70 diesel) with the 6 tasks and the scoring guide (10 points); show the model answer after submission.
- Save slots (3), resume anytime, export the week as a PDF report.

### 7.17 Progress, Readiness and Certificate

- Dashboard: pages read per module, time studied, quiz scores, flashcard retention, drills completed, role-play scores (best/average), simulator accuracy, week simulation result, capstone score.
- **Readiness checklist** (Module 11 final checklist, 11 lines) with automatic ticks when evidence exists (e.g., module quiz ≥ 80%, related role-play ≥ 7/10) and manual ticks.
- **Recommendation engine:** suggests the next best activity: weakest module by quiz score, due flashcards, role-plays below 7, unread pages.
- **Certificate:** when readiness is complete, generate a printable certificate (as in the Module 11 handbook) with the learner’s name, date, best role-play average and capstone score; note that it is a personal training record, not an accredited qualification.

### 7.18 Settings

Profile (name, default U.S. zone, daily goal), Appearance (light/dark/system, font size, reduced motion), AI (transport status, API key for desktop, model names, temperature, voice on/off, TTS voice and speed, language for explanations), Market inputs (diesel price and date, DAT averages and date, Truck 12 cost model — editable with “Reset to course values”), Data (export all progress as JSON, import, reset with confirmation), About (course credits, disclaimers, version).

---

## 8. Simulation engines (algorithms)

All in `src/engines`, pure TypeScript, unit-tested. Use these exact formulas and test cases.

### 8.1 Distance

- Great-circle (haversine) miles between cities; **road miles ≈ straight-line × 1.18** (round to the nearest 5); driving hours at a configurable average speed (default 50 mph).
- Test: Chicago → Atlanta straight-line ≈ 589 mi → road ≈ 695 (course uses 715 for Bolingbrook → Atlanta).
- The 1.18 factor is an estimate (±10%). Whenever a course dataset gives miles (e.g., Chicago → Charlotte 760), use the dataset’s miles, not the estimate.

### 8.2 Time zones

- `toZone(date, ianaZone)` and `toPKT(date)` with `Intl.DateTimeFormat`; `offsetHours(zone, date)`; `pktDifference(zone, date)` returns +9…+13.
- Tests: 14 Oct 2026 9:00 America/Chicago → 19:00 Asia/Karachi; 2 Nov 2026 9:00 America/Chicago → 20:00 PKT; 15 Oct 2026 13:00 America/New_York → 22:00 PKT; Arizona (America/Phoenix) always PKT = MST + 12.

### 8.3 Hours of service

Implement a simulator that consumes a sequence of duty events and returns clocks and violations (11/14/30-min/10-hour/70-hour/34-hour; adverse +2). Tests:
- Start duty 7:30, drive 10.3 h with a 30-min break after 8 h, stop by 21:30 → no violations.
- Drive 11.5 h → violation “11-hour driving limit”.
- Drive 8.5 h without a break → violation “30-minute break”.
- Drive at hour 14.5 after coming on duty → violation “14-hour window”.

### 8.4 Economics (exact course formulas)

```
fixedPerMile      = weeklyFixed / milesPerWeek
fuelPerMile       = diesel / mpg                       (round to cents for display)
operatingCost     = fixedPerMile + variablePerMile
breakEven         = operatingCost / (1 - feePct)       (fees: dispatch 6% + factoring 3% = 0.09)
target            = (operatingCost + cushion) / (1 - feePct)
ratePerTotalMile  = allInRate / (deadhead + loadedMiles)
ratePerLoadedMile = allInRate / loadedMiles
askPrice          = target × totalMiles
walkAway          = breakEven × totalMiles
fscPerMile        = (eiaDiesel - base) / mpg            (DAT RateView method, base 1.25)
revenuePerDay     = tripRevenue / daysCommitted
carrierKeeps      = rate × (1 - feePct)
```

Tests (Truck 12): fixed 1300/2500 = 0.52; fuel 6.38/6.5 = 0.98; operating 2.36; break-even 2.59; target 2.70; Load 1 2050/800 = 2.5625 → $2.56; ask 2.70 × 800 = $2,160; walk-away 2.59 × 800 = $2,072; FSC (6.382 − 1.25)/6.0 = 0.855; 700 mi FSC = $599 (rounded); Plan C 3450/1317 = 2.62; diesel $6.70 → break-even 2.65, target 2.76.

### 8.5 Load generator (practice market)

Generate plausible loads around a search origin:

1. Pick origin cities within DH-O of the search origin (weighted by tier: tier 1 ×3, tier 2 ×2, tier 3 ×1) and destinations across the country (weighted toward tier 1/2 and toward the searched destination/zone if given).
2. Loaded miles = road miles (8.1); discard < 100 or > 2,600.
3. Equipment mix by origin region (practice): vans 60%, reefers 25% (higher from CA/TX/FL/produce areas), flatbeds 15%; partials 10%.
4. Weight: van 18,000–44,500; reefer 20,000–43,000; flatbed 20,000–48,000; partial 2,000–16,000. 3% of loads deliberately exceed common truck limits (to test screening).
5. **Rate:** `allIn = loadedMiles × (linehaulBase[equipment] × laneFactor + fscPerMile) × noise + shortHaulAdder`, where `linehaulBase` comes from Settings → Market inputs (defaults: DAT Aug 2026 snapshot van 2.19, reefer 2.61, flatbed 2.70), `fscPerMile` from the diesel input (8.4), `laneFactor` = 1.10 into tier-1 headhaul hubs (e.g., Atlanta, Dallas, Chicago), 0.90 into weak reload markets (e.g., Miami, Florida generally), else 1.0 (all labelled practice assumptions), `noise` uniform 0.85–1.15, `shortHaulAdder` = $150 for trips < 300 miles. 15% of loads have no posted rate (“—”). Round to $25.
6. Pickup/delivery windows: pickup today/tomorrow (or as searched); delivery feasible for a solo driver in about 70% of loads, tight in 20%, impossible in 10% (to test HOS checking).
7. Broker profile: name from a list of 60 fictional names (avoid real company names; add “(practice)” in details), authority age 0.1–25 years, credit score 60–99 (blank if < 0.3 years), DTP 25–60, bond status (normal; 3% pending cancellation), contact domain matching the name; 4% fraud pattern (new authority + free email + rate 15–25% above lane + “book now” comment); 2% carrier-only authority.
8. Age: 0–6 hours; new loads arrive while the board is open; loads older than search-back are hidden; random loads get “covered”.
9. Commodity list by equipment (practice): van — paper products, canned goods, beverages, auto parts, retail goods; reefer — produce, dairy, frozen foods, meat; flatbed — steel, lumber, machinery, building materials.

### 8.6 Grading the screener

For a truck and a load, the ideal decision is computed in this order (Module 6 five-filter scan): equipment fit (incl. air-ride/reefer/weight/length) → can get there (DH, pickup time vs availability) → can deliver (HOS feasibility) → lane fit (preference zones) → worth calling (rate per total mile vs target/break-even, broker signals, red flags). Output CALL / PLAN (negotiate or check) / REJECT with the first failed filter as the reason. Test with the 12 Module 6 loads using the old $2.40 minimum (answers in `module6Board.answers`) and with the $2.59/$2.70 thresholds (answers in `module7Recheck`).

### 8.7 Detention

`billable = max(0, out - max(appointment, arrival) - freeHours)`; void if arrival > appointment (configurable); apply billing increment (per minute / full 15-min blocks rounded down / started hour) × rate. Tests from `module10.detentionExercises`: a $100, b $75, c $0, d $125 (FCFS clock from arrival).

### 8.8 Week simulation scoring

Revenue, loads, total/loaded miles, rate per total mile, deadhead % = (total − loaded)/total, revenue per truck per day, below-break-even flags per truck (vans 2.59, reefer 2.80), detention billed vs paid. Test with `weeklyKpiExample`: fleet $14,750, 5,580 total mi → $2.64; deadhead 10.4%; Truck 3 $2.38 flagged.

---

## 9. AI features: prompts, schemas and safety

Put all prompts in `src/ai/prompts.ts` as functions. Always include the **course guardrails** block:

```
You are part of Dispatch Academy, a training app for carrier-side U.S. truck dispatch.
Ground every factual statement in the COURSE CONTEXT provided. Cite page IDs like [m07-p08].
If the answer is not in the context, say so and suggest the official source to check.
Practice data (Blue Line Transport, Truck 12, brokers, loads) is fictional; market numbers are dated snapshots.
Always keep carrier-side ethics: no re-brokering, no broker payments to the dispatcher, no shared logins,
no misrepresentation, never pressure drivers beyond hours-of-service limits, take fraud red flags seriously.
Not legal or tax advice.
```

### 9.1 Tutor

System = guardrails + mode instructions. User = question + COURSE CONTEXT (pages with IDs) + glossary matches. Output plain markdown with a final line `Sources: [id], [id]`.

### 9.2 Quiz generation (JSON)

```json
{ "type": "object", "properties": { "questions": { "type": "array", "items": {
  "type": "object", "properties": {
    "kind": {"type": "string", "enum": ["mcq", "truefalse", "numeric", "scenario"]},
    "question": {"type": "string"}, "options": {"type": "array", "items": {"type": "string"}},
    "answer": {"type": "string"}, "explanation": {"type": "string"},
    "sourcePageId": {"type": "string"}, "formula": {"type": "string"}
  }, "required": ["kind", "question", "answer", "explanation", "sourcePageId"] } } } }
```

### 9.3 Answer grading (JSON)

```json
{ "score": 0, "maxScore": 2, "verdict": "correct|partly|wrong", "feedback": "string", "missingPoints": ["string"], "sourcePageIds": ["string"] }
```

### 9.4 Drill feedback (JSON)

```json
{ "clarity": 0, "completeness": 0, "maxEach": 5, "wordsPerMinute": 0, "fillerWords": ["string"],
  "missingElements": ["string"], "goodPoints": ["string"], "improvedVersion": "string" }
```

### 9.5 Role-play persona (system prompt template)

```
{guardrails}
ROLE: You are {aiRole} in a phone call with Jawad, a dispatcher for Blue Line Transport (MC 1298456).
SCENARIO (what Jawad knows): {briefing}
HIDDEN FACTS (only reveal when asked or natural): {hidden}
DIFFICULTY: {easy|medium|hard} — easy: cooperative; medium: realistic pushback, some missing details;
hard: fast, lowball, pressure, hidden problems.
STYLE: speak like a real U.S. freight professional on the phone: short turns (1–3 sentences),
natural, no lists, no coaching, never mention you are an AI or a test. Stay in character until "/end".
If Jawad proposes something unsafe, illegal or unethical, react as a real counterpart would (refuse, question).
```

### 9.6 Role-play grading (JSON)

```json
{ "scores": {"opening": 0, "facts": 0, "numbers": 0, "judgement": 0, "close": 0}, "total": 0,
  "automaticFail": {"triggered": false, "reason": ""},
  "doneWell": ["string"], "toImprove": ["string"], "bestMoment": "string",
  "modelDialogue": "string", "sourcePageIds": ["string"] }
```

The grader receives: transcript, briefing, hidden facts, success criteria from `roleplays.json`, rubric, and the learner’s computed numbers (break-even, target, walk-away). The app recomputes any math the grader mentions using the engines and shows a warning if the AI’s math is wrong.

### 9.7 Transcription

Send recorded audio (webm/ogg) with the instruction “Transcribe exactly. Keep numbers as digits; keep U.S. place names; no commentary.” Return plain text.

### 9.8 Safety and cost controls

Rate-limit AI calls (e.g., max 30/min), show a small token/usage indicator, cache tutor answers per question+page, and degrade gracefully without AI.

---

## 10. Data model and persistence

IndexedDB (Dexie) database `dispatchAcademy`, version-migrated:

| Table | Key | Fields |
|---|---|---|
| settings | id | all settings (single row) |
| progress | pageId | readAt, understood, confidence, timeSpentSec |
| notes | id | pageId, text, highlights[{start,end,color,text}], createdAt |
| bookmarks | pageId | createdAt |
| quizAttempts | id | quizId/module, items[{n, answer, score}], score, createdAt |
| flashcards | id | deck, front, back, sm2{ef, interval, reps, due}, source |
| drillAttempts | id | drillN, audioBlob, transcript, feedback, createdAt |
| roleplaySessions | id | roleplayId, difficulty, transcript[], scores, createdAt |
| loadCards | id | inputs, results, decision, createdAt |
| boards | id | searches, loads (generated), screenings |
| dispatchLoads | id | full load file (status, docs, logs, invoice, payment) |
| simulations | id | slot, state (JSON), createdAt, updatedAt |
| events | id | learning analytics (activity type, duration, result) |

Export/import: one JSON file (audio blobs optional as base64). Auto-backup weekly to a file in desktop mode (Electron: `app.getPath('documents')/DispatchAcademy/backups`).

---

## 11. Desktop and offline behaviour

- **Electron wrapper:** `electron/main.cjs` creates a `BrowserWindow` (1440×900 min 1100×720), loads the built `dist/index.html` (hash routing), sets a proper app name and icon, disables Node integration in the renderer, uses a `preload.cjs` with a minimal `contextBridge` API for: secure key storage (`safeStorage`), backups folder, opening PDFs externally, and app version. Packaged with `electron-builder` (Windows NSIS installer and portable `.exe`; macOS dmg optional).
- **Offline:** everything except AI works without internet (content, images, PDFs, simulators, calculators, map). AI features show “offline” when there is no network.
- **PWA:** manifest + service worker (Workbox) caching the app shell, content JSON, images and PDFs, so the web version can be installed from Chrome/Edge (“Install app”) and used offline.

---

## 12. Accessibility, performance and quality

- WCAG AA contrast in both themes; full keyboard navigation; focus rings (amber); ARIA labels on icons; captions/transcripts for audio; reduced-motion setting.
- Performance: route-level code splitting; lazy-load images with `loading="lazy"` and blurred placeholders; virtualise long tables (load board, glossary); keep startup < 2 s on a mid-range laptop.
- Error boundaries per feature; friendly empty states; no console errors.
- Unit tests for all engines (section 8 tests), component tests for calculators, and a smoke test that every page in `course.json` renders and every image path exists.

---

## 13. Acceptance tests (definition of done)

1. All 292 pages render with images; every image path in `course.json` loads; “Open in PDF” jumps to the right page.
2. Search finds “detention”, “BMC-84”, “break-even”, “SLC”, “PKT” and opens the right pages.
3. Calculators reproduce every number in section 8.4 tests and the Module 7 sensitivity table.
4. Time converter passes section 8.2 tests, including the November DST change.
5. HOS planner flags the 11-hour, 14-hour and 30-minute violations in section 8.3 tests.
6. Module 6 board practice grades the 12 loads exactly like the course answers.
7. Broker lab cases A–F produce the course decisions; the generator produces both honest and fraud cases.
8. Document lab: all hotspots clickable; rate con checker accepts the 6 corrections and flags the $250 late-fine clause.
9. Detention tool returns $100 / $75 / $0 / $125 for the four Module 10 cases.
10. Role-play: a full voice or text session runs, ends with a rubric score, transcript saved, retry works.
11. Drill: record → transcript → feedback works for drill 8; phonetic trainer checks “4471023” read as digits.
12. Week simulation: can be played Monday to Friday, saved and resumed; weekly report matches `weeklyKpiExample` when the same loads are booked; capstone shows the model answer after submission.
13. Works with AI off (no key): no crashes; AI buttons show a helpful setup message.
14. Desktop build launches from the installer, works offline (except AI), saves progress between launches.
