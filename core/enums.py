from enum import Enum

class ChordType(Enum):
    MAJOR = "MAJOR"
    MINOR = "MINOR"
    HARMONIC_MINOR = "HARMONIC_MINOR"
    MAJOR_2 = "MAJOR_2"
    SUS2 = "SUS2"
    SUS4 = "SUS4"
    DIMINISHED = "DIMINISHED"
    DIMINISHED_SEVENTH = "DIMINISHED_SEVENTH"
    DOMINANT_SEVENTH = "DOMINANT_SEVENTH"
    HALF_DIMINISHED_SEVENTH = "HALF_DIMINISHED_SEVENTH"
    AUGMENTED = "AUGMENTED"
    MINOR_SEVENTH = "MINOR_SEVENTH"
    HALF_DIMINISHED = "HALF_DIMINISHED"
    MAJOR_SEVENTH = "MAJOR_SEVENTH"
    MINOR_MAJOR_SEVENTH = "MINOR_MAJOR_SEVENTH"
    ADD_9 = "ADD_9"
    MINOR_9 = "MINOR_9"

class NoteJump(Enum):
    AUG_2 = 3
    W = 2
    H = 1

"""Sharp or flat with respect to major scale"""
class NoteState(Enum):
    MINOR = -1
    SAME = 0
    SHARP = 1

class RomanNumeralMajor(Enum):
    I = "I"
    IIm = "IIm"
    IIIm = "IIIm"
    IV = "IV"
    V = "V"
    VIm = "VIm"
    VII_dim = "VII_dim"

class RomanNumeralMinor(Enum):
    I = "Im"
    II_dim = "II_dim"
    III = "III"
    IVm = "IVm"
    Vm = "Vm"
    VI = "VI"
    VII = "VII"