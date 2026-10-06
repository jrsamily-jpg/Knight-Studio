# Knight Studio

A browser-based chess studio with adjustable AI opponents, guided coaching, puzzles, and game review.

[Open the hosted app](https://knight-studio-jayden.jrsamily.chatgpt.site) (owner access required).

## Features

- Four AI difficulty levels with local search, alpha-beta pruning, capture extensions, and positional evaluation.
- Teaching mode with explanations, alternative moves, and hint arrows.
- Click or drag to move, legal-move highlights, board flipping, optional sounds, and captured-piece counts.
- Five checkmate puzzles and six chess lessons.
- Clocks with optional increments, pause/resume, and takebacks.
- Same-device two-player mode.
- Game review, PGN export, and FEN/PGN import.
- Device-local autosave and a library of up to 30 games.

The custom engine's difficulty names are not official chess ratings. Coaching uses rules and search results without an external AI service. There is no online multiplayer or cross-device synchronization. Practice clocks pause during review, dialogs, and when the tab is hidden.

## Run locally

Serve the `dist` folder over HTTP so browser modules and the engine worker can load:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 in a modern browser. No dependency installation or build step is required. Optional Google Fonts have local fallback fonts.

## Test

Requires Node.js 20 or newer:

```sh
npm test
```

Tests cover chess rules, tactical search, puzzles, clock increments, saved games, mode transitions, and analysis cancellation. Application-state tests use a minimal DOM fixture; they do not replace visual browser testing.

## Controls

- Click a piece and destination, or drag a piece.
- **H**: hint.
- **F**: flip board.
- **Left / right arrows**: review moves.
- **Escape**: clear selection or hint.

## Source layout

- `dist/index.html`, `dist/style.css`: interface and styling.
- `dist/app.js`: interactions, coaching, clocks, puzzles, and persistence.
- `dist/engine.js`: search engine and worker.
- `dist/session.js`: archive, increment, and captured-piece helpers.
- `dist/chess.js`: vendored chess.js 1.4.0 rules library.
- `tests.mjs`, `gameplay-tests.mjs`: engine and application-state tests.

## Third-party license

chess.js uses the BSD 2-Clause license; see [dist/CHESS-LICENSE.txt](dist/CHESS-LICENSE.txt).
