# Dispatch Academy: build your desktop app with Google AI Studio

This kit turns your 11-module truck dispatch course into an in-depth desktop app: a reader for every handbook page, an AI tutor, quizzes and flashcards, calculators, a US map lab, an hours-of-service planner, a load board simulator, broker-vetting and document labs, a dispatch board, a problems simulator, voice role-plays with an AI broker, speaking drills, and a full week simulation with three trucks.

You don't write code. Google AI Studio's **Build** mode writes it for you from the instructions in this kit. Your job is to set it up, paste the prompts one by one, and test.

Plan for about **6–10 evenings**: one or two build phases per evening, testing as you go.

---

## What's in the kit

| Folder / file | What it is |
|---|---|
| `README_FIRST.md` | This guide (for you) |
| `docs/SPEC.md` | The full product specification (for AI Studio to read) |
| `docs/PROMPTS.md` | 13 build prompts to paste in order, plus fix prompts |
| `content/` | All course content as data: 292 handbook pages, 128 quiz questions, 230 glossary terms, 12 drills, 18 role-plays, practice datasets, 103 cities, document hotspots |
| `public/assets/` | All course diagrams and photos |
| `public/pdfs/` | Your 11 handbooks (PDF): copy them in yourself, see Step 2 |

---

## Step 1 · Accounts and tools (one time, about 20 minutes)

1. **Google account** for AI Studio: open <https://aistudio.google.com> and sign in.
2. **GitHub account** (free): <https://github.com/signup>.
3. **GitHub Desktop** (free, easiest way to upload the kit): <https://desktop.github.com>. Install it and sign in with your GitHub account.
4. **Node.js LTS** (only needed later for the desktop installer): <https://nodejs.org>. Choose the LTS version and install with the default options.

---

## Step 2 · Put the kit on GitHub (about 10 minutes)

AI Studio can import a GitHub repository, so the app can read all the course files.

1. Put the kit together (the files were split because of upload size limits):
   - Unzip **Part 1** (`DispatchAcademy_Part1_core.zip`) to a simple place, e.g. `C:\Projects`. You get a folder `dispatch-academy-kit`.
   - Unzip **Part 2** and **Part 3** (`..._Part2_diagrams.zip`, `..._Part3_diagrams.zip`) into the **same** `C:\Projects` folder. Choose “Replace/merge” if asked. They fill `dispatch-academy-kit\public\assets\diagrams`.
   - Copy your **11 handbook PDFs** (the `Module_..._Handbook.pdf` files you already downloaded) into `dispatch-academy-kit\public\pdfs`. Keep the file names exactly as they are.
   - Check: `public\assets\diagrams` has 11 folders (`m00-01`, `m02` … `m11`) and `public\pdfs` has 11 PDFs.
2. Open **GitHub Desktop** → **File → Add local repository…** → choose the folder.
3. It will say the folder is not a repository: click **create a repository**. Name: `dispatch-academy`. Click **Create repository**.
4. Click **Publish repository**. You can keep it **private**. Wait until the upload finishes (about 105 MB).

> If the upload is slow or fails, see Troubleshooting → “Repository too big”.

---

## Step 3 · Import into Google AI Studio (about 5 minutes)

1. Go to <https://aistudio.google.com> → **Build**.
2. In the prompt box, click the **+ (Add files)** icon → **Import from GitHub**.
3. Connect your GitHub account when asked, and choose the `dispatch-academy` repository.
4. Wait until the files appear in the code panel. You should see `docs/`, `content/`, `public/`.
5. Turn on GitHub sync if offered, so every change is saved back to your repository.

---

## Step 4 · Build the app, phase by phase

Open `docs/PROMPTS.md`. For each prompt:

1. Copy the text inside the grey box (everything between the triple backticks).
2. Paste it into the AI Studio prompt box and press Enter.
3. Wait until it finishes. It may take several minutes and ask to install packages: allow it.
4. Test using the **Check** list under that prompt.
5. If something fails, use a **Fix prompt** from the end of `PROMPTS.md`. Be specific: which screen, what you clicked, what you saw.
6. Move to the next prompt only when the checks pass.

| Prompt | Builds |
|---|---|
| 0 | Foundation: layout, design, settings, data, AI connection |
| 1 | Learn: library, page reader, PDF viewer, search, notes |
| 2 | AI Tutor, module checks, generated quizzes, flashcards |
| 3 | Calculation engines, Toolbox, Map lab |
| 4 | Economics lab |
| 5 | Hours-of-service planner and ELD log exercise |
| 6 | Load board simulator |
| 7 | Broker vetting and fraud lab, Document lab |
| 8 | Role-play Studio (voice) and Drill Studio |
| 9 | Dispatch board and Problems & claims simulator |
| 10 | Week simulation (capstone game) |
| 11 | Progress, readiness, certificate, polish and full test |
| 12 | Desktop app (Electron) and installable web app |

**Tips that make a big difference**

- Keep prompts in order. Each phase builds on the one before.
- If AI Studio gets confused after many changes, start a new message with: “Re-read docs/SPEC.md section X and continue Phase N.”
- When something looks basic, use the “Too basic / looks like a demo” fix prompt.
- Inside AI Studio the AI features use AI Studio's own Gemini key, so you don't need to set anything up while building.

---

## Step 5 · Use it as a desktop app

You have two options. Start with A (easy), then do B if you want a real installer.

### Option A · Install as an app from the browser (easiest)

1. In AI Studio, click **Deploy** (Cloud Run) to get a web address for your app. Cloud Run may charge for heavy use; light personal use is usually small, but check the pricing shown before deploying.
2. Open that address in **Google Chrome** or **Microsoft Edge**.
3. Click the **Install** icon in the address bar (or menu → **Install Dispatch Academy**).
4. It now opens in its own window with a taskbar icon, and works offline for everything except AI (after Prompt 12).

### Option B · Real Windows installer (Electron)

1. In AI Studio, click **Download** (ZIP), or pull the latest version with GitHub Desktop.
2. Unzip to `C:\Projects\dispatch-academy`.
3. Open **Command Prompt** in that folder: in File Explorer, click the address bar, type `cmd`, press Enter.
4. Run these commands one at a time:

```
npm install
npm run desktop:dev
```

   The app opens in a desktop window. Close it when you've checked it works.

5. Build the installer:

```
npm run desktop:build
```

   The installer appears in the `release` or `dist` folder (the exact name is in `README-DESKTOP.md`, which Prompt 12 creates). Double-click it to install **Dispatch Academy**.

6. **Your Gemini API key (desktop only):** get a key at <https://aistudio.google.com/apikey>. In the app, open **Settings → AI** and paste it. It stays encrypted on your computer. Never share an app build or file that contains your key. Gemini API usage has free-tier limits; heavy voice role-plays may need a paid plan, so check your usage page.

---

## Step 6 · How to study with the app

A suggested routine for each module:

1. **Read** the module in Learn (diagrams open full size; “Open in PDF” shows the original page).
2. **Ask the tutor** whenever something is unclear (“Explain in Roman Urdu” helps for hard pages).
3. **Practise** in the matching lab (Map for M3, HOS for M4, Economics for M7, Load Board for M6, Vetting and Documents for M8–M9, Problems for M10).
4. **Speak:** do the module's drill in Drill Studio and its role-play in Role-play Studio until you score 7/10 or more.
5. **Test:** module check plus a generated quiz; flashcards daily.
6. After all modules: play the **Week Simulation**, then the **Capstone**, then complete the readiness checklist.

---

## Troubleshooting

**Repository too big / import fails.** Delete the folder `public/pdfs` from your copy, commit and push again with GitHub Desktop, and import again. The app still has all the content; only the “Open original PDF” button won't work until you add the PDFs back to the downloaded project on your computer before building the desktop version.

**AI Studio stops halfway or the preview is blank.** Send: “The preview is blank. Check the browser console errors, fix them, and tell me what was wrong.”

**AI features don't work in the desktop app.** Paste your API key in Settings → AI. Check your internet connection. Check the model names in Settings (if a model was retired, use the current Flash/Pro names shown in AI Studio).

**Microphone doesn't work.** Allow microphone access when Windows or the browser asks. In Windows Settings → Privacy → Microphone, allow desktop apps.

**`npm` is not recognized.** Node.js isn't installed or the window was opened before installing. Install Node.js LTS, then open a new Command Prompt.

**Numbers look wrong.** Use the “Numbers wrong” fix prompt with the exact inputs and the answer from your handbook.

---

## Important notes

- **Practice data:** Blue Line Transport, its trucks, drivers, brokers and loads are fictional. The OMNITECH documents (load #12354) are your real scans.
- **Snapshots:** diesel prices, DAT averages, ATRI and CargoNet figures are dated (September 2026). Update them in Settings → Market inputs.
- **Not legal or tax advice:** modules on law, claims, payments and Pakistan tax explain the rules for learning; confirm with qualified advisers before acting.
- **Your data stays on your computer:** progress, notes, recordings and role-play transcripts are saved locally. Use Settings → Data → Export to back them up.
