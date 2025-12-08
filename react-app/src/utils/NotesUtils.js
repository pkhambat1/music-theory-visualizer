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
    "C",
  ];

  static modes = {
    "Ionian (major)": [0, 2, 4, 5, 7, 9, 11, 12],
    Dorian: [0, 2, 3, 5, 7, 9, 10, 12],
    Phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
    Lydian: [0, 2, 4, 6, 7, 9, 11, 12],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
    "Aeolian (natural minor)": [0, 2, 3, 5, 7, 8, 10, 12],
    Locrian: [0, 1, 3, 5, 6, 8, 10, 12],
    "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11, 12],
    "Melodic Minor": [0, 2, 3, 5, 7, 9, 11, 12],
    "Whole Tone": [0, 2, 4, 6, 8, 10, 12],
  };

  static #getSecond(rootNote) {
    console.log("getSecond");
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

  static #getNinth(rootNote) {
    console.log(
      "ninth is ",
      NotesUtils.modes["Ionian (major)"][2 - 1] +
        rootNote +
        (this.chromaticScale.length - 1)
    );
    return (
      NotesUtils.modes["Ionian (major)"][2 - 1] +
      rootNote +
      (this.chromaticScale.length - 1)
    );
  }

  static #flattened(note) {
    return note - 1;
  }

  static #sharpened(note) {
    return note + 1;
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
      return modeNotes[chordNumeralIdx + alternatingOffset];
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
    if (extensions.includes("sus2")) {
      chordNotesWithExtensions[1] = this.#getSecond(rootNote);
    }
    if (extensions.includes("sus4")) {
      chordNotesWithExtensions[1] = this.#getFourth(rootNote);
    }
    if (extensions.includes("maj7")) {
      chordNotesWithExtensions.push(this.#getSeventh(rootNote));
    }
    if (extensions.includes("7")) {
      chordNotesWithExtensions.push(
        this.#flattened(this.#getSeventh(rootNote))
      );
    }
    if (extensions.includes("aug")) {
      chordNotesWithExtensions[2] = this.#sharpened(this.#getFifth(rootNote));
    }
    if (extensions.includes("dim")) {
      chordNotesWithExtensions[1] = this.#flattened(this.#getThird(rootNote));
      chordNotesWithExtensions[2] = this.#flattened(this.#getFifth(rootNote));
    }
    if (extensions.includes("m")) {
      chordNotesWithExtensions[1] = this.#flattened(this.#getThird(rootNote));
    }
    if (extensions.includes("maj")) {
      chordNotesWithExtensions[1] = this.#getThird(rootNote);
    }
    if (extensions.includes("add9")) {
      chordNotesWithExtensions.push(this.#getNinth(rootNote));
    }
    if (extensions.includes("9")) {
      chordNotesWithExtensions.push(this.#getSeventh(rootNote));
      chordNotesWithExtensions.push(this.#getNinth(rootNote));
    }

    return chordNotesWithExtensions;
  }
}
