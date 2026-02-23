# Music Theory Visualizer

## Project Overview

Interactive React app for visualizing music theory — modes, diatonic chords, note relationships, and chord extensions. Users select a root note and mode, then explore how chromatic, mode, and chord tones relate through connected visual rows with SVG line overlays. Audio playback is powered by Tone.js with a lazy-loaded piano sampler (supports arpeggiated playback). Designed for **beginners** with contextual labels, mode descriptions, and interval labels on hover lines.

## Tech Stack

- **Framework:** React 18 with functional components and hooks
- **Language:** TypeScript 5.6 (strict mode, `noUncheckedIndexedAccess`)
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3 — light theme, white cards, colorblind-safe data-driven palette
- **Audio:** Tone.js (Salamander piano samples, lazy singleton sampler, arpeggiate support)
- **Drag & Drop:** @dnd-kit (used in chord progression builder)
- **Scrolling:** keen-slider (chromatic scale row, 125ms animation)
- **Utilities:** clsx + tailwind-merge via `cn()` helper, class-variance-authority for component variants

## Data Model

Two class families in `src/lib/`. All fields are public, no `readonly`.

### `Note` (`src/lib/note.ts`)
A concrete musical note with letter name, accidental, and octave. Methods: `label()` (e.g. "C#"), `toDisplay()` (e.g. "C#4"), `toToneString()` (ASCII for Tone.js), `equals()`, `isC()`, `isSharp()`, `isFlat()`.

### Connection Hierarchy (`src/lib/connection.ts`)
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

### Branded Types (`src/types/music.ts`)
Domain primitives (`PitchClass`, `NoteIndex`, `Interval`, `NoteName`) use TypeScript branded types for compile-time safety — prevents mixing up raw numbers that mean different things.

### Overflow System
Mode note arrays are extended with extra notes before and after the visible range (`BASE_SCALE_LEFT_OVERFLOW = 5`). This allows SVG connection lines to draw smooth curves to off-screen notes. Overflow is trimmed for display but preserved for line calculations.

### Line Drawing
Two SVG overlay layers:
- `LineGroup` — static `StaticConnection[]` (chromatic → mode), positioned via `getBoundingClientRect()` + `ResizeObserver`
- `HoverLines` — dynamic connections on chord hover (diatonic → mode, base → mode), using the full Connection hierarchy for extension diffs. All paths render first, then all `IntervalLabel` components render on top to prevent overlap. Labels sit on the actual bezier curve (not the straight line between endpoints). `AddedConnection` labels at t=0.85, others at t=0.5. HoverLines SVG uses `zIndex: 3`; mode row uses `zIndex: 2` + opaque `rowBackground` so extension lines pass behind it. ResizeObserver is kept alive across hover changes via ref for performance.

DOM elements are located via `data-row` and `data-idx` attributes on `NoteCell` components.

### Row Visual Hierarchy
Each row (`NotesArray`) supports:
- `caption` + `captionSubtitle` — 13px label with description
- `captionRight` — slot for right-aligned content (e.g. "Clear all extensions")
- `clipContent` — enables `overflow: hidden` for rounded corner clipping (used on chromatic and mode rows, not diatonic to allow popover overflow)
- `zIndex` — optional, creates stacking context on outer wrapper (mode row uses `zIndex: 2` to sit above HoverLines SVG)
- `rowBackground` — optional opaque background on inner container (mode row uses `"white"` to occlude lines passing through)
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
- Extensions (`sus2`, `sus4`, `7`, `maj7`, `add9`, `9`) modify or add notes
- Hover visuals show a diff: `DiatonicConnection` (solid lines for kept tones), `RemovedConnection` (dashed), `AddedConnection` (solid to base row)
- Extensions are stored per-degree as `ChordDegree[]`
- Extension popover triggered by three-dot (ellipsis) icon, grid layout (3 columns), with "Extensions" header and per-chord Clear button
- "Clear all extensions" button in captionRight of diatonic row

### Altered Note Display (ChordScaleContext)
Altered chord tones show directional notation:
- Flattened: `E♭ ← E` (actual note bold, arrow, natural note struck-through)
- Sharpened: `F# → G` (natural note struck-through, arrow, actual note bold)

### Mode Descriptions
`MODE_DESCRIPTIONS` map in `VisualizerPanel.tsx` provides one-line character descriptions for all 9 modes, displayed below the mode dropdown.

### Highlight Stability
Highlighted cells always reserve border space with `2px solid transparent` in default state. On highlight, only the border color changes — no layout shift. All colored NoteCells use `2px` borders consistently. No `boxShadow` glow (removed to prevent clipping artifacts from `overflow: hidden` containers).

### Color System
Colorblind-safe, data-driven palette — every color encodes meaning:
- `#009CDE` (blue): Scale membership, buttons, interactive accent
- `#D90677` (magenta): Hover accent — chord tone borders, hover lines, diatonic hover border
- `#46C8B2` (teal): Root note fill; `#2E9E8A` darker teal for root border
- `#8ECEF5` (light blue): In-scale chromatic cell fill; `#64BDFF` border
- `#F5B0D5` (light magenta): ChordScaleContext chord tone fill; `#A8044F` border
- `#00896B` (dark teal): Enharmonic respelling text
- `rgba(0,0,0,0.12)`: Static connection lines
- `rgba(0,0,0,0.25)`: Removed tones (dashed)
- Hover bg: `bg-black/[0.08]` on all rows
- Card bg: white; page bg: `#f7f9fb`

## Code Conventions

- **Components:** Functional, PascalCase filenames. Use `React.memo` for expensive renders, `forwardRef` where DOM refs are needed.
- **State:** Local `useState` + `useMemo` for derived data + `useCallback` for stable handlers. No external state library.
- **Styling:** Tailwind utilities via `className`. Dynamic values use inline `style`. Conditional classes via `cn()`.
- **Exports:** Named exports for types and utilities. Default exports for components.
- **Music logic:** Pure functions in `src/lib/music/`. No side effects except `audio.ts`.
- **Types:** Centralized in `src/types/`, barrel-exported from `index.ts`.
- **Animations:** CSS keyframes in `index.css` (`fade-in-up` at 250ms). NoteCell transitions are instant (`duration-0`). Keep all transitions snappy.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
npm run test     # Run unit tests
```
