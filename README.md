# Music Theory Visualizer

Ever wonder how scales, modes, and chords actually relate to each other? This app makes it click — literally. Pick a key, pick a mode, and watch the connections light up across the chromatic scale. Hover a chord to see exactly which notes build it. Click to hear it on a piano.

No music theory background needed. The visualization does the explaining.

## How to interact with it

### Pick your key and mode

Use the **Key** tag and **Mode** dropdown in the header card. The whole visualization updates instantly. A short description below the dropdown explains the character of each mode (e.g. "Minor with a raised 6th — jazzy and warm" for Dorian).

### Explore the rows

The visualization is three connected rows, top to bottom:

1. **Chromatic Scale** — all 12 notes in order. Drag left/right to shift the root note, or tap the arrow buttons. Highlighted cells show which chromatic notes belong to your current mode.

2. **Mode Scale** — the 7 notes of your selected mode, with curved lines connecting each one back up to the chromatic row. Scale degree numbers (1-7) appear below each cell. Click any note to hear it.

3. **Diatonic Chords** — the chords naturally built from stacking thirds in your mode (I, ii, iii, IV, V, vi, vii). Quality symbols tell you the type: uppercase = major, lowercase = minor, plus special markers for diminished and augmented.

### Hover a chord

This is where it gets interesting. Hover over any chord in the bottom row and:

- **Lines appear** connecting the chord down to its component notes in the mode row, with **interval labels** (1, 3, 5, etc.) sitting on each line
- **A major scale context row** fades in at the top, showing how the chord tones map onto the chord root's major scale — unaltered tones are highlighted, altered tones show the direction of alteration (e.g. `Eb <- E` for a flattened note)
- Highlighted cells in the chromatic row show the chord tones in context of all 12 notes

### Play audio

- **Click any note** in the mode row to hear it
- **Click any chord** in the diatonic row to hear all its notes at once
- Toggle the **Arpeggiate** button in the header to play chord notes one at a time instead

### Add chord extensions

Click the **three-dot icon** on any chord cell to open the extensions popover. Available extensions: sus2, sus4, 7, maj7, add9, 9, and more.

When extensions modify a chord, the hover lines show a visual diff:
- **Solid lines** — notes kept from the original chord
- **Dashed lines** — notes removed by the extension
- **New lines** — notes added by the extension

Extension pills appear below the chord numeral so you can see what's applied at a glance. Use **Clear** in the popover to reset one chord, or **Clear all extensions** (top-right of the diatonic row) to reset everything.

## Running locally

You'll need [Node.js](https://nodejs.org/) v18 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint with ESLint |

## Built with

[React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Tone.js](https://tonejs.github.io/) (Salamander piano samples), [keen-slider](https://keen-slider.io/), [@dnd-kit](https://dndkit.com/)

## License

MIT
