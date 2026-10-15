# Last Mile Heroes

A 3D onboarding game for partners of the **IOM South Sudan Core Pipeline (CP)**, on the
**SNFI** (shelter and non-food items) and **WASH** (water, sanitation and hygiene) tracks.

Partner field staff play their way through the partner journey in **7 short missions**,
10 to 15 minutes in all. They learn by doing: collect the right documents, check households,
build a request, collect and drive the kits, run a distribution and report back. It is not a
test. There is no pass or fail, and each mission gives 3 lives. Breaking one of the 8
critical rules (free aid, PSEA, data and so on) stops the mission with a short explanation
and its source.

This README is for the CP team. **You do not need to code** to share the game, change its
text, add or remove items, change colours or add the logos.

---

## 1. Open and share the game

The whole game is **one file: `index.html`** (about 0.8 MB). It works offline, with no
install and no internet connection.

- **Laptop:** double-click `index.html`. It opens in your browser (Chrome, Edge, Firefox or
  Safari).
- **Android phone:** send the file by email, WhatsApp or USB. Save it, then open it with
  Chrome.
- **iPhone:** the Files preview may not run the game. If it does not, play on a laptop or an
  Android phone, or put the file on an internal web page.
- **Share it** like any document: email, a shared drive, a USB stick. Rename it if you like
  (keep the `.html` ending).

**Progress is saved on the device, in that browser.** It stays when the page is closed. It is
lost if the player clears the browser's data, uses a private window, or moves to another
device. Nothing is sent anywhere.

### What players need to know

1. On the home screen, type your **name**, **organisation** and **state**, and choose your
   **track** (SNFI or WASH).
2. Play the missions in order on the map. A finished mission stays open to replay.
3. Settings on the home screen:
   - **Graphics: High or Low.** Low is smoother on phones and is the default on small
     screens.
   - **Relaxed pace** gives more time in the timed parts.
   - **Sound** on or off. The speaker button and the pause menu also mute it.
4. If the device has no 3D support, the game switches to a simple 2D view by itself.
5. Reduced motion settings on the device are respected: fewer animations, no shaking.

### Results for the CP team

On the map, **My report** shows:
- the score
- the stars per mission
- the topics to review, grouped by source section
- the badges

After all 7 missions:
- **Completion card:** name, organisation, state, track, score, stars, date and the logos. It
  is marked **"Training record, not a certification."** Use **Print or save as PDF**. On a
  phone, a screenshot works too.
- **Download results (CSV):** one row with the name, organisation, state, track, date,
  total score, total stars, and the stars and score per mission. Ask players to email you
  this file. To combine several, open them in Excel and paste the rows under one header.

The CSV can be downloaded at any time, even before all missions are done. Missions not
finished yet are left empty.

---

## 2. Before you edit: three rules

1. **Keep a copy** of the working `index.html` before you change anything.
2. Edit with a **plain text editor**:
   - Windows: Notepad
   - Mac: TextEdit, after **Format > Make Plain Text**
   - or the free VS Code

   Never use Word.
3. After each change, **save and reload the game** in the browser to check it. If the page
   stays blank, the last change broke something. Usually a comma or a quote is missing. Undo
   it.

## 3. Where the text lives: the CONTENT block

Open `index.html` in the text editor. Near the top is a block that starts with:

```
1. GAME CONTENT. The CP team edits text here. See README.md.
```

followed by `window.CONTENT = {`. **Everything players read is in this block**:
- missions, items, feedback and sources
- characters and critical rules
- acronyms, colours and settings

The game code further down only reads it.

Use your editor's **Find** (Ctrl+F or Cmd+F) to jump to the text you want to change, for
example `DDA validated` or `M4`.

### Writing text

- Change only what is **between the quotes**: `text: 'Signed beneficiary list'`.
- An apostrophe inside quotes needs a backslash in front: `'the partner\'s file'`.
- Keep the commas at the end of lines, and the brackets `{ } [ ]`.
- Keep feedback to **two short sentences** at most. Use plain English.
- `{deadline}`, `{report}`, `{kit}`, `{cluster}`, `{demo}` and `{ngo}` are filled in by the
  game with the player's track values. Keep them as they are.
- Acronyms in the `glossary` list are spelled out automatically the first time they appear
  in a mission.

### Every item has an `id` and a `ref`

- **`id`** (for example `D-03`, `E-21`, `K-05`) must be unique. When you add an item, give it
  a new id.
- **`ref`** is the source shown to the player, for example `'SOP §4.6.2'`. **Every item needs
  one.** The "Topics to review" list groups mistakes by `ref`.

## 4. Add or remove items

Each mission is one block in `missions: [ ... ]`, in map order. Inside it, items sit in lists.

| Mission | Lists you can edit | How many a run uses |
|---|---|---|
| 1 Get on the Pipeline | `docs` (documents, `good: true` = belongs in the file), `signup`, `events` | all good docs + `badPerRun` wrong ones; `eventsPerRun` events |
| 2 Needs Check | `households` (`kind`: count, priority, assisted, refuse), `events`, `trackEvents` | `householdsPerRun`; `eventsPerRun` + one track event |
| 3 Request Builder | `scenarios` (request cards), `slots` (form pieces, per track), `events` | one scenario of the player's track; `eventsPerRun` |
| 4 Warehouse Pickup | `kitCheck.intruders` (per track), `events`, `sign` | `eventsPerRun` |
| 5 Road to the Site | `first` (always first), `events` | `eventsPerRun` |
| 6 Distribution Day | `announce.items`, `stations`, `decoys`, `events` | see the numbers in the block |
| 7 Report Back | `report.pieces`, `firstCall`, `calls`, `pdmCall` (per track), `finales` | all good pieces + `badPerRun` wrong ones; `callsPerRun`; one finale |

### Add an item

Copy an existing item of the same list, from its `{` to its `},`. Paste it right below.
Then change the `id`, the text and the `ref`.

Example: a new event call. Copy this shape:

```js
{ id: 'E-60', speaker: 'majok', prompt: 'The question the player sees?',
  options: [
    { text: 'The right answer.', correct: true },
    { text: 'A wrong answer.', why: 'One short sentence on why it is wrong.' }
  ], explain: 'One short sentence shown when the player is right.', ref: 'SOP §4.6' },
```

- `speaker` is one of the `characters`: `you`, `nyakuoth`, `lual`, `deng`, `mabior`,
  `majok` or `ayen`.
- Put `correct: true` on exactly one option.
- To make an option break a critical rule, give it `critical: 'R1'` (or R2 to R8) instead of
  `why`. Choosing it stops the mission and shows that rule.
- Use `track: 'SNFI'` or `track: 'WASH'` on a request card (`scenarios`) to show it on one
  track only.

### Remove an item

Delete the whole item, from its `{` to its `},`. Keep enough items for the run:
- at least `eventsPerRun` events
- at least `badPerRun` wrong documents or report pieces
- at least one request card per track

### Hide or add a mission

- **Hide a mission:** set `playable: false` in its block. It shows as "Coming soon" on the
  map. The unlock order, the final report, the card and the CSV skip it. Nothing else needs
  changing.
- **A new mission** needs game code as well as content (see Developers below). Until the
  code exists, the map does not show it.

## 5. Change colours

- `theme`: the IOM blue and the interface colours.
- `ngo.color`: the colour of the player's fictional NGO.
- `tracks.SNFI.color` and `tracks.WASH.color`: the track colours.
- `color` in each mission: its colour on the map.

Colours are hex codes such as `'#0033A0'` (IOM blue). Change the code between the quotes.
Any "colour picker" website gives you the code.

## 6. Add the official logos

Until logos are added, the home screen and the completion card show dashed boxes that say
"IOM logo" and "SLSC Cluster logo" or "WASH Cluster logo". To add them:

1. Get each logo as an **SVG or PNG under 100 KB**. Larger images make the file heavy.
2. Turn each one into a **data URI**: a long line of text that starts with
   `data:image/png;base64,` or `data:image/svg+xml;base64,`. Search for an "image to data
   URI" converter, or ask IT.
3. In the CONTENT block, find `logos:` and paste each one between the quotes:

```js
logos: {
  iom:  'data:image/png;base64,iVBORw0KGgo...',   // home screen and completion card
  slsc: 'data:image/png;base64,...',              // completion card, SNFI track
  wash: 'data:image/png;base64,...'               // completion card, WASH track
},
```

4. Save and reload. Check the home screen and a completion card.

## 7. Game settings

In `settings`:
- `livesPerMission`: the lives per mission
- `stars`: the accuracy needed for 1, 2 and 3 stars
- `relaxedPaceFactor`: how much slower the timed parts run in relaxed pace
- points: `pointsPerCorrect` and the streak bonus

Timed parts:
- Mission 5: `drive.seconds`
- Mission 6: `rush.seconds`
- Mission 7: `report.seconds`

`meta.version` appears on the card and in the CSV. **Raise it** when you change content, so you
can tell results from different versions apart.

`meta.cardNote` is the line on the completion card. `meta.mockLabel` is the label shown on
mock forms.

> **Changing `settings.storageKey` erases every player's progress** on their device. Leave it
> as it is.

## 8. When the SOP is endorsed

The game uses the **Draft 1** SOP (September 2026). When the endorsed version arrives:
1. Read `SKIPPED.md`. It lists every conflict between the sources and what the game
   teaches.
2. Use `question_map.md` to find every item that quotes a section that changed.
3. Edit those items, then raise `meta.version`.

## 9. What is in this folder

| Path | What it is |
|---|---|
| `index.html` | **The game.** Everything is inside: content, the Three.js 3D library and the code. |
| `README.md` | This guide |
| `LastMileHeroes_Guide.pdf` | Player guide and answer key: how to play and pass every mission, with all the right answers (A5 booklet) |
| `question_map.md` | Every item with its mission, track and source section |
| `SKIPPED.md` | What was left out on purpose, and how source conflicts were settled |
| `SOURCES.md` | The source documents and which one wins |
| `source/` | The source documents (SOP, agreement, annexes, forms) |
| `src/` | The readable code the game is built from (developers) |
| `tools/` | Build and automated test scripts (developers) |
| `reference/` | Pipeline Runner v2, the earlier game (style reference only) |

---

## Developers

You need Node.js 18 or later.

```
cd tools
npm install                 # Three.js, esbuild, Playwright (development only)
node build.mjs              # writes ../index.html from ../src
node question-map.mjs       # regenerates ../question_map.md from src/content.js
node answer-key.mjs         # regenerates ../LastMileHeroes_Guide.pdf (guide and answer key)
```

- **Content edited directly in `index.html`?** Run `node build.mjs --keep-content`. It copies
  the CONTENT block back to `src/content.js` before building, so nothing is lost.
- **Code:** `src/game/*.js` are joined in name order:
  - `00` core
  - `10` graphics
  - `20` world map
  - `30` mission framework
  - `40` shared mission kit
  - `51`–`60` the missions
  - `85` end screens
  - `90` screens and boot
- **A new mission:**
  - add a block to `missions` in `src/content.js`
  - add `src/game/5x-name.js` defining `Missions.<id> = { start: function (M, ctx) { ... } }`
  - the map and the unlock order follow `C.missions` automatically
- **Automated play-tests** use the Chromium that Playwright finds:
  - `node autoplay.mjs --mission M4 --size phone --gfx low --track WASH --mode perfect`
    - missions: M1, M2, M3, M4, M5, M7
    - modes: `perfect` or `mistakes`; M7 also has `late`
  - `node playtest.mjs --size phone --gfx low --track SNFI --mode critical` (Mission 6, with
    performance figures)
  - `node endscreens.mjs --size phone --state all`: final report, card, print view and CSV
  - `node matrix.mjs --jobs 4 --shots <dir>`: every mission × track × phone/laptop ×
    High/Low/2D, plus critical and mistake runs; prints a results table
  - `node perf.mjs --mission M5 --throttle 6`: main-thread ms per frame, draw calls and
    triangles on a throttled phone profile
- **Test hooks:** `?gfx=2d` forces the 2D fallback, and `?timescale=2` speeds up game time.
  `window.LMH` exposes read-only state for the scripts.
- **Screenshots** go to `production/qa/evidence/last-mile-heroes/`.
