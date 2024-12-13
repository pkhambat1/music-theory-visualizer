import itertools
from typing import List

import numpy as np
from core.enums import NoteJump, NoteState
from core.playable import Playable

sampling_rate = 44_100
a0_freq = 27.5
_note_names = itertools.product(np.arange(10), ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])
note_names = list(map(lambda note: note[1]+ str(note[0]), _note_names))

class Note(Playable):
    def __init__(self, note: str):
        self.note = note

    def __str__(self) -> str:
        return f"({self.note})"

    def __repr__(self) -> str:
        return f"({self.note})"

    @staticmethod
    def _get_frequency(note_name: str) -> float:
        semitone_jump = note_names.index(note_name) - note_names.index("A0")
        frequency = a0_freq * (2 ** (1 / 12)) ** semitone_jump
        return frequency

    def compute_wave(self, duration: float = 1) -> np.ndarray:
        freq = Note._get_frequency(self.note)
        samples = np.arange(sampling_rate * duration)
        wave = np.sin(2 * np.pi * freq * samples / sampling_rate)
        return wave
    
class ChordNote(Note):
    def __init__(self, root_note: str, major_scale_interval: int, state: NoteState = NoteState.SAME):
        major_scale_jumps: List[NoteJump] = [NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H]
        major_scale_jumps_cumulative = list(itertools.accumulate([jump.value for jump in major_scale_jumps]))
        note = note_names[note_names.index(root_note) + (0 if major_scale_interval == 1 else major_scale_jumps_cumulative[major_scale_interval - 2])]
        super().__init__(note)
        self.major_scale_interval = major_scale_interval
        self.state = state