# Pipeline Runner

A training game on the IOM South Sudan SNFI + WASH Core Pipeline (CP): the SOP workflow, roles, forms, buffer logic, kits and the CP budget tool logic.

Version 2 is a set of seven short **missions** played in a small 3D (isometric) world: you drive trucks, catch tasks, stamp forms, run a warehouse, pack kits, predict budget changes and lead an emergency convoy. Very few classic quiz questions remain.

Players: cluster partners who request from the pipeline, and the IOM CP team (pipeline, warehouse, supply chain). Use it for onboarding (first play) and refreshers (replay). Content shuffles on every run.

Sources: `../source/IOM_SSD_Core_Pipeline_SOP_-_Draft_1_8.docx` and `../source/CP_Budget_Tool_v2_FINAL.xlsx`. Every playable item cites its SOP section or budget sheet (see `question_map.md`).

## Files

| File | What it is |
|---|---|
| `index.html` | The game: layout, styles, 3D drawing and game logic. No need to touch it to change text. |
| `content.js` | All game content: settings, colours, characters, critical rules and the seven missions. |
| `question_map.md` | Every playable item with its mission and source section. |
| `SKIPPED.md` | What was left out and why. |
| `tools/make_question_map.js` | Regenerates `question_map.md` from `content.js` (optional, needs Node.js). |

## How to open it

1. Keep `index.html` and `content.js` in the same folder.
2. Double-click `index.html`. It opens in any modern browser (Edge, Chrome, Firefox, Safari).
3. No install, no internet, no server: it works offline. Desktop first; it also works on tablets.

## The seven missions

| # | Mission | How it plays | What it teaches |
|---|---|---|---|
| 1 | The Journey | Click signposts in the right order; the truck drives there | The nine CP steps, plus one sub-process (review, release, receipt, onboarding...) |
| 2 | Who Does What | A task card drops; click the right desk before it lands (keys 1 to 6) | Who owns each task: CP team, CP Cluster Focal Point, Supply Chain, Warehouse, Cluster, Partner |
| 3 | Spot the Error | Stamp each form APPROVE, or click the problem line and stamp RETURN | Request, release, transfer, receipt, partner file, report and complaints rules |
| 4 | Buffer Watch | Run the stock month by month; pick an action for the band; phone-call events | Buffer formula, the three bands and their actions, 4-month lead time |
| 5 | Kit Builder | Items ride a conveyor belt; drop each in the right kit box (keys 1 to 3) | SNFI, emergency shelter and WASH kit contents, endorsing cluster |
| 6 | Budget Builder | Warm-up sliders, then predict which 3D budget bars grow when one input changes | How the budget tool links households, kit mix, prices, staff, PDM and travel to the budget |
| 7 | Boss Convoy | Drive a convoy; each checkpoint is a branching decision | Mixed emergency scenario (one of three, random) |

Shared rules:
- **3 lives per mission.** A wrong move costs a life and shows why, with the source section.
- **Critical rules** (in `content.js`, `criticalRules`) stop the mission at once, with an explanation.
- **Points:** 100 per right move plus a streak bonus.
- **Map:** missions unlock in order on first play; once all 7 are done, all stay open.
- **End:** final report with score, stars per mission, weak areas by SOP section, badges and rank. Passing (80% overall by default) unlocks a printable completion card with name, date and score.
- **Relaxed pace** (home screen or map) slows the falling cards and the conveyor belt.
- **Progress** is saved in the browser's localStorage. If storage is blocked, the game still works but forgets progress on reload. "Reset progress" on the map clears it.

## Editing content

Open `content.js` in a text editor (Notepad, VS Code). Edit only the text between quotes, keep commas and brackets, save, reload the game.

If the page goes blank after an edit, a comma or quote is probably missing. Undo the last change, or run `node tools/make_question_map.js .`, which reports the broken line.

Tips:
- An apostrophe inside single quotes needs a backslash: `'Grace\'s request'`.
- Acronyms listed in `glossary` are spelled out automatically the first time they appear in a mission. Add new ones there.
- Every item has an `id` and a `ref` (source shown to players; weak areas are grouped by it). Keep ids unique.
- To remove an item, delete its `{ ... },` block. Keep at least as many items as the mission's "per run" number.
- To add an item, copy one of the same mission, give it a new id and edit it. Then update `question_map.md` (`node tools/make_question_map.js .`).

### Mission data, by type

**route** (Mission 1): `routes: [{ id, title, prompt, stops: [...in order...], explain, ref, always }]`. Up to 9 stops per route. `routesPerRun` sets how many routes a run has; `always: true` keeps a route in every run. Keep stop labels short (under 45 characters).

**catch** (Mission 2): `desks: [{ role, char }]` (up to 6) and `tasks: [{ id, task, role, ref }]`. Each task's `role` must match a desk `role` exactly. `cardsPerRun`, `fallSeconds`.

**inspect** (Mission 3): `docs: [{ id, title, subtitle, fields: [{ label, value }], explain, ref }]`. A form has **at most one** line with `error: true` and a `why`. Add `critical: 'CR1'` to that line if approving the form should stop the mission. Mark a form with no problem `clean: true`. `docsPerRun` (each run includes at least one clean form).

**buffer** (Mission 4): `months`, `actions` (button labels), `bandFeedback` (text shown after each month), `events: [{ id, speaker, prompt, options: [{ text, correct, critical, why }], explain, ref }]`, `eventMonths`, `eventsPerRun`. Consumption and lead time come from the top-level `buffer` block (SOP §6). The `sim` block holds game simplifications (start stock, delivery size, demand spike, rationing effect); the game tells players these are simplifications.

**pack** (Mission 5): `boxes: [{ id, label, color }]` (3), `items: [{ id, name, kits: [box ids], color, why }]`, `itemsPerRun`, `beltSeconds`, and one `bonus` card (same shape as a buffer event).

**budget** (Mission 6): `bars` (budget categories), `model` (kit cost and weight from the Kits sheet, rates from Other Costs, an imaginary base project), `challenges: [{ id, prompt, change, explain, ref }]`. The game calculates which bars grow, so the answer always follows the model. Supported `change` keys: `hhFactor`, `priceUp: { kit, pct }`, `shift: { from, to, hh }`, `staffPct`, `pdmShare`, `extraTrips`, `months`. Bars show size only; no USD figures are displayed.

**convoy** (Mission 7): `scenarios: [{ id, title, start, nodes: { id: { speaker, text, ref, visual, options: [{ text, correct, critical, feedback, next }] } } }]`. Give each node exactly one correct option. `next: null` ends the run. A wrong, non-critical option costs a life and continues to its `next` node, so it can lead to a "consequence" node (see `a3b` in BOSS-A). Up to 8 checkpoints per scenario.

### Characters

In `characters` (names are fictional). Change `name` and `role` freely. The avatar is drawn from `look`:
- `skin`, `hairColor`, `shirt`, `bg`: any colour code
- `hair`: `short`, `long`, `bun`, `headwrap`, `cap` or `bald`
- `accessory`: `none`, `glasses`, `hardhat`, `lanyard`, `clipboard` or `tablet`

### Critical rules

In `criticalRules` (CR1 to CR6). Edit the text freely. To add one, add `CR7: { title, rule, ref }` and point an option or form line to it with `critical: 'CR7'`. The list is a first draft and can change with the SOP.

## Settings and colours

All in `settings` at the top of `content.js`:

| Setting | Default | Meaning |
|---|---|---|
| `passMark` | `0.80` | Overall accuracy to pass and unlock the completion card. |
| `livesPerLevel` | `3` | Lives per mission. |
| `pointsPerCorrect` | `100` | Points per right move. |
| `streakBonus`, `streakBonusMax` | `20`, `100` | Bonus per move in a streak, and its cap. |
| `stars` | `0.5 / 0.8 / 1.0` | Mission accuracy for 1, 2 and 3 stars. |
| `relaxedPaceFactor` | `1.7` | How much slower "Relaxed pace" makes the timed missions. |

`ranks` sets rank titles and thresholds (Trainee, Pipeline Pro at 80%, Pipeline Master at 95%). `badges` lists the badges; their `rule` values are explained in the comment above them.

**Colours:** the `theme` block in `content.js` (IOM blue `#0033A0` is the base; `grass`, `road` and `water` colour the 3D world). Each mission's `color` sets its accent. Fallback values sit at the top of the `<style>` block in `index.html`.

## Results and a future leaderboard

- **Export:** on the Final report, "Export results (JSON)" downloads the summary, best and latest results per mission, badges, and every attempt.
- **Data shape:** each attempt is a `ResultRecord` built in `makeResultRecord()` in `index.html`: player, mission, variant (route, stream or scenario played), status (`completed`, `failed`, `critical`), critical rule, score, right moves, total moves, accuracy, stars, lives lost, best streak, mistakes (item id and source), relaxed pace, start and finish times, content version.
- **Adding a backend later:** in `endLevel()` in `index.html`, after `d.results.push(rec)`, send `rec` to your service (for example `fetch(url, { method: 'POST', body: JSON.stringify(rec) })`). A leaderboard can rank players by summed best `score` per mission.

## Testing after edits

1. Open `index.html` and play the mission you changed.
2. Finishing all missions once unlocks every mission for quick checks.
3. With Node.js, `node tools/make_question_map.js .` confirms `content.js` loads and refreshes the map.

The previous quiz-style version (v1) is in the repository history (commit `3d83df0`).

## Credits

Built for the IOM South Sudan SLSC Cluster and Core Pipeline team. Content: IOM South Sudan Core Pipeline SOP (Draft 1, September 2026) and CP Budget Tool v2 (October 2026). Training record only, not an official certification.
