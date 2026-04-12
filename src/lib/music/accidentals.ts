import { Accidental } from "../../models"

export const SHARP = new Accidental("sharp", "#", "#", 1)
export const FLAT = new Accidental("flat", "♭", "b", -1)
export const NATURAL = new Accidental("natural", "", "", 0)
