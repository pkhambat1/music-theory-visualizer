import * as Tone from "tone";
import baseNotes from "../constants/notes.json";

export function generateOctaves(octaveCount) {
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => baseNotes.map((note) => note + octave)
  );
}

export function renderNote(note) {
  if (!isNaN(parseInt(note.charAt(note.length - 1)))) {
    const noteWithoutOctave = note.slice(0, -1);
    return (
      <>
        {noteWithoutOctave}
        {noteWithoutOctave === "C" && <sub>{note.slice(-1)}</sub>}
      </>
    );
  }
  return note;
}

let sampler;

const initializeSampler = () => {
  if (!sampler) {
    console.log("initializing it");
    // Initialize Tone.js sampler only once
    sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
  }
};

export async function playChord(notes) {
  initializeSampler();
  Tone.loaded().then(() => {
    sampler.triggerAttackRelease(notes, "1n"); // Adjust timing as needed
  });
}

export async function playNote(note) {
  initializeSampler();
  Tone.loaded().then(() => {
    sampler.triggerAttackRelease(note, "1n"); // Adjust timing as needed
  });
}
