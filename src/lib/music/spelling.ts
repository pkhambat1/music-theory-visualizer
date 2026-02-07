import type { NoteIndex, NoteName, PitchClass } from "../../types";

const LETTER_ORDER = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_TO_PC: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

// ─── Helpers ───────────────────────────────────────────────────────

function hasSharp(note: string | null | undefined): boolean {
  return note?.includes("#") ?? false;
}

function hasFlat(note: string | null | undefined): boolean {
  return note?.toLowerCase().includes("b") ?? false;
}

export function noteNameToPitchClass(
  noteName: string | null | undefined,
): PitchClass | null {
  if (!noteName) return null;
  const letter = noteName[0]?.toUpperCase();
  if (!letter) return null;
  const basePc = LETTER_TO_PC[letter];
  if (basePc === undefined) return null;

  let offset = 0;
  if (noteName.includes("#")) offset += 1;
  if (noteName.includes("b")) offset -= 1;

  return ((basePc + offset + 12) % 12) as PitchClass;
}

// ─── Public API ────────────────────────────────────────────────────

interface SpellingCandidate {
  spelled: string[];
  maxAbs: number;
  totalAbs: number;
}

/**
 * Choose an enharmonic spelling for every note in the mode that
 * minimises accidentals and avoids double-sharps / double-flats.
 */
export function spellModeNotes(
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  notes: NoteName[],
): string[] {
  if (
    !Array.isArray(modeNotesWithOverflow) ||
    modeNotesWithOverflow.length === 0 ||
    !Array.isArray(notes)
  ) {
    return [];
  }

  const actualPcs = modeNotesWithOverflow.map((noteIdx) =>
    noteNameToPitchClass(notes[noteIdx]),
  );

  const rootIdx = modeLeftOverflowSize;
  const rootNoteName: string = notes[modeNotesWithOverflow[rootIdx]!] ?? "C";
  const rootLetter = rootNoteName[0]?.toUpperCase() ?? "C";
  const rootLetterIndex = LETTER_ORDER.indexOf(rootLetter as typeof LETTER_ORDER[number]);

  const candidateLetters = new Set<string>();
  if (rootLetterIndex !== -1) candidateLetters.add(rootLetter);
  if (hasSharp(rootNoteName)) {
    const nextLetter = LETTER_ORDER[(rootLetterIndex + 1) % LETTER_ORDER.length];
    if (nextLetter) candidateLetters.add(nextLetter);
  } else if (hasFlat(rootNoteName)) {
    const prevLetter = LETTER_ORDER[
      (rootLetterIndex - 1 + LETTER_ORDER.length) % LETTER_ORDER.length
    ];
    if (prevLetter) candidateLetters.add(prevLetter);
  }

  const candidates: SpellingCandidate[] = Array.from(candidateLetters).map(
    (rootLetterCandidate) => {
      const candidateRootIndex = LETTER_ORDER.indexOf(
        rootLetterCandidate as typeof LETTER_ORDER[number],
      );
      const spelled: string[] = [];
      let maxAbs = 0;
      let totalAbs = 0;

      for (let i = 0; i < modeNotesWithOverflow.length; i++) {
        const letterIndex =
          ((candidateRootIndex + (i - rootIdx)) % LETTER_ORDER.length +
            LETTER_ORDER.length) %
          LETTER_ORDER.length;
        const letter = LETTER_ORDER[letterIndex]!;
        const naturalPc = LETTER_TO_PC[letter]!;
        const desiredPc = actualPcs[i];

        if (desiredPc === null || desiredPc === undefined) {
          spelled.push("");
          continue;
        }

        const diff = ((desiredPc - naturalPc + 6) % 12) - 6;
        const absDiff = Math.abs(diff);
        maxAbs = Math.max(maxAbs, absDiff);
        totalAbs += absDiff;

        if (absDiff > 2) {
          maxAbs = Math.max(maxAbs, 10);
          totalAbs += 10;
        }

        let accidental = "";
        if (diff > 0) accidental = "#".repeat(diff);
        else if (diff < 0) accidental = "\u266d".repeat(-diff);

        spelled.push(`${letter}${accidental}`);
      }

      return { spelled, maxAbs, totalAbs };
    },
  );

  const sorted = candidates.sort((a, b) => {
    if (a.maxAbs !== b.maxAbs) return a.maxAbs - b.maxAbs;
    return a.totalAbs - b.totalAbs;
  });

  return sorted[0]?.spelled ?? [];
}
