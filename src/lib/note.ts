import type { Letter, Accidental } from "../types"

const ACCIDENTAL_DISPLAY: Record<Accidental, string> = {
  sharp: "#",
  flat: "♭",
  natural: "",
}

const ACCIDENTAL_TONE: Record<Accidental, string> = {
  sharp: "#",
  flat: "b",
  natural: "",
}

/** A concrete musical note with letter name, accidental, and octave. */
export class Note {
  letter: Letter
  accidental: Accidental
  octave: number

  constructor(letter: Letter, accidental: Accidental, octave: number) {
    this.letter = letter
    this.accidental = accidental
    this.octave = octave
  }

  /** Note label without octave, e.g. "C#", "E♭", "D" */
  label(): string {
    return `${this.letter}${ACCIDENTAL_DISPLAY[this.accidental]}`
  }

  /** Full display string with unicode flat, e.g. "C#4", "E♭3" */
  toDisplay(): string {
    return `${this.label()}${this.octave}`
  }

  /** ASCII string for Tone.js, e.g. "C#4", "Eb3" */
  toToneString(): string {
    return `${this.letter}${ACCIDENTAL_TONE[this.accidental]}${this.octave}`
  }

  /** Structural equality */
  equals(other: Note): boolean {
    return (
      this.letter === other.letter &&
      this.accidental === other.accidental &&
      this.octave === other.octave
    )
  }

  isC(): boolean {
    return this.letter === "C"
  }

  isSharp(): boolean {
    return this.accidental === "sharp"
  }

  isFlat(): boolean {
    return this.accidental === "flat"
  }

}
