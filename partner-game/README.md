# Last Mile Heroes (prototype)

A 3D partner onboarding game for the IOM South Sudan Core Pipeline (SNFI and WASH).
This is the **Step 2 prototype**: one mission, **Mission 6: Distribution Day**, is fully playable.
The other six missions show on the map and arrive in the full build.

## Open it

Double-click `index.html`. It is one self-contained file: it works offline, with no install
and no internet. Share it by email or USB stick.

## What is in this folder

| Path | What it is |
|---|---|
| `index.html` | The game. Everything is inside: content, Three.js 3D library, code. |
| `src/` | Readable source the game is built from (developers only). |
| `tools/` | Build and automated play-test scripts (developers only, need Node.js). |
| `source/` | The source documents the content comes from (SOP, agreement, annexes, forms). |
| `reference/` | Pipeline Runner v2, the earlier game (style reference only). |
| `SOURCES.md` | Which source wins, and the known conflicts. |

The full README for the CP team (editing text, items, colours and logos), the question map
and SKIPPED.md come with the full build (Step 3).

## Developers

```
cd tools
npm install            # Three.js, esbuild, Playwright (dev only)
node build.mjs         # writes ../index.html from ../src
node playtest.mjs --size phone --gfx low --track SNFI --mode perfect
```

`node build.mjs --keep-content` rebuilds while keeping a CONTENT block edited directly in
`index.html` (it is copied back to `src/content.js`).
