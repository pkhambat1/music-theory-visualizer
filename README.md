# Music Theory Visualizer

Ever wonder how scales, modes, and chords actually relate to each other? This app makes it click — literally. Pick a key, pick a mode, and watch the connections light up across the chromatic scale. Hover a chord to see exactly which notes build it. Click to hear it on a piano.


## Using the app

### Pick your key and mode

Use the **Key** tag and **Mode** dropdown in the header. The whole visualization updates instantly. A short description below the dropdown explains the character of each mode (e.g. "Minor with a raised 6th — jazzy and warm" for Dorian).

### Explore the rows

The visualization has three connected rows, top to bottom:

1. **Chromatic Scale** — all 12 notes in order. Drag left or right to change the root note, or use the arrow buttons. Highlighted cells show which chromatic notes belong to your current mode.

2. **Mode Scale** — the notes of your selected mode, with curved lines connecting each one back up to the chromatic row. Scale degree numbers appear below each cell. Click any note to hear it.

3. **Diatonic Chords** — chords built by stacking thirds from your mode (I, II, III, IV, V, VI, VII). A suffix after the roman numeral indicates quality: "m" for minor, "°" for diminished, "+" for augmented, and no suffix for major.

### Hover a chord

Hover over any chord in the bottom row to see:

- **Lines** connecting the chord to its component notes in the mode row, with **interval labels** (1, 3, 5, etc.) on each line
- **A chord scale context row** above the chromatic row, showing how the chord tones relate to the chord root's major scale — altered tones display the direction of alteration (e.g. `E♭ ← E` for a flattened note)
- **Highlighted cells** in the chromatic row showing the chord tones in context of all 12 notes

### Play audio

- **Click any note** in the mode row to hear it.
- **Click any chord** in the diatonic row to hear all its notes together.
- Toggle the **Arpeggiate** button in the header to play chord notes one at a time.

### Add chord extensions

Click the **three-dot icon** on any chord cell to open the extensions popover. Available extensions include maj, m, dim, aug, sus2, sus4, 6, 7, maj7, add2, add4, add9, 9, maj9, 11, and 13. Conflicting extensions are automatically disabled (e.g. selecting sus2 disables m and maj).

When an extension modifies a chord, the hover lines show a visual diff:
- **Solid lines** — notes kept from the original chord
- **Dashed lines** — notes removed by the extension
- **New lines** — notes added by the extension

Extension pills appear below the chord numeral. You can also pick a **bass note** (slash chord) from the popover — e.g. selecting V as bass on a I chord creates I/V. Use **Clear** in the popover to reset a single chord, or **Clear all extensions** (top-right of the diatonic row) to reset all chords.

---

## Contributing

### Setup

You'll need [Node.js](https://nodejs.org/) v18 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint with ESLint |

### Tech stack

React 18, TypeScript 5.6 (strict mode), Vite 5, Tailwind CSS 3, Tone.js (Salamander piano samples), keen-slider, d3-scale-chromatic

### Project layout

- `src/components/` — React components. `VisualizerPanel` is the main orchestrator. `ui/` has reusable primitives (Button, Dropdown, MultiSelect, Popover, Pill, Tag).
- `src/models/` — Core data model classes: `Note`, `Accidental`, `Mode`, and the `Connection` hierarchy (`Connection`, `StaticConnection`, `IntervalConnection`, `DiatonicConnection`, `RemovedConnection`, `AddedConnection`, `BassConnection`). Barrel-exported from `index.ts`.
- `src/lib/` — Pure logic. `music/` has mode, chord, scale, interval, and spelling functions. `hoverConnections.ts` builds hover line connections. `bezier.ts` handles SVG path math. `colors.ts` centralizes the d3-derived color palette. `notes.tsx` defines the chromatic scale and note rendering.
- `src/hooks/` — Custom hooks: `useModeTones` (mode note computation + spelling), `useChordExtensions` (extension/slash bass state), `useChordHover` (hover state + highlight pairs), `useContainerMeasure` (ResizeObserver wrapper).
- `src/types/` — Type aliases (`PitchClass`, `NoteIndex`, `Interval`, `Letter`) and geometry types (`Point`, `CellLink`, `ChordHighlightPair`). Also defines `Extension`, `ChordQuality`, `ChordDegreeState`, etc. Barrel-exported from `index.ts`.
- `tests/` — Unit tests (vitest).

### Data model

Two class families in `src/lib/`.

#### `Note` (`src/models/Note.ts`)

A musical note: letter (`Letter` type: `A`–`G`), accidental (`Accidental` class instance — `SHARP`, `FLAT`, or `NATURAL`), and octave (integer).

| Method | Returns | Example |
|---|---|---|
| `label()` | Note name without octave | `"C#"`, `"E♭"` |
| `toDisplay()` | Full name with octave (unicode) | `"C#4"`, `"E♭3"` |
| `toToneString()` | ASCII for Tone.js playback | `"C#4"`, `"Eb3"` |
| `equals(other)` | Structural equality | — |

#### Connection hierarchy (`src/models/`)

Lines drawn between UI elements in the SVG overlay. Rendering branches on `instanceof`, no string discriminants.

| Class | Extends | Fields | Role |
|---|---|---|---|
| `Connection` (abstract) | — | `from: Point`, `to: Point` | Base for all lines |
| `StaticConnection` | `Connection` | — | Plain line, no musical data (chromatic → mode) |
| `IntervalConnection` (abstract) | `Connection` | `intervalSemitones: number` | Line carrying a musical interval |
| `DiatonicConnection` | `IntervalConnection` | — | Chord tone (diatonic row → mode row) |
| `RemovedConnection` | `IntervalConnection` | — | Tone dropped by an extension |
| `AddedConnection` | `IntervalConnection` | — | Tone introduced by an extension |
| `BassConnection` | `IntervalConnection` | — | Slash chord bass note |

### Architecture notes

See [CLAUDE.md](./CLAUDE.md) for detailed architecture docs: overflow system, line drawing, hover state management, extension system, color system, and code conventions.

## License

MIT
