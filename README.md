# Music Theory Visualizer

An interactive tool for exploring how modes, scales, and chords connect — visually and audibly.

Pick a key and a mode, then hover over diatonic chords to see exactly which notes light up across the chromatic scale, the mode, and stacked chord tones. Click any note or chord to hear it played on a piano.

## Features

**Modes & Scales**
- 9 modes: Ionian (major), Dorian, Phrygian, Lydian, Mixolydian, Aeolian (natural minor), Locrian, Harmonic Minor, and Melodic Minor
- Scroll through all keys with the chromatic slider
- See how mode notes map to the chromatic scale with connecting lines

**Diatonic Chords**
- Roman numeral chord degrees (I through VII) with automatic quality labels (major, minor, diminished, augmented)
- Hover any chord to highlight its tones across every row — from the diatonic degree, through the mode, down to the chromatic scale

**Chord Extensions**
- Add extensions to any degree: sus2, sus4, 7, maj7, add9, 9, and more
- Visual diff on hover — kept notes show solid lines, removed notes show dashed lines, and added notes connect straight to the chromatic row
- Extension pills display beneath each chord numeral

**Audio Playback**
- Click a chord to hear all its notes together
- Click any individual note to hear it on its own
- Sampled piano sound (Salamander Grand Piano)

**Chord Tones & Major Scale Context**
- A dedicated chord tones row shows where triad notes fall in the chromatic scale
- A major scale row contextualizes each chord root against its own major scale

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org/) (v18 or later)

```bash
# Clone the repo
git clone https://github.com/<your-username>/music-theory-visualizer.git
cd music-theory-visualizer

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR       |
| `npm run build`     | Type-check and build for production      |
| `npm run preview`   | Preview the production build locally     |
| `npm run lint`      | Run ESLint                               |

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — UI and type safety
- [Vite](https://vite.dev/) — build tooling and hot module replacement
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Tone.js](https://tonejs.github.io/) — audio synthesis and sampled piano playback
- [keen-slider](https://keen-slider.io/) — touch-friendly chromatic scale scrolling
- [@dnd-kit](https://dndkit.com/) — drag-and-drop for the chord progression builder

## Project Structure

```
src/
├── components/          Feature components (VisualizerPanel, TriadScale, etc.)
│   └── ui/              Reusable design-system primitives (Button, Card, Dropdown, …)
├── lib/
│   └── music/           Pure music-theory logic (modes, chords, scales, spelling)
├── types/               TypeScript types for the music and geometry domains
├── App.tsx              Root layout
└── main.tsx             Entry point
```

## License

MIT
