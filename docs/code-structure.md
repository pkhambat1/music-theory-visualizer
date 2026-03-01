# Code Structure — `src/`

## File Tree with Exports

```
src/
├── main.tsx                          (createRoot)
├── App.tsx                           (App)
├── index.css
├── vite-env.d.ts
│
├── models/
│   ├── index.ts                      (re-exports: Point, Accidental, Note, Connection,
│   │                                  StaticConnection, IntervalConnection, DiatonicConnection,
│   │                                  RemovedConnection, AddedConnection, BassConnection, Mode)
│   ├── Point.ts                      (class Point)
│   ├── Accidental.ts                 (class Accidental)
│   ├── Note.ts                       (class Note — label, toDisplay, toToneString, equals, isC, isSharp, isFlat)
│   ├── Mode.ts                       (class Mode)
│   ├── Connection.ts                 (abstract class Connection)
│   ├── StaticConnection.ts           (class StaticConnection extends Connection)
│   ├── IntervalConnection.ts         (abstract class IntervalConnection extends Connection)
│   ├── DiatonicConnection.ts         (class DiatonicConnection extends IntervalConnection)
│   ├── RemovedConnection.ts          (class RemovedConnection extends IntervalConnection)
│   ├── AddedConnection.ts            (class AddedConnection extends IntervalConnection)
│   └── BassConnection.ts             (class BassConnection extends IntervalConnection)
│
├── lib/
│   ├── cn.ts                         (fn cn)
│   ├── colors.ts                     (fn tint, fn shade, fn hueBand,
│   │                                  re-export fn rgb, re-export type RGBColor)
│   ├── theme.ts                      (const BASE_SCALE, const colors, const DEGREE_COLORS,
│   │                                  fn registerCssColors)
│   ├── bezier.ts                     (fn bezierPath, fn bezierPointAt)
│   ├── notes.ts                      (const CHROMATIC_SCALE, fn generateOctaves, const notes)
│   ├── geometry.ts                   (type CellLink, type ChordHighlightPair)
│   ├── hoverConnections.ts           (type ElementPosition, fn resolveElement,
│   │                                  fn buildModeTargetLine, fn buildBaseTargetLine,
│   │                                  fn buildDiatonicLines, fn buildHighlightLines,
│   │                                  fn buildBassLine, type HoverConnectionsInput,
│   │                                  fn buildHoverConnections)
│   ├── audio.ts                      (fn playChord, fn arpeggiateChord, fn playNote)
│   │
│   └── music/
│       ├── index.ts                  (barrel: re-exports types, accidentals, modes, intervals,
│       │                              scale, chords, spelling)
│       ├── types.ts                  (type PitchClass, type NoteIndex, type Interval, type Letter,
│       │                              type Extension, type ChordQuality, type ChordType,
│       │                              type ExtensionOption, type ChordDegreeState, type ModeDataProps)
│       ├── accidentals.ts            (const SHARP, const FLAT, const NATURAL)
│       ├── modes.ts                  (const MODES, const IONIAN, const OCTAVE)
│       ├── intervals.ts              (const INTERVAL_DEGREE_LABELS, fn getIntervalLabel)
│       ├── scale.ts                  (const BASE_SCALE_LEFT_OVERFLOW,
│       │                              const BASE_SCALE_WITH_OVERFLOW_SIZE, const SQUARE_SIDE,
│       │                              fn addOverflowToModeIntervals, fn getModeLeftOverflowSize,
│       │                              fn modeIntervalsToMode, fn buildModeNotesWithOverflow,
│       │                              fn leftTrimOverflowNotes)
│       ├── spelling.ts              (fn noteNameToPitchClass, type SpellingCandidate,
│       │                              fn spellModeNotes)
│       └── chords.ts                (fn getSecond, fn getThird, fn getFourth, fn getFifth,
│                                      fn getSeventh, fn getSixth, fn getNinth, fn getEleventh,
│                                      fn getThirteenth, fn flatten, fn sharpen,
│                                      fn getChordDescriptor, fn getChordNotes,
│                                      const EXCLUSION_GROUPS, fn getDisabledExtensions,
│                                      fn applyExtensions, fn getSlashBassNote,
│                                      fn buildSlashChordVoicing)
│
├── hooks/
│   ├── index.ts                      (barrel: useModeTones, useChordExtensions,
│   │                                  useChordHover, useContainerMeasure)
│   ├── useModeTones.ts               (fn useModeTones)
│   ├── useChordExtensions.ts         (fn useChordExtensions)
│   ├── useChordHover.ts              (type HoverState, fn useChordHover)
│   └── useContainerMeasure.ts        (fn useContainerMeasure)
│
└── components/
    ├── VisualizerPanel.tsx            (const DEFAULT_ROOT_NOTE, const EXTENSION_OPTIONS,
    │                                   fn VisualizerPanel)
    ├── ControlsBar.tsx                (const MODE_ITEMS, type ControlsBarProps, fn ControlsBar)
    ├── ChromaticScaleRow.tsx           (type ChromaticScaleRowProps, fn ChromaticScaleRow)
    ├── ModeScaleRow.tsx               (type ModeScaleRowProps, fn ModeScaleRow)
    ├── ModeNoteCell.tsx               (type ModeNoteCellProps, fn ModeNoteCell [React.memo])
    ├── DiatonicScaleDegreesRow.tsx     (type ChordHoverData, type DiatonicScaleDegreesRowProps,
    │                                   fn DiatonicScaleDegreesRow)
    ├── ChordDegreeCell.tsx            (type ChordDegreeCellProps, fn ChordDegreeCell)
    ├── ChordScaleContext.tsx           (fn intervalToDegreeIdx, fn naturalInterval,
    │                                   fn baseDegreeLabel, type DegreeChordTone,
    │                                   type DegreeMapResult, fn buildDegreeMap,
    │                                   fn buildMajorScale, type ChordScaleContextProps,
    │                                   fn ChordScaleContext)
    ├── ExtensionPanel.tsx             (type ExtensionPanelProps, fn ExtensionPanel)
    ├── FixedLines.tsx                 (type FixedLinesProps, fn FixedLines)
    ├── HoverLines.tsx                 (type HoverLinesProps, fn HoverLines)
    ├── IntervalLabel.tsx              (type IntervalLabelProps, fn IntervalLabel)
    ├── NoteCell.tsx                   (type NoteCellProps, fn NoteCell [React.forwardRef])
    ├── NoteLabel.tsx                  (fn renderNote)
    ├── NotesArray.tsx                 (type NotesArrayProps, fn NotesArray)
    │
    └── ui/
        ├── index.ts                   (barrel: Button, Dropdown, MultiSelect, Pill, Popover, Tag)
        ├── Button.tsx                 (const buttonVariants, type ButtonProps, fn Button)
        ├── Dropdown.tsx               (type DropdownItem, type DropdownProps, fn Dropdown)
        ├── MultiSelect.tsx            (type MultiSelectOption, type MultiSelectProps, fn MultiSelect)
        ├── Pill.tsx                   (type PillProps, fn Pill)
        ├── Popover.tsx                (type PopoverPosition, type PopoverProps, fn Popover)
        └── Tag.tsx                    (type TagProps, fn Tag)
```

---

## Dependency Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                        main.tsx                                      │
│                                           │                                          │
│                                           ▼                                          │
│                                        App.tsx                                       │
│                                           │                                          │
│                                           ▼                                          │
│  ┌──────────────────────────────── VisualizerPanel ─────────────────────────────────┐│
│  │  [Orchestrator — all state lives here]                                           ││
│  │                                                                                  ││
│  │  State: selectedMode, rootNote, arpeggiate                                       ││
│  │  Hooks: useModeTones, useChordExtensions, useChordHover, useKeenSlider           ││
│  │                                                                                  ││
│  │  Renders ─┬─► ControlsBar ──► Dropdown, Tag                                     ││
│  │           │                                                                      ││
│  │           ├─► FixedLines (SVG overlay, z:1) ───────► useContainerMeasure         ││
│  │           │       │                                                              ││
│  │           │       └──► bezierPath ◄── StaticConnection ◄── CellLink              ││
│  │           │                                                                      ││
│  │           ├─► HoverLines (SVG overlay, z:3) ──────► useContainerMeasure          ││
│  │           │       │                                                              ││
│  │           │       ├──► bezierPath, bezierPointAt                                 ││
│  │           │       ├──► buildHoverConnections                                     ││
│  │           │       ├──► IntervalLabel                                             ││
│  │           │       └──► Connection hierarchy (instanceof branching)               ││
│  │           │                                                                      ││
│  │           ├─► ChordScaleContext ──► NotesArray ──► NoteCell                       ││
│  │           │                                                                      ││
│  │           ├─► ChromaticScaleRow ──► NotesArray ──► NoteCell                       ││
│  │           │       └──► keen-slider                                               ││
│  │           │                                                                      ││
│  │           ├─► ModeScaleRow ──► NotesArray ──► ModeNoteCell ──► NoteCell           ││
│  │           │                                                                      ││
│  │           └─► DiatonicScaleDegreesRow ──► NotesArray                             ││
│  │                   │                                                              ││
│  │                   └──► ChordDegreeCell ──┬─► NoteCell                            ││
│  │                                          ├─► Pill                                ││
│  │                                          └─► Popover                             ││
│  │                                                 │                                ││
│  │                                                 └─► ExtensionPanel               ││
│  │                                                        │                         ││
│  │                                                        └─► MultiSelect           ││
│  └──────────────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────── Hooks ──────────────────────────────────────────┐
│                                                                                      │
│  useModeTones ──────────► scale.ts (addOverflowToModeIntervals, buildModeNotes...)   │
│       │                   spelling.ts (spellModeNotes)                                │
│       └── returns: modeNotesWithOverflow, spelledModeNotes, modeConnections          │
│                                                                                      │
│  useChordExtensions ───► pure state (Extension[][], slashBasses)                     │
│       └── returns: selectedExtensions, slashBasses, handleExtensionChange, clearAll  │
│                                                                                      │
│  useChordHover ─────────► chords.ts (getSlashBassNote, buildSlashChordVoicing)       │
│       │                   scale.ts (leftTrimOverflowNotes)                           │
│       └── returns: hoveredTriadIndex, chordHighlightPairs, highlightedModeIdxs,      │
│                    highlightedBaseIdxs, voicedOriginal, voicedModified                │
│                                                                                      │
│  useContainerMeasure ──► ResizeObserver + window resize → calls measure()            │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────── Model Class Hierarchy ──────────────────────────────────┐
│                                                                                      │
│  Point ─────────────────── (x, y) used for SVG path coordinates                     │
│                                                                                      │
│  Connection (abstract)                                                               │
│  ├── StaticConnection ──── plain line, no interval data                              │
│  └── IntervalConnection (abstract) ── carries intervalSemitones                      │
│      ├── DiatonicConnection ── kept chord tone (diatonic → mode)                     │
│      ├── RemovedConnection ── dropped by extension (dashed line)                     │
│      ├── AddedConnection ──── new tone from extension (to base row)                  │
│      └── BassConnection ──── slash chord bass note                                   │
│                                                                                      │
│  Note ──────────────────── letter + Accidental + octave                              │
│  Accidental ────────────── name, displaySymbol, toneSymbol, semitoneOffset           │
│  Mode ──────────────────── name + intervals[] + description                          │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────── Music Logic (lib/music/) ─────────────────────────────────────┐
│                                                                                      │
│  types.ts ─── PitchClass, NoteIndex, Interval, Letter, Extension, ChordQuality,      │
│               ChordType, ExtensionOption, ChordDegreeState, ModeDataProps            │
│                                                                                      │
│  accidentals.ts ─── SHARP, FLAT, NATURAL (Accidental instances)                      │
│                                                                                      │
│  modes.ts ────┬── MODES[] (10 Mode instances)                                        │
│               ├── IONIAN (reference intervals)                                       │
│               └── OCTAVE = 12                                                        │
│                                                                                      │
│  intervals.ts ── getIntervalLabel(semitones) → "1","♭3","5", etc.                    │
│                                                                                      │
│  scale.ts ────┬── addOverflowToModeIntervals ─────┐                                 │
│               ├── getModeLeftOverflowSize          │ overflow system                 │
│               ├── modeIntervalsToMode              │ for SVG line drawing            │
│               ├── buildModeNotesWithOverflow ──────┘                                 │
│               ├── leftTrimOverflowNotes                                              │
│               ├── BASE_SCALE_LEFT_OVERFLOW = 5                                       │
│               └── SQUARE_SIDE = 60                                                   │
│                                                                                      │
│  chords.ts ───┬── getChordDescriptor(notes) → ChordQuality                          │
│               ├── getChordNotes(mode, degree, type) → NoteIndex[]                    │
│               ├── getDisabledExtensions(selected) → Set<Extension>                   │
│               ├── applyExtensions(notes, exts) → NoteIndex[]                         │
│               ├── getSlashBassNote(mode, chord, bass) → NoteIndex                    │
│               └── buildSlashChordVoicing(chord, mode, deg, bass) → NoteIndex[]       │
│                                                                                      │
│  spelling.ts ── spellModeNotes(overflow, leftSize, notes) → (Note | null)[]          │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────── Data Flow ───────────────────────────────────────────────┐
│                                                                                      │
│  User selects Root + Mode                                                            │
│       │                                                                              │
│       ▼                                                                              │
│  modes.ts ──► MODES[i].intervals                                                     │
│       │                                                                              │
│       ▼                                                                              │
│  useModeTones ──► addOverflowToModeIntervals ──► modeIntervalsToMode                 │
│       │                                              │                               │
│       │                                              ▼                               │
│       │                                     modeNotesWithOverflow (NoteIndex[])       │
│       │                                              │                               │
│       ├─────────────────────────── spellModeNotes ◄──┘                               │
│       │                                  │                                           │
│       │                                  ▼                                           │
│       │                          spelledModeNotes (Note[])                            │
│       │                                                                              │
│       ▼                                                                              │
│  FixedLines ◄──── modeConnections (CellLink[])                                      │
│  ChromaticScaleRow ◄── keen-slider + notes[]                                         │
│  ModeScaleRow ◄── modeNotesWithOverflow + spelledModeNotes                           │
│                                                                                      │
│  User hovers chord cell                                                              │
│       │                                                                              │
│       ▼                                                                              │
│  useChordHover ──► getChordNotes ──► applyExtensions                                 │
│       │                                  │                                           │
│       ▼                                  ▼                                           │
│  HoverLines ◄──── buildHoverConnections (Connection[])                               │
│  ChordScaleContext ◄── modifiedHoverNotes                                            │
│  ChromaticScaleRow ◄── highlightedBaseIdxs                                           │
│  ModeScaleRow ◄── highlightedModeIdxs                                                │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────── Visual Layer Stack (z-index) ─────────────────────────────────┐
│                                                                                      │
│  z:4  DiatonicScaleDegreesRow (when popover is open)                                 │
│  z:3  HoverLines SVG ─── dynamic bezier lines + IntervalLabel pills                 │
│  z:2  ModeScaleRow ────── opaque rowBg occludes lines passing through                │
│  z:1  FixedLines SVG ─── static chromatic→mode bezier lines                         │
│  z:0  (default) ───────── ChordScaleContext, ChromaticScaleRow, DiatonicRow          │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
