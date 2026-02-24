# Music Theory Visualizer

## Project Overview

Interactive React app for visualizing music theory — modes, diatonic chords, note relationships, and chord extensions. Users select a root note and mode, then explore how chromatic, mode, and chord tones relate through connected visual rows with SVG line overlays. Audio playback is powered by Tone.js with a lazy-loaded piano sampler (supports arpeggiated playback). Designed for **beginners** with contextual labels, mode descriptions, and interval labels on hover lines.

## Tech Stack

- **Framework:** React 18 with functional components and hooks
- **Language:** TypeScript 5.6 (strict mode, `noUncheckedIndexedAccess`)
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3 — light theme, white page background, d3 rainbow-derived palette
- **Audio:** Tone.js (Salamander piano samples, lazy singleton sampler, arpeggiate support)
- **Drag & Drop:** @dnd-kit (in dependencies, not currently used)
- **Scrolling:** keen-slider (chromatic scale row, 125ms animation)
- **Utilities:** clsx + tailwind-merge via `cn()` helper, class-variance-authority for component variants

## Data Model

Two class families in `src/models/`. All fields are public, no `readonly`.

### `Note` (`src/models/Note.ts`)
A concrete musical note with letter (`Letter` type), accidental (`Accidental` class instance from `src/models/Accidental.ts`), and octave (integer). The `Accidental` class wraps a name, display symbol, tone symbol, and semitone offset — instances are `SHARP`, `FLAT`, `NATURAL` from `src/lib/music/accidentals.ts`. Methods: `label()` (e.g. "C#"), `toDisplay()` (e.g. "C#4"), `toToneString()` (ASCII for Tone.js), `equals()`, `isC()`, `isSharp()`, `isFlat()`.

### Connection Hierarchy (`src/models/Connection.ts` + subclass files)
```
Connection (abstract)             — a directed line between two screen-space points
├── StaticConnection              — a plain connection with no musical data
└── IntervalConnection (abstract) — a connection carrying a musical interval (intervalSemitones)
    ├── DiatonicConnection        — chord tone from diatonic row to mode row (also used for kept tones in extension diffs)
    ├── RemovedConnection         — chord tone dropped by an extension
    ├── AddedConnection           — new tone introduced by an extension
    └── BassConnection            — slash chord bass note
```
Styling and label rendering branch on `instanceof` — no string discriminants. `LineGroup` uses `StaticConnection[]`; `HoverLines` uses the full hierarchy.

### Type Aliases (`src/types/music.ts`)
Domain type aliases (`PitchClass`, `NoteIndex`, `Interval`, `Letter`) are plain `number` or string-union aliases for readability — they don't use TypeScript branded types but serve as documentation of intent. Also defines `Extension`, `ChordQuality`, `ChordType`, `ExtensionOption`, `ChordDegreeState`, and `ModeDataProps`.

### Overflow System
Mode note arrays are extended with extra notes before and after the visible range (`BASE_SCALE_LEFT_OVERFLOW = 5`). This allows SVG connection lines to draw smooth curves to off-screen notes. Overflow is trimmed for display but preserved for line calculations.

### Line Drawing
Two SVG overlay layers:
- `LineGroup` — static `StaticConnection[]` (chromatic → mode), positioned via `getBoundingClientRect()` + `ResizeObserver`
- `HoverLines` — dynamic connections on chord hover (diatonic → mode, base → mode), using the full Connection hierarchy for extension diffs. All paths render first, then all `IntervalLabel` components render on top to prevent overlap. Labels sit on the actual bezier curve (not the straight line between endpoints). `AddedConnection` labels at t=0.85, others at t=0.5. HoverLines SVG uses `zIndex: 3`; mode row uses `zIndex: 2` + opaque `rowBackground` (`colors.rowBg`) so extension lines pass behind it. Measurement is handled by `useContainerMeasure` hook which keeps a ResizeObserver alive across dependency changes via ref.

DOM elements are located via `data-row` and `data-idx` attributes on `NoteCell` components.

### Row Visual Hierarchy
Each row (`NotesArray`) supports:
- `caption` + `captionSubtitle` — 13px label with description
- `captionRight` — slot for right-aligned content (e.g. "Clear all extensions")
- `clipContent` — enables `overflow: hidden` for rounded corner clipping (used on chromatic and mode rows, not diatonic to allow popover overflow)
- `zIndex` — optional, creates stacking context on outer wrapper (mode row uses `zIndex: 2` to sit above HoverLines SVG)
- `rowBackground` — optional opaque background on inner container (mode row uses `colors.rowBg` to occlude lines passing through; defaults to `colors.rowBg` when not specified)
- 8px border radius on NotesArray, 6px concentric radius on NoteCell (accounts for 2px border gap)

### Hover State
Hover state is consolidated into a single `HoverState` object (`{ index, original, modified }`) to minimize React re-renders — one `setState` call instead of four separate ones.

### Mode Building Flow
1. User selects mode → look up interval pattern from `MODES`
2. `addOverflowToModeIntervals()` → extend intervals for line drawing
3. `modeIntervalsToMode()` → convert root + intervals to absolute `NoteIndex[]`
4. `spellModeNotes()` → choose enharmonic spelling minimizing accidentals
5. Render with overflow trimmed from display

### Chord Extension System
- Base triads are computed from mode intervals using stacked thirds
- Extensions (`maj`, `m`, `dim`, `aug`, `sus2`, `sus4`, `6`, `7`, `maj7`, `add2`, `add4`, `add9`, `9`, `maj9`, `11`, `13`) modify or add notes. Mutual exclusion groups prevent conflicts (e.g. `sus2` disables `m`, `maj`, etc.)
- Hover visuals show a diff: `DiatonicConnection` (solid lines for kept tones), `RemovedConnection` (dashed), `AddedConnection` (solid to base row)
- Extensions are stored as `Extension[][]` (per-degree extension arrays) + `(number | null)[]` (per-degree slash bass) in `useChordExtensions` hook
- Slash chords: `ExtensionPanel` includes a bass note selector (I–VII buttons); `BassConnection` draws a line to the bass note in the chromatic row
- Extension popover triggered by three-dot (ellipsis) icon via `Popover` component, with `MultiSelect` for extensions and bass note picker
- "Clear all extensions" button in captionRight of diatonic row

### Altered Note Display (ChordScaleContext)
Altered chord tones show directional notation:
- Flattened: `E♭ ← E` (actual note bold, arrow, natural note struck-through)
- Sharpened: `F# → G` (natural note struck-through, arrow, actual note bold)

### Mode Descriptions
The `Mode` class (`src/models/Mode.ts`) has a `description` field. All 10 modes (7 standard modes + Harmonic Minor, Melodic Minor, Whole Tone) are defined in `src/lib/music/modes.ts` with one-line character descriptions. Displayed below the mode dropdown in `ControlsBar`.

### Highlight Stability
Highlighted cells always reserve border space with `2px solid transparent` in default state. On highlight, only the border color changes — no layout shift. All colored NoteCells use `2px` borders consistently. No `boxShadow` glow (removed to prevent clipping artifacts from `overflow: hidden` containers).

### Color System
All colors are derived from d3's `interpolateRainbow` and `schemeSet3` in `src/lib/colors.ts`. Colors are computed via `tint()` (toward white) and `shade()` (toward black) helpers at specific rainbow positions:
- **Root:** `tint(rb(0.68), 0.45)` fill / `shade(rb(0.68), 0.25)` border (teal-green)
- **Scale membership:** `tint(rb(0.40), 0.45)` fill / `shade(rb(0.40), 0.25)` border (yellow-ochre), via `rainbowBand(BAND_SCALE, count)` for subtle hue variation across cells
- **UI accent (buttons, focus rings):** `shade(rb(0.85), 0.20)` / `shade(rb(0.85), 0.35)` hover (blue)
- **Respelling text:** `shade(rb(0.70), 0.40)` (teal)
- **Degree cells:** `DEGREE_COLORS` — 8 rainbow-sampled pastels, one per scale degree
- **ChordScaleContext chord tones:** `rainbowBand(BAND_SCALE, count)` (same ochre band as scale cells)
- **Hover/highlight borders:** `#000000` (black) — used on chord degree hover, mode cell highlights, chromatic highlights
- **Hover lines (all types):** `#000000` stroke, strokeWidth 2.5 (removed: 1.5 dashed)
- **Static connection lines:** `colors.border` (tinted Set3 gray), strokeWidth 1.5
- **IntervalLabel pills:** black fill (`#000000`), white text
- **Row bg:** `colors.rowBg` (tinted Set3 gray, `tint(schemeSet3[8], 0.55)`)
- **Page bg:** `bg-white`
- **Hover bg:** `bg-black/[0.08]` on all interactive cells
- CSS custom properties registered at startup via `registerCssColors()` as `--d3-*` tokens (e.g. `--d3-primary`, `--d3-border`)

## Code Conventions

- **Components:** Functional, PascalCase filenames. Use `React.memo` for expensive renders, `forwardRef` where DOM refs are needed.
- **State:** Local `useState` + `useMemo` for derived data + `useCallback` for stable handlers. No external state library.
- **Styling:** Tailwind utilities via `className`. Dynamic values use inline `style`. Conditional classes via `cn()`.
- **Exports:** Named exports for types and utilities. Default exports for components.
- **Music logic:** Pure functions in `src/lib/music/`. No side effects except `audio.ts`.
- **Types:** Centralized in `src/types/`, barrel-exported from `index.ts`.
- **Animations:** NoteCell transitions are instant (`duration-0`). Keep all transitions snappy. No CSS keyframes currently defined.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
npm run test     # Run unit tests
```
