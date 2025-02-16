export default class NotesUtils {
  static chromaticScale = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  static modes = {
    "Ionian (major)": [0, 2, 4, 5, 7, 9, 11],
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    Phrygian: [0, 1, 3, 5, 7, 8, 10],
    Lydian: [0, 2, 4, 6, 7, 9, 11],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10],
    "Aeolian (natural minor)": [0, 2, 3, 5, 7, 8, 10],
    Locrian: [0, 1, 3, 5, 6, 8, 10],
    "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
    "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  };

  static #getSecond(rootNote) {
    return NotesUtils.modes["Ionian (major)"][2 - 1] + rootNote;
  }

  static #getThird(rootNote) {
    return NotesUtils.modes["Ionian (major)"][3 - 1] + rootNote;
  }

  static #getFourth(rootNote) {
    return NotesUtils.modes["Ionian (major)"][4 - 1] + rootNote;
  }

  static #getFifth(rootNote) {
    return NotesUtils.modes["Ionian (major)"][5 - 1] + rootNote;
  }

  static #getSeventh(rootNote) {
    return NotesUtils.modes["Ionian (major)"][7 - 1] + rootNote;
  }

  static getChordDescriptor(chordNotes) {
    const rootNote = chordNotes[0];
    const thirdDeviation = chordNotes[1] - this.#getThird(rootNote);
    const fifthDeviation = chordNotes[2] - this.#getFifth(rootNote);
    if (thirdDeviation === 0 && fifthDeviation === 0) {
      return "";
    } else if (thirdDeviation === -1 && fifthDeviation === 0) {
      return "m";
    } else if (thirdDeviation === -1 && fifthDeviation === -1) {
      return "°";
    } else if (thirdDeviation === 0 && fifthDeviation === 1) {
      return "+";
    } else if (thirdDeviation === 1 && fifthDeviation === 0) {
      return "sus4";
    } else if (thirdDeviation === -2 && fifthDeviation === 0) {
      return "sus2";
    } else {
      return "?";
    }
  }

  static leftTrimOverflowNotes(
    modeIntervalsWithOverflowNotes,
    leftOverflowSize
  ) {
    return modeIntervalsWithOverflowNotes.slice(
      leftOverflowSize,
      modeIntervalsWithOverflowNotes.length
    );
  }

  static getChordNotes(modeNotes, chordNumeralIdx, chordType = "triads") {
    const alternatingOffsets =
      chordType === "triads" ? [0, 2, 4] : [0, 2, 4, 6];

    return alternatingOffsets.map((alternatingOffset) => {
      return modeNotes[alternatingOffset + chordNumeralIdx];
    });
  }

  static getChordNotesInChromaticScale(chordNotes) {
    const chordNotesInChromaticScale = Array(this.chromaticScale.length).fill(
      null
    );
    const rootNote = chordNotes[0];
    chordNotes.forEach((note) => {
      chordNotesInChromaticScale[note - rootNote] = note;
    });
    return chordNotesInChromaticScale;
  }

  static applyExtensionsToChordNotes(chordNotes, extensions) {
    const rootNote = chordNotes[0];
    const chordNotesWithExtensions = [...chordNotes];
    console.log("chordNotesWithExtensions", chordNotesWithExtensions);
    if (extensions.includes("sus4")) {
      chordNotesWithExtensions[1] = this.#getFourth(rootNote);
    } else {
      console.log("extensions", extensions);
    }
    if (extensions.includes("sus2")) {
      chordNotesWithExtensions[1] = this.#getSecond(rootNote);
    }
    if (extensions.includes("maj7")) {
      chordNotesWithExtensions.push(this.#getSeventh(rootNote));
    }
    if (extensions.includes("7")) {
      chordNotesWithExtensions.push(this.#getSeventh(rootNote) - 1);
    }
    if (extensions.includes("aug")) {
      chordNotesWithExtensions[2] = this.#getFifth(rootNote) + 1;
    }
    if (extensions.includes("dim")) {
      chordNotesWithExtensions[1] = this.#getThird(rootNote) - 1;
      chordNotesWithExtensions[2] = this.#getFifth(rootNote) - 1;
    }

    return chordNotesWithExtensions;
  }
}
