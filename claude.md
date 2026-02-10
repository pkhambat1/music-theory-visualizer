# Music Theory Visualizer

## Project Overview

Interactive React app for visualizing music theory — modes, diatonic chords, note relationships, and chord extensions. Users select a root note and mode, then explore how chromatic, mode, and chord tones relate through connected visual rows with SVG line overlays. Audio playback is powered by Tone.js with a lazy-loaded piano sampler (supports arpeggiated playback). Designed for **beginners** with contextual labels, mode descriptions, and interval labels on hover lines.

## Tech Stack

- **Framework:** React 18 with functional components and hooks
- **Language:** TypeScript 5.6 (strict mode, `noUncheckedIndexedAccess`)
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3 — dark theme, glassmorphic cards, cyan accents on `#050510` background
- **Audio:** Tone.js (Salamander piano samples, lazy singleton sampler, arpeggiate support)
- **Drag & Drop:** @dnd-kit (used in chord progression builder)
- **Scrolling:** keen-slider (chromatic scale row, 125ms animation)
- **Utilities:** clsx + tailwind-merge via `cn()` helper, class-variance-authority for component variants

## Directory Structure

```
src/
├── components/           # Feature components
│   ├── ui/              # Reusable design-system primitives (Button, Card, Dropdown, Tooltip, etc.)
│   ├── VisualizerPanel  # Main orchestrator — state, layout, mode/key selection, mode descriptions
│   ├── TriadScale       # Chord tones mapped to chromatic positions
│   ├── NotesArray       # Container for note rows (caption, subtitle, captionRight, clipContent)
│   ├── NoteCell         # Base note cell (8px radius, showBorder=false default)
│   ├── ModeNoteCell     # Mode note display (spelling, highlight, click-to-play, optCaption)
│   ├── DiatonicScaleDegreesRow  # Roman numerals, three-dot extension popover, arpeggiate prop
│   ├── LineGroup        # Static SVG connection lines (cyan→violet gradient, ResizeObserver)
│   ├── HoverLines       # Dynamic hover lines (interval labels on bezier curve, paths render before labels)
│   ├── ChordScaleContext # Chord root's major scale overlay (directional altered note display)
│   ├── ChordProgressionBuilder  # Drag-and-drop chord progression tool
│   └── SortableChordCell        # Sortable cell for progression builder
├── lib/
│   ├── music/
│   │   ├── modes.ts     # MODES intervals map, IONIAN reference, OCTAVE constant
│   │   ├── scale.ts     # Mode building with overflow for line drawing
│   │   ├── chords.ts    # Chord construction, quality detection, extensions
│   │   └── spelling.ts  # Enharmonic spelling (minimize accidentals)
│   ├── audio.ts         # Tone.js sampler, playChord(), playNote(), arpeggiateChord()
│   ├── cn.ts            # clsx + tailwind-merge utility
│   ├── linePath.ts      # Cubic bezier SVG path builder
│   └── notes.tsx        # Chromatic scale, octave generation, note rendering
├── types/
│   ├── music.ts         # Branded types (PitchClass, NoteIndex, Interval, NoteName), unions, interfaces
│   ├── geometry.ts      # Line, Point, Connection, ChordHighlightPair types
│   └── index.ts         # Barrel re-exports
├── App.tsx              # Root layout (layered ambient glows, dot pattern)
├── main.tsx             # React entry point
└── index.css            # Tailwind directives, Inter font, custom animations (fade-in-up)
```

## Key Architectural Concepts

### Branded Types
Domain primitives (`PitchClass`, `NoteIndex`, `Interval`, `NoteName`) use TypeScript branded types for compile-time safety — prevents mixing up raw numbers that mean different things.

### Overflow System
Mode note arrays are extended with extra notes before and after the visible range (`BASE_SCALE_LEFT_OVERFLOW = 5`). This allows SVG connection lines to draw smooth curves to off-screen notes. Overflow is trimmed for display but preserved for line calculations.

### Line Drawing
Two SVG overlay layers:
- `LineGroup` — static connections (chromatic → mode) using SVG `<linearGradient>` (cyan→violet), positioned via `getBoundingClientRect()` + `ResizeObserver`
- `HoverLines` — dynamic connections on chord hover (diatonic → mode, base → mode), with visual diffs for extensions (kept = solid, removed = dashed, added = solid with glow). All paths render first, then all labels render on top to prevent overlap. Labels sit on the actual bezier curve (not the straight line between endpoints). Added-extension lines place labels at t=0.75, regular lines at t=0.5. HoverLines SVG uses `zIndex: 1` to render behind note rows. ResizeObserver is kept alive across hover changes via ref for performance.

**Important:** Use CSS `drop-shadow` (via `style` prop) for line glow effects, NOT SVG `<filter>`. SVG filters clip based on the element bounding box — vertical lines have near-zero width bounding boxes, causing the filter region to collapse and the line to disappear entirely.

DOM elements are located via `data-row` and `data-idx` attributes on `NoteCell` components.

### Row Visual Hierarchy
Each row (`NotesArray`) supports:
- `caption` + `captionSubtitle` — 13px label with description
- `captionRight` — slot for right-aligned content (e.g. "Clear all extensions")
- `clipContent` — enables `overflow: hidden` for rounded corner clipping (used on chromatic and mode rows, not diatonic to allow popover overflow)
- Uniform `rgba(8, 8, 24, 0.85)` background, 8px border radius matching NoteCell

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
- Hover visuals show a diff: kept notes (solid lines), removed notes (dashed), added notes (solid to base row)
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
Highlighted cells always reserve border space with `2px solid transparent` in default state. On highlight, only the border color changes — no layout shift. No `boxShadow` glow (removed to prevent clipping artifacts from `overflow: hidden` containers).

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
