# Dispatch Academy — Build Prompts for Google AI Studio

Paste these prompts into **Google AI Studio → Build**, one at a time, in order. Wait for each phase to finish, test it in the preview (each phase lists what to check), then move on. If something breaks, use the **Fix prompts** at the end.

Rules for you (the human):
- Never paste two phases at once. One phase = one prompt.
- After each phase, click through the checklist. If a check fails, paste a Fix prompt describing exactly what you saw.
- Keep GitHub sync on so every phase is saved as a commit.

---

## PROMPT 0 — Kick-off (paste first)

```
You are building "Dispatch Academy", an in-depth desktop learning and simulation app for carrier-side U.S. truck dispatch.

This repository already contains:
- docs/SPEC.md: the complete product specification. Read ALL of it now, carefully.
- docs/PROMPTS.md: the build phases (I will give you one phase at a time).
- content/: the course content pack (course.json with 292 handbook pages, quizzes, glossary, drills, role-plays, practice data, cities, document hotspots).
- public/assets/: all diagrams and photos. public/pdfs/: the 11 original handbooks.

Do not delete, rename or rewrite anything in content/, public/assets/ or public/pdfs/.

Before writing code, reply with:
1. A short summary of the app in your own words.
2. The folder structure you will create (follow SPEC section 4.2).
3. Any questions or risks you see.

Then build PHASE 1 only (described below), following SPEC sections 4, 5, 6 and 7.18.

PHASE 1 — Foundation:
- React + TypeScript app with hash routing, the left sidebar, top bar (search placeholder, dual PKT/US clock with live DST status, AI status dot) and the collapsible right study panel (empty for now).
- Design system from SPEC section 5: colour tokens, light/dark themes (follow system by default), Poppins bundled locally, UI kit components (Button, Card, Callout, Pill, Stat, Table, Drawer, Modal, Tabs, Toast, Lightbox, EmptyState, Skeleton).
- Typed data loaders for every file in content/ (SPEC 2.1, 4.4). Show a temporary "Content check" screen listing counts: modules 11, pages 292, quiz questions 128, glossary 230, drills 12, role-plays 18, cities 103.
- Dexie IndexedDB layer with the tables in SPEC section 10 (create all tables now, even if unused).
- Settings screen (SPEC 7.18) fully working, including Market inputs with "Reset to course values" from practice-data.json.
- AI client with the two transports (SPEC 4.3): server routes /api/ai/health, /api/ai/generate, /api/ai/chat, /api/ai/transcribe using GEMINI_API_KEY on the server; direct mode with a user key from Settings. Models are read from Settings. If no AI is available, the app must still work.
- First-run onboarding (SPEC section 6).
- Placeholder pages for every sidebar item with a nice EmptyState using a course photo.

Quality bar: this is a production-quality product, not a demo. Clean code, typed, no console errors.
```

**Check after Phase 1:** sidebar works; theme toggle; dual clock shows PKT = ET + 9 (in U.S. summer time); Content check shows the right counts; Settings save and survive a reload; AI status dot is green inside AI Studio.

---

## PROMPT 1 — Learn: library, reader, PDF, search, notes

```
Build PHASE 2 — Learn (SPEC 7.2 and the markdown conventions in SPEC 2.1 and 5.4).

- Module Library: photo cards for the 11 modules (coverImage), progress bars, module overview pages with sections, page lists, read status, related drills and role-plays, "Open original PDF".
- Page Reader: render pages[].markdown with react-markdown + remark-gfm. Callout blockquotes "**[TYPE] Title**" must become styled callout cards exactly as in SPEC 5.4 (including tickable CHECKLIST items saved per page and a "Practise this" button on SAY IT OUT LOUD callouts that will later open Drill Studio). Cover/opener pages render as hero cards with images[0] as background. Images open in a zoomable lightbox. Tables are responsive with sticky headers. Hide duplicated first lines that repeat the kicker or title.
- Header with kicker, title, page n/N, bookmark, "Mark as understood", confidence 1–3, "Open in PDF (page N)" opening an in-app PDF viewer at the right page.
- Previous/next, keyboard arrows, section navigation, breadcrumbs, deep links (#/learn/<moduleId>/<pageId>).
- Reading progress rules from SPEC 7.2 saved in Dexie.
- Notes and highlights per page in the right study panel; a Notes screen listing all notes; bookmarks screen.
- Global search (Ctrl+K command palette) over page titles, kickers, markdown text and glossary terms, with result snippets and highlight on open (SPEC 4.4).
- Home dashboard (SPEC 7.1) with "Continue where you left off", module progress and the quick tools row (tools can link to placeholders for now).
- Smoke test: a hidden developer screen that renders every page offscreen and reports any image path that fails to load.
```

**Check:** open m07 page 8 — the break-even diagram shows and zooms; callouts are coloured; "Open in PDF" opens page 8; search "BMC-84" finds Module 8 pages; notes save; the smoke test reports 0 broken images.

---

## PROMPT 2 — AI Tutor, quizzes, module checks, flashcards

```
Build PHASE 3 — AI Tutor (SPEC 7.3, 9.1) and Quizzes/Flashcards (SPEC 7.4, 9.2, 9.3).

- Tutor chat screen and a mini tutor in the right study panel of every page. Retrieval exactly as SPEC 7.3 (search index + current page + same section, max 6 pages, glossary matches). Every answer ends with clickable source chips (page IDs). Modes: Explain, Simplify, Example with Truck 12, Quiz me, Urdu/Roman Urdu. Streaming responses. Guardrails block from SPEC 9 in every system prompt.
- Module checks from content/quizzes.json: type answer → reveal model answer → self-grade; optional AI grading with the JSON schema in SPEC 9.3. Save attempts and best scores per module.
- AI-generated quizzes for a page/section/module with the JSON schema in SPEC 9.2. For numeric questions, recompute with the economics engine (SPEC 8.4) and discard mismatches.
- Formula drills (no AI) from SPEC 7.4 with timer, streak and instant feedback.
- Flashcards with SM-2 spaced repetition: decks from glossary.json (per module/all), module-check Q&A, and "Make flashcard" from any highlight. Due count on Home.
- "Quiz me on this page" and "Explain simpler / Explain in Urdu" buttons in the reader now work.
```

**Check:** ask the tutor "What is the break-even formula and why divide by 1 − fees?" → answer cites m07-p08; Module 7 check works; a generated quiz shows sources; flashcards schedule reviews.

---

## PROMPT 3 — Engines + Toolbox + Map

```
Build PHASE 4 — the pure engines and the Toolbox and Map (SPEC 7.5, 7.6, 8.1, 8.2, 8.4, 8.7).

- src/engines: distance.ts, timezones.ts, economics.ts, detention.ts with Vitest unit tests using EXACTLY the test cases in SPEC 8.1, 8.2, 8.4 and 8.7. Show a developer "Engine tests" screen that runs the same checks in the browser and shows pass/fail.
- Toolbox: every tool in the SPEC 7.5 table as a polished card (inputs, live result, explanation, link to the teaching page). Include the diesel sensitivity grid that reproduces the Module 7 table, the detention tool with billing-rule options, the time-zone converter with DST status, the equipment codes table, DAT zones table, formula sheet with Truck 12 examples, glossary browser and phonetic alphabet (with TTS audio).
- Map & Geography Lab: offline US map (d3-geo AlbersUsa + us-atlas states) with layers for DAT zones, time zones and freight cities (cities.json), city popups with local time vs PKT, route tool (miles, hours, 10-hour breaks, zone changes, arrival in local time and PKT), deadhead circles with cities inside, and the four games (find the city, name the zone, which interstate, time-zone sprint) with scores saved.
- Wire the Home quick tools to these tools.
```

**Check:** Engine tests all green; break-even with Truck 12 = $2.59, target $2.70; FSC at $6.382 = $0.855; 9 AM CT on 2 Nov 2026 = 8 PM PKT; detention cases = $100/$75/$0/$125; map route Chicago → Atlanta shows ~695 miles estimated.

---

## PROMPT 4 — Economics Lab

```
Build PHASE 5 — Economics Lab (SPEC 7.8) using the economics engine and practice-data.json → costModelTruck12, module7Plans and marketSnapshots.

Include all seven parts: cost per mile builder with ATRI comparison bar; fixed-vs-miles line chart; live diesel slider showing break-even/target and the old $2.40 minimum; break-even waterfall; load economics card with BOOK/COUNTER/PASS suggestion and saved history; plan comparator preloaded with Plans A/B/C (editable, with charts, margin vs break-even, hours and end location on a mini map); and the "pocket view" for a rate (factoring, dispatch fee, cost of miles, result). Every number labelled "Practice data" or with its snapshot source/date. Charts in Recharts, styled with the design tokens.
```

**Check:** Plans A/B/C show $2.49 / $2.30 / $2.62 per total mile and $1,000 / $990 / $1,380 per day; Load 1 pocket view ends at −$22.50.

---

## PROMPT 5 — Hours of Service & Trip Planner

```
Build PHASE 6 — HOS & Trip Planner (SPEC 7.7, 8.3).

- engines/hos.ts with the rules in SPEC 7.7 and the tests in SPEC 8.3 (add them to the Engine tests screen).
- Trip planner with a Gantt-style timeline (driving, on duty, 30-min breaks, 10-hour off), arrival vs appointment for every stop, verdict (feasible/tight/not feasible) with reasons, all times in local zone and PKT. Preset: Load 2 (Bolingbrook → Atlanta, Wed 7:30 AM CT start) from practice-data.json → module9Load2 should show the 10-hour break near Manchester, TN and arrival before the 1 PM ET appointment.
- ELD log grid exercise (24 h × 4 rows) with drawing, totals, violation checker, 6 preset scenarios and a random generator.
- Coercion warning banner (49 CFR 390.6) when the learner schedules beyond limits.
- Link each result to the Module 4 pages that explain it.
```

**Check:** Load 2 preset is feasible; dragging the start to 11 AM makes delivery "tight" or "not feasible"; the ELD grid flags an 11.5-hour driving day.

---

## PROMPT 6 — Load Board Simulator

```
Build PHASE 7 — Load Board Simulator (SPEC 7.9, 8.5, 8.6).

- engines/loadgen.ts (SPEC 8.5) and engines/screening.ts (SPEC 8.6) with tests: the 12 Module 6 loads must grade exactly like practice-data.json → module6Board.answers with the $2.40 minimum, and like module7Recheck with $2.59/$2.70.
- Search form, saved searches, alarms, results table (all columns, sortable, virtualised), live arriving/aging/covered loads, load detail drawer with broker profile, lane range, mini map with DH circle, prefilled load economics card and quick HOS check.
- Actions: Screen (Call/Plan/Reject + reason, graded), Vet broker (link to Phase 8 lab — placeholder OK for now), Call broker (link to role-play — placeholder OK), Book (requires vetting + rate ≥ walk-away or a carrier approval note + HOS feasible) → saves a dispatch load.
- Practice modes: "Module 6 board" (exact 12 loads) and "Module 11 Tuesday board" (6 loads).
- Session scoring screen: time, accuracy, money left on the table, red flags missed.
- Use generic styling (not a copy of any real load board brand).
```

**Check:** Module 6 board grades Loads 1 and 7 as CALL, 2 and 6 as PLAN, the rest REJECT with the course reasons; generated boards look realistic and include a few deliberate traps (overweight, impossible delivery, fraud pattern).

---

## PROMPT 7 — Broker Vetting & Fraud Lab + Document Lab

```
Build PHASE 8 — Broker Vetting & Fraud Lab (SPEC 7.10) and Document Lab (SPEC 7.11).

Vetting: seven-check workflow with simulated SAFER/L&I records (clearly labelled "Simulated record — practice"), email/phone comparison with lookalike-domain practice, credit/DTP/factor step, decision PASS/CAUTION/STOP + flags + next action with course feedback. Preset cases A–F from module8Brokers, plus a generator of honest and fraud cases. Spot-the-impersonator email game. Six-step response ordering trainer with report channels. Info panel on the $75,000 rule and 49 U.S.C. 14916.

Documents: real documents (rc.jpg, bol.jpg, pod.jpg) with hotspots from document-hotspots.json in Explore and Quiz modes (click within 40 px); rate con checker for Load 2 (render the practice rate con as a styled document beside the call notes; grade the 6 errors and the $250 late-fine clause), random rate cons with injected errors from booked loads; BOL vs rate con comparator; dispatch sheet builder with validation (time zones required); invoice builder with print-to-PDF; file naming trainer.

Connect the Load Board "Vet broker" action to this lab.
```

**Check:** cases A–F give PASS, STOP, STOP, CAUTION, STOP, CAUTION; the BOL weight hotspot explains 2,000 vs 5,729 lb; the rate con checker accepts all six corrections.

---

## PROMPT 8 — Role-play Studio + Drill Studio (voice)

```
Build PHASE 9 — Role-play Studio (SPEC 7.14, 9.5, 9.6) and Drill Studio (SPEC 7.15, 9.4, 9.7).

Role-plays: library of the 18 role-plays from content/roleplays.json grouped by module, difficulty selector, best scores. Session screen with briefing, auto-computed numbers (break-even, target, walk-away), notes, timer, chat with streaming replies, push-to-talk voice (MediaRecorder → Gemini transcription → send) and optional spoken replies (speechSynthesis; voice and speed in Settings). Persona system prompt from SPEC 9.5 using briefing + hidden facts + difficulty. "/end" or End call → grading with the JSON schema in SPEC 9.6, automatic-fail checks, done well/to improve, best moment, 10/10 model dialogue; app re-checks any math with the engines. Save transcripts and scores; retry and "harder broker" buttons. Custom role-play from any board load. Connect Load Board "Call broker" to a custom role-play with the load facts.

Drills: drills 1–12 from content/drills.json with teleprompter, Listen (TTS), Record, playback, transcript, AI feedback (SPEC 9.4), saved attempts with audio. Phonetic alphabet trainer (MC numbers, seals, references), number read-back trainer. Connect every "Practise this" button in the reader to the matching drill.
```

**Check:** run role-play M08-RP1 by voice: the broker pushes back, you counter, /end gives a score out of 10 with feedback; drill 8 recording produces a transcript and feedback.

---

## PROMPT 9 — Dispatch Board + Problems & Claims Simulator

```
Build PHASE 10 — Dispatch Board (SPEC 7.12) and Problems & Claims Simulator (SPEC 7.13).

Dispatch Board: Kanban + timeline through the nine statuses, load cards with local + PKT times, next action, document status and alerts; full load file (details, rate con, dispatch sheet, check-call log, problem log, documents, invoice, payment tracker); simulated clock (pause, 1×, 10×, 60×) that generates check-ins, BOL photo arrival with occasional mismatches, tracking pings on a map, delays, delivery, clean or exception POD; invoice tracker; handover note generator. Booked loads from the Load Board appear here.

Problems: accessorials menu, interactive detention clock (drag times, choose billing rule, "send notice" must happen before free time ends), event cards for the 8 problems and the 6 Module 10 situations (order the first actions, write the broker message — AI-graded if on — choose evidence), late-ETA calculator with a one-click drill 12 role-play, claims timeline explainer and claim response note exercise.
```

**Check:** book a load → it moves through statuses on the simulated clock; a delay event creates an alert and a "late ETA" task; detention case b shows $75.

---

## PROMPT 10 — Week Simulation (capstone game)

```
Build PHASE 11 — Week Simulation (SPEC 7.16, 8.8) using practice-data.json → module11Simulation.

Full stateful game with 3 save slots: setup (fleet, Monday status, difficulty), day loop Mon–Fri with phases Plan → Book → Execute → Problems → Close, simulated U.S. clock with PKT, the course events on the right days (Tuesday board, Wednesday/Thursday events, Friday close) plus random extra events on harder levels, embedded activities from the earlier labs and role-plays A–H at the right moments, "Ask Mike" approvals (AI Mike) for below-target bookings, automatic-fail rules with debriefs, handover notes, the weekly KPI report computed from the learner's own bookings (test: weeklyKpiExample → fleet $2.64, 10.4% deadhead, Truck 3 flagged), "three lines for Mike" graded by AI, then the capstone task with the 10-point scoring guide and model answer. Export the week report as PDF.
```

**Check:** you can play Monday to Friday, quit, reopen and resume; the weekly report numbers are consistent with the bookings; the capstone shows break-even $2.65 / target $2.76 in the model answer.

---

## PROMPT 11 — Progress, readiness, certificate, polish

```
Build PHASE 12 — Progress, readiness and certificate (SPEC 7.17) and a full polish pass (SPEC 12).

- Progress dashboard with charts for every activity type; readiness checklist (Module 11 final checklist) with automatic ticks from evidence; recommendation engine for the next best activity; printable certificate when readiness is complete.
- Polish: consistent spacing and typography, illustrated empty states, skeleton loaders, error boundaries, keyboard navigation, focus states, WCAG AA contrast in both themes, reduced motion, virtualised long lists, route code-splitting, image lazy loading. Remove the temporary Content check screen from the sidebar (keep it under Settings → Developer).
- Run every acceptance test in SPEC section 13 and report the result of each one. Fix any failures.
```

---

## PROMPT 12 — Desktop app (Electron) and installable web app (PWA)

```
Build PHASE 13 — Desktop and offline (SPEC 11).

1. PWA: web manifest (name "Dispatch Academy", icons generated from a simple truck-and-route mark in navy/amber), service worker (Workbox) caching the app shell, content JSON, assets and PDFs.
2. Electron: add electron/main.cjs and electron/preload.cjs as described in SPEC 11 (BrowserWindow 1440×900, hash routing loading dist/index.html, contextIsolation on, nodeIntegration off, safeStorage for the Gemini key, backups folder in Documents/DispatchAcademy/backups, open PDFs externally). In desktop mode the AI client must use the direct transport with the stored key.
3. package.json scripts: "dev" (web), "build" (web), "desktop:dev" (vite + electron), "desktop:build" (electron-builder: Windows NSIS installer + portable exe; artifact name "DispatchAcademy-Setup-${version}.exe"), plus electron-builder config (appId "com.dispatchacademy.app", productName "Dispatch Academy", files: dist/**, electron/**).
4. A README-DESKTOP.md with exact commands for Windows: install Node.js LTS, npm install, npm run desktop:dev, npm run desktop:build, where the installer appears, how to enter the API key in Settings.

I cannot run Electron inside AI Studio, so make sure the web build still works in the preview and the Electron files are complete and correct for local use.
```

---

## Fix prompts (use when something is wrong)

**Something looks broken**
```
On the <screen name> screen, when I <action>, I see <what happens>. I expected <what should happen> (SPEC section <x>). Please find the cause, fix it, and tell me what you changed. Don't change unrelated features.
```

**Too basic / looks like a demo**
```
The <screen name> screen feels like a demo. Rework it to the quality bar in SPEC sections 1 and 5: use the course photos/diagrams from public/assets, clear visual hierarchy, illustrated empty states, realistic data, explanations linked to course pages, and smooth interactions. Show me before/after.
```

**AI answers invent facts**
```
The tutor/role-play is stating facts that are not in the course. Enforce the guardrails in SPEC section 9: always pass the retrieved course pages as context, require page-ID citations, and if the answer isn't in the context say so. Add a test question that must return "not in the course".
```

**Numbers wrong**
```
The number for <calculation> is wrong. Use the exact formula in SPEC 8.4 and add a unit test with these inputs and the expected result: <inputs → expected>. Show the test passing.
```

**Lost progress**
```
My progress/notes disappeared after a reload. Check the Dexie schema and migrations (SPEC section 10), make all writes awaited with error handling, and add an export/import test.
```

**App too slow**
```
<screen> is slow. Profile it, virtualise long lists, memoise heavy calculations, lazy-load images and split the route bundle. Target startup < 2 s and smooth scrolling.
```
