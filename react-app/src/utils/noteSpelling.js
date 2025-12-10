const letterOrder = ["C", "D", "E", "F", "G", "A", "B"];
const letterToPc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const hasSharp = (note) => note?.includes("#");
const hasFlat = (note) => note?.toLowerCase().includes("b");

const noteNameToPitchClass = (noteName) => {
  if (!noteName) return null;
  const letter = noteName[0]?.toUpperCase();
  const basePc = letterToPc[letter];
  if (basePc === undefined) return null;
  let accidentalOffset = 0;
  if (noteName.includes("#")) accidentalOffset += 1;
  if (noteName.includes("b")) accidentalOffset -= 1;
  return (basePc + accidentalOffset + 12) % 12;
};

// Choose a spelling that minimizes accidentals and avoids double sharps/flats.
export const spellModeNotes = (modeNotesWithOverflow, modeLeftOverflowSize, notes) => {
  if (
    !Array.isArray(modeNotesWithOverflow) ||
    !modeNotesWithOverflow.length ||
    !Array.isArray(notes)
  ) {
    return [];
  }

  const actualPcs = modeNotesWithOverflow.map((noteIdx) =>
    noteNameToPitchClass(notes[noteIdx])
  );
  const rootIdx = modeLeftOverflowSize;
  const rootNoteName = notes[modeNotesWithOverflow[rootIdx]] || "C";
  const rootLetter = rootNoteName[0]?.toUpperCase() || "C";
  const rootLetterIndex = letterOrder.indexOf(rootLetter);
  const candidatesLetters = new Set();
  if (rootLetterIndex !== -1) candidatesLetters.add(rootLetter);
  if (hasSharp(rootNoteName)) {
    candidatesLetters.add(letterOrder[(rootLetterIndex + 1) % letterOrder.length]);
  } else if (hasFlat(rootNoteName)) {
    candidatesLetters.add(
      letterOrder[
        (rootLetterIndex - 1 + letterOrder.length) % letterOrder.length
      ]
    );
  }

  const candidates = Array.from(candidatesLetters).map((rootLetterCandidate) => {
    const candidateRootIndex = letterOrder.indexOf(rootLetterCandidate);
    const spelled = [];
    let maxAbs = 0;
    let totalAbs = 0;

    for (let i = 0; i < modeNotesWithOverflow.length; i++) {
      const letterIndex =
        ((candidateRootIndex + (i - rootIdx)) % letterOrder.length +
          letterOrder.length) %
        letterOrder.length;
      const letter = letterOrder[letterIndex];
      const naturalPc = letterToPc[letter];
      const desiredPc = actualPcs[i];
      if (desiredPc === null || desiredPc === undefined) {
        spelled.push("");
        continue;
      }
      const diff = ((desiredPc - naturalPc + 6) % 12) - 6; // -6..5 minimal diff
      const absDiff = Math.abs(diff);
      maxAbs = Math.max(maxAbs, absDiff);
      totalAbs += absDiff;
      if (absDiff > 2) {
        // heavily penalize double accidentals
        maxAbs = Math.max(maxAbs, 10);
        totalAbs += 10;
      }
      let accidental = "";
      if (diff > 0) {
        accidental = "#".repeat(diff);
      } else if (diff < 0) {
        accidental = "♭".repeat(-diff);
      }
      spelled.push(`${letter}${accidental}`);
    }

    return { spelled, maxAbs, totalAbs };
  });

  const sorted = candidates.sort((a, b) => {
    if (a.maxAbs !== b.maxAbs) return a.maxAbs - b.maxAbs;
    return a.totalAbs - b.totalAbs;
  });

  return sorted[0]?.spelled ?? [];
};

export { noteNameToPitchClass };
