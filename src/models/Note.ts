import type { Letter } from "../lib/music/types"
import { Accidental } from "./Accidental"
import { SHARP, FLAT } from "../lib/music/accidentals"

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
    return `${this.letter}${this.accidental.displaySymbol}`
  }

  /** Full display string with unicode flat, e.g. "C#4", "E♭3" */
  toDisplay(): string {
    return `${this.label()}${this.octave}`
  }

  /** ASCII string for Tone.js, e.g. "C#4", "Eb3" */
  toToneString(): string {
    return `${this.letter}${this.accidental.toneSymbol}${this.octave}`
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
    return this.accidental === SHARP
  }

  isFlat(): boolean {
    return this.accidental === FLAT
  }
}
