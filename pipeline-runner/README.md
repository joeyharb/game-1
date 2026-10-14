# Pipeline Runner

A training game on the IOM South Sudan SNFI + WASH Core Pipeline (CP): the SOP workflow, roles, forms, buffer logic, kits and the CP budget tool logic.

Players are cluster partners who request from the pipeline and the IOM CP team (pipeline, warehouse, supply chain). It works for onboarding (first play) and refreshers (replay): questions shuffle on every run.

Sources: `../source/IOM_SSD_Core_Pipeline_SOP_-_Draft_1_8.docx` and `../source/CP_Budget_Tool_v2_FINAL.xlsx`. Every question cites its SOP section or budget sheet (see `question_map.md`).

## Files

| File | What it is |
|---|---|
| `index.html` | The game: layout, styles and game logic. No need to touch it to change text. |
| `content.js` | All game content: settings, colours, characters, critical rules, levels, questions, answers, explanations, sources. |
| `question_map.md` | Every question with its level and source section. |
| `SKIPPED.md` | What was left out and why. |
| `tools/make_question_map.js` | Regenerates `question_map.md` from `content.js` (optional, needs Node.js). |

## How to open it

1. Keep `index.html` and `content.js` in the same folder.
2. Double-click `index.html`. It opens in any modern browser (Edge, Chrome, Firefox, Safari).
3. That's it: no install, no internet, no server. It works offline.

To share it, zip the folder, or put both files on a shared drive or intranet page. Desktop first; it also works on tablets.

## How the game works

- **7 levels**, one per topic, 2 to 3 minutes each. A full run takes 10 to 15 minutes.
  1. The Journey: put workflow steps in order (drag and drop, or arrow buttons)
  2. Who Does What: match tasks to roles and sign-off owners
  3. Spot the Error: click the mistakes on a mock form
  4. Buffer Watch: read a stock gauge and choose the band or action
  5. Kit Builder: pack the kits, SNFI vs WASH
  6. Budget Logic: how the budget tool goes from households and kit shares to cost per household
  7. Boss Round: a branching emergency scenario (one of three, picked at random)
- **3 lives per level.** A wrong answer costs a life. Lose all three and the level stops.
- **Critical rules.** Breaking one ends the level at once, with an explanation. The list is in `content.js` (`criticalRules`) and on the home screen.
- **Points:** 100 per right answer plus a streak bonus.
- **Feedback** after every answer: right or wrong, why, and the source section.
- **Map:** levels unlock in order on first play. Once all 7 are done, all stay open.
- **End:** final report with total score, stars per level, weak areas by SOP section, badges and rank. Passing (80% overall by default) unlocks a printable completion card with name, date and score.
- **Timer:** off by default; the player can switch it on from the home screen or map.
- **Progress** (name, best scores, stars, badges) is saved in the browser's localStorage. If the browser blocks storage, the game still works but forgets progress on reload. "Reset progress" on the map clears it.

## Editing content

Open `content.js` in any text editor (Notepad, VS Code). Edit only the text between quotes, keep the commas and brackets, save, then reload the game.

If the game shows a blank page after an edit, a comma or quote is probably missing. Undo the last change, or paste the file into a JavaScript checker such as https://jshint.com to find the line.

Text tips:
- An apostrophe inside single quotes needs a backslash: `'Grace\'s request'`.
- Acronyms listed in `glossary` are spelled out automatically the first time they appear in a level. Add new ones there.

### Change a question

Find it by its `id` (for example `L4-02`, see `question_map.md`) and edit `prompt`, the answers, `explain` (shown after every answer) or `ref` (the source shown to the player).

### Remove a question

Delete the whole `{ ... },` block for that question. Keep at least as many questions in a level as its `questionsPerRun`.

### Add a question

Copy an existing question of the same type, paste it into the same level's `questions: [ ... ]` list, give it a new unique `id`, and edit it. Add a row to `question_map.md` (or run `node tools/make_question_map.js .`).

Fields used by every question:

| Field | Meaning |
|---|---|
| `id` | Unique, e.g. `L5-13`. |
| `type` | `choice`, `order`, `match` or `spot`. |
| `speaker` | A character id from `characters` (e.g. `'deng'`). |
| `prompt` | The question, shown in the speech bubble. |
| `explain` | Explanation shown after the answer. |
| `ref` | Source, e.g. `'SOP §4.5'` or `'Budget sheet (B.9)'`. Weak areas are grouped by this text. |
| `always: true` | Optional. Include the question in every run. |

Per type:

**choice**: one right answer, or several with `multi: true`.
```js
{
  id: 'L4-99', type: 'choice', speaker: 'peter',
  prompt: 'Which band?',
  visual: { type: 'gauge', stream: 'SNFI', stock: 60000, hideBands: true },   // optional
  options: [
    { text: 'Consuming buffer', correct: true },
    { text: 'Healthy', why: 'Shown when this wrong answer is picked.' },
    { text: 'Release now', critical: 'CR2', why: '...' }   // picking it breaks a critical rule
  ],
  explain: '...', ref: 'SOP §6'
}
```
Optional: `layout: 'tiles'` shows options as tiles (used in Kit Builder). `visual` can be a `gauge` (stream `SNFI` or `WASH`, stock in kits, `hideBands` hides colours until answered) or a `formula`: `{ type: 'formula', parts: ['1,000 HH', '×', '50%', '=', '?'] }`.

**order**: list `items` in the correct order; the game shuffles them.
```js
{ id: 'L1-99', type: 'order', speaker: 'achol', prompt: '...', items: ['First', 'Second', 'Third'], explain: '...', ref: '...' }
```

**match**: every `pairs[].role` must appear exactly as written in `roles`.
```js
{ id: 'L2-99', type: 'match', speaker: 'lual', prompt: '...',
  roles: ['CP team', 'Warehouse'],
  pairs: [ { task: 'Raises the SWR', role: 'CP team' }, { task: 'Dispatches', role: 'Warehouse' } ],
  explain: '...', ref: '...' }
```

**spot**: a mock form. Mark wrong fields with `error: true` and a `why`. Add `critical: 'CR1'` to a wrong field if *missing* it should end the level.
```js
{ id: 'L3-99', type: 'spot', speaker: 'deng', prompt: '...',
  doc: { title: 'Release to partner', subtitle: 'Training example',
    fields: [
      { label: 'Dispatch authority', value: 'Email', error: true, critical: 'CR1', why: '...' },
      { label: 'Partner signature', value: 'At collection' }
    ] },
  explain: '...', ref: '...' }
```

### Boss round scenarios

Level 7 uses `scenarios` instead of `questions`. Each scenario has a `start` node and `nodes`. Each node has a `speaker`, `text`, `ref`, optional `visual`, and `options`. Each option has `text`, `feedback`, `next` (the next node id, or `null` to end), and either `correct: true` or, for a rule break, `critical: 'CRx'`. Wrong, non-critical options cost a life and continue to their `next` node, so you can send them to a "consequence" node (see `a3b` in scenario BOSS-A). Give each node exactly one correct option.

### Levels

Each level has `title`, `station` (map label), `color`, `host` (character), `intro`, `howTo` and `questionsPerRun` (how many questions are drawn per run). Lowering `questionsPerRun` shortens the level.

### Characters

In `characters`. Names are fictional. Change `name` and `role` freely. The avatar is drawn from `look`:
- `skin`, `hairColor`, `shirt`, `bg`: any colour code
- `hair`: `short`, `long`, `bun`, `headwrap`, `cap` or `bald`
- `accessory`: `none`, `glasses`, `hardhat`, `lanyard`, `clipboard` or `tablet`

To add a character, copy one, give it a new id (e.g. `mary: { ... }`) and use that id as a `speaker`.

### Critical rules

In `criticalRules` (CR1 to CR6). Edit the text freely. To add one, add `CR7: { title, rule, ref }` and point a choice option, boss option or spot field to it with `critical: 'CR7'`. The list is a first draft and can change with the SOP.

## Changing settings

All in `settings` at the top of `content.js`:

| Setting | Default | Meaning |
|---|---|---|
| `passMark` | `0.80` | Overall accuracy to pass and unlock the completion card (0.80 = 80%). |
| `livesPerLevel` | `3` | Lives per level. |
| `pointsPerCorrect` | `100` | Points per right answer. |
| `streakBonus`, `streakBonusMax` | `20`, `100` | Bonus per answer in a streak, and its cap. |
| `stars` | `0.5 / 0.8 / 1.0` | Level accuracy for 1, 2 and 3 stars. |
| `timer.enabledByDefault` | `false` | Start with the timer on. |
| `timer.secondsPerQuestion`, `secondsPerPuzzle` | `45`, `90` | Time per choice question, and per order/match/spot puzzle. |

`ranks` sets the rank titles and thresholds (Trainee, Pipeline Pro at 80%, Pipeline Master at 95%). `badges` lists the badges; their `rule` values are explained in the comment above them.

## Changing colours

- **Main colours:** the `theme` block in `content.js` (IOM blue `#0033A0` is the base). Change a hex code and reload.
- **Level colours:** each level's `color` in `content.js`. Text on top switches automatically between white and dark for readability.
- The same values exist as fallbacks at the top of the `<style>` block in `index.html` (`:root`), used only if `content.js` has no `theme`.

## Results and a future leaderboard

- **Export:** on the Final report, "Export results (JSON)" downloads the player's summary, per-level best and latest results, badges, and every attempt.
- **Data shape:** each attempt is a `ResultRecord` built in `makeResultRecord()` in `index.html`: player, level, scenario, status (`completed`, `failed`, `critical`), critical rule, score, correct, answered, accuracy, stars, lives lost, best streak, mistakes (question id and source), timer on/off, start and finish times, content version.
- **Adding a backend later:** in `endLevel()` in `index.html`, after `d.results.push(rec)`, send `rec` to your service (for example `fetch(url, { method: 'POST', body: JSON.stringify(rec) })`). A leaderboard can then rank players by summed best `score` per level. Nothing else in the game needs to change.

## Testing after edits

1. Open `index.html`, play the level you changed, and check the new question shows and its right answer is accepted.
2. To reach a level quickly, finish the earlier levels once, or use a browser where all levels are already unlocked.
3. If you have Node.js, `node tools/make_question_map.js .` also confirms `content.js` loads without syntax errors.

## Credits

Built for the IOM South Sudan SLSC Cluster and Core Pipeline team. Content: IOM South Sudan Core Pipeline SOP (Draft 1, September 2026) and CP Budget Tool v2 (October 2026). Training record only, not an official certification.
