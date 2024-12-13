from abc import abstractmethod
import itertools
from typing import Dict, List, Tuple

import numpy as np
from core.enums import ChordType, NoteJump, NoteState, RomanNumeralMajor, RomanNumeralMinor
from core.playable import Playable
from core.note import ChordNote, Note

sampling_rate = 44_100
a0_freq = 27.5
_note_names = itertools.product(np.arange(10), ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])
note_names = list(map(lambda note: note[1]+ str(note[0]), _note_names))

class NotesCollection(Playable):
    @abstractmethod
    def get_notes(self) -> List[Note]:
        pass

class ChordsCollection(Playable):
    @abstractmethod
    def get_chords(self) -> List[Note]:
        pass

class Scale(NotesCollection):

    def __init__(self, root_note: str, scale_type: ChordType = ChordType.MAJOR):
        self.root_note = root_note
        self.scale_type = scale_type

    @staticmethod
    def _scale_type_to_jumps() -> dict[ChordType, List[NoteJump]]:
      return {
          ChordType.MAJOR: [NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H],
          ChordType.MINOR: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W],
          ChordType.HARMONIC_MINOR: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.AUG_2, NoteJump.H],
          ChordType.MAJOR_2: [NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W],
          ChordType.SUS2: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H],
          ChordType.SUS4: [NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W],
          ChordType.DIMINISHED: [NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H],
          ChordType.DIMINISHED_SEVENTH: [NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W],
          ChordType.HALF_DIMINISHED_SEVENTH: [NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W],
          ChordType.AUGMENTED: [NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H],
          ChordType.MINOR_SEVENTH: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H],
          ChordType.HALF_DIMINISHED: [NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W],
          ChordType.MINOR_MAJOR_SEVENTH: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H],
          ChordType.ADD_9: [NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.H],
          ChordType.MINOR_9: [NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.W, NoteJump.H, NoteJump.W, NoteJump.H, NoteJump.H],
      }

    @staticmethod
    def get_notes_for_root_note_and_scale_type(root_note: str, scale_type: ChordType) -> List[Note]:
      jumps = Scale._scale_type_to_jumps()[scale_type] * 2
      jumps_cumulative = list(itertools.accumulate([jump.value for jump in jumps]))
      notes = [Note(root_note)] + [Note(note_names[note_names.index(root_note) + jump]) for jump in jumps_cumulative]
      assert(len(notes) == 8 * 2 - 1)
      return notes

    def get_notes(self) -> List[Note]:
      return Scale.get_notes_for_root_note_and_scale_type(self.root_note, self.scale_type)

    def compute_wave(self, duration: float = 1) -> np.ndarray:
        notes = self.get_notes()
        note_waves = np.array([note.compute_wave(duration) for note in notes])
        return np.concatenate(note_waves[:,:sampling_rate * duration //len(note_waves)])

class Chord(NotesCollection):

    def __init__(self, root_note: str, chord_type: ChordType = ChordType.MAJOR, inversion: int = 0):
      self.root_note=root_note
      self.chord_type=chord_type
      self.inversion=inversion

    def chord_type_to_sequence(self, chord_type: ChordType) -> List[ChordNote]:
        # Define intervals for each chord type, considering NoteState modifiers
        chord_type_to_intervals: Dict[ChordType, List[Tuple]] = {
            ChordType.MAJOR: [(1,), (3,), (5,)],
            ChordType.MINOR: [(1,), (3, NoteState.MINOR), (5,)],
            ChordType.SUS2: [(1,), (2,), (5,)],
            ChordType.SUS4: [(1,), (4,), (5,)],
            ChordType.DIMINISHED: [(1,), (3, NoteState.MINOR), (5, NoteState.MINOR)],
            ChordType.AUGMENTED: [(1,), (3,), (5, NoteState.SHARP)],
            ChordType.MINOR_SEVENTH: [(1,), (3, NoteState.MINOR), (5,), (7, NoteState.MINOR)],
            ChordType.DOMINANT_SEVENTH: [(1,), (3,), (5,), (7, NoteState.MINOR)],
            ChordType.MAJOR_SEVENTH: [(1,), (3,), (5,), (7,)],
            ChordType.HALF_DIMINISHED: [(1,), (3, NoteState.MINOR), (5, NoteState.MINOR), (7, NoteState.MINOR)],
            ChordType.MINOR_MAJOR_SEVENTH: [(1,), (3, NoteState.MINOR), (5,), (7,)]
        }

        return [
            ChordNote(
               self.root_note,
                *interval
            )
            for interval in chord_type_to_intervals[chord_type]
        ]

    def get_notes(self) -> List[Note]:
        notes = self.chord_type_to_sequence(self.chord_type)

        def apply_note_state(note: Note) -> Note:
            if isinstance(note, ChordNote):
                index = note_names.index(note.note)
                if note.state == NoteState.SHARP:
                    return Note(note_names[index + 1])
                elif note.state == NoteState.MINOR:
                    return Note(note_names[index - 1])
            return note

        transformed_notes = [apply_note_state(note) for note in notes]

        if self.inversion > 0:
            shifted_notes = [Note(note_names[(note_names.index(note.note) + 12)]) for note in transformed_notes[:self.inversion]]
            return transformed_notes[self.inversion:] + shifted_notes

        return transformed_notes

    def compute_wave(self, duration=1,should_arpeggiate=False):
          notes: List[Note] = self.get_notes()
          [print(note) for note in notes]
          note_waves = np.array([note.compute_wave(duration) for note in notes])
          if should_arpeggiate:
            return np.concatenate(note_waves[:,:sampling_rate * duration //len(note_waves)])
          else:
            return np.sum(note_waves, axis=0)


class Triad(NotesCollection):

    def __init__(self, root_note: str, scale_root_note: str, scale_type: ChordType = ChordType.MAJOR):
      self.root_note=root_note
      self.scale_root_note = scale_root_note
      self.scale_type = scale_type

    def __repr__(self):
      scale: List[Note] = Scale.get_notes_for_root_note_and_scale_type(self.scale_root_note, self.scale_type)
      raw_notes: List[str] = [note.note for note in scale]
      number = raw_notes.index(self.root_note)
      symbol = ([numeral for numeral in (RomanNumeralMajor if self.scale_type == ChordType.MAJOR else RomanNumeralMinor)] * 2)[number].value
      return f"Triad {symbol} of {self.scale_root_note} ({self.get_notes()})"

    def get_notes(self) -> List[Note]:
      scale: List[Note] = Scale.get_notes_for_root_note_and_scale_type(self.scale_root_note, self.scale_type)
      raw_notes: List[str] = [note.note for note in scale]
      return [
                Note(self.root_note),
                Note(raw_notes[raw_notes.index(self.root_note) + 2]),
                Note(raw_notes[raw_notes.index(self.root_note) + 4]),
              ]

    def compute_wave(self, duration=1,should_arpeggiate=False):
          notes: List[Note] = self.get_notes()
          # assert(len(notes) == 3)
          note_waves = np.array([note.compute_wave(duration) for note in notes])
          if should_arpeggiate:
            return np.concatenate(note_waves[:,:sampling_rate * duration //len(note_waves)])
          else:
            return np.sum(note_waves, axis=0)
          
class ScaleToneSeventhTriad(Triad):

    def __init__(self, root_note: str, scale_root_note: str, scale_type: ChordType = ChordType.MAJOR):
      super().__init__(root_note, scale_root_note, scale_type)

    def get_notes(self) -> List[Note]:
      scale: List[Note] = Scale.get_notes_for_root_note_and_scale_type(self.scale_root_note, self.scale_type)
      raw_notes: List[str] = [note.note for note in scale]
      return super().get_notes() + [Note(raw_notes[raw_notes.index(self.root_note) + 6])]

          
class Key(ChordsCollection):

    def __init__(self, root_note: str, key_type: ChordType = ChordType.MAJOR):
      self.root_note=root_note
      self.key_type=key_type

    def __repr__(self):
      return f"Key of {self.root_note} {self.key_type.value} ({self.get_chords()})"

    def get_scale(self) -> List[Note]:
      return Scale.get_notes_for_root_note_and_scale_type(self.root_note, self.key_type)[:8]

    def get_chords(self) -> List[Triad]:
        return [Triad(note.note, self.root_note, self.key_type) for note in self.get_scale()]

    def compute_wave(self, duration=1):
        key_waves = np.array([triad.compute_wave(duration) for triad in self.get_chords()])
        return np.concatenate(key_waves[:,:sampling_rate * duration //len(key_waves)])
