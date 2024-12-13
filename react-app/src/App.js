import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const baseScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const SQUARE_SIDE = 70; // Common size for all squares

function generateOctaves(octaveCount) {
  return Array.from({ length: octaveCount }, (_, i) => i + 1)
    .flatMap((octave) =>
      baseScale.map((note) => (note === "C" ? note + octave : note))
    );
}

const notes = generateOctaves(4);

const overlayColumnsTop = 12;
const lineBorder = "1px solid #333"; // Fixed border width
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

export default function NotesGrid() {
  const [bottomNotes, setBottomNotes] = useState(() => {
    const rootIndex = 0; // Default root index
    return majorIntervals.map((interval) =>
      notes[(rootIndex + interval) % notes.length]
    );
  });

  const [sliderRef] = useKeenSlider({
    loop: false,
    centered: true,
    slides: {
      perView: baseScale.length,
    },
    slideChanged(s) {
      const rootIndex = s.track.details.abs;
      if (rootIndex !== undefined) {
        const updatedNotes = majorIntervals.map((interval) =>
          notes[(rootIndex + interval) % notes.length]
        );
        setBottomNotes(updatedNotes);
      }
    },
  });

  function renderNote(note) {
    if (note.startsWith("C") && note.length > 1 && !note.includes("#")) {
      const octave = note.slice(1);
      return (
        <>
          C<sub>{octave}</sub>
        </>
      );
    }
    return note;
  }

  return (
    <div style={{ width: "fit-content", margin: "50px auto", fontFamily: "sans-serif" }}>
      {/* TOP GRID */}
      <div
        style={{
          width: `${SQUARE_SIDE * baseScale.length}px`,
          height: `${SQUARE_SIDE}px`,
          position: "relative",
          boxSizing: "content-box",
          border: lineBorder,
        }}
      >
        {/* Colored boxes behind top notes */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${SQUARE_SIDE * overlayColumnsTop}px`,
            height: `${SQUARE_SIDE}px`,
            zIndex: 1,
            display: "flex",
          }}
        >
          {[...Array(overlayColumnsTop)].map((_, i) => {
            let background;
            if (i === 0) {
              background = pinkColor;
            } else if (majorIntervals.includes(i)) {
              background = greyColor;
            } else {
              background = "transparent";
            }
            return (
              <div
                key={i}
                style={{
                  width: `${SQUARE_SIDE}px`,
                  height: `${SQUARE_SIDE}px`,
                  background: background,
                  boxSizing: "border-box",
                  border:lineBorder,
                }}
              />
            );
          })}
        </div>

        {/* Top notes slider */}
        <div
          ref={sliderRef}
          className="keen-slider"
          style={{
            cursor: "grab",
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {notes.map((note, idx) => (
            <div
              className="keen-slider__slide"
              key={idx}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: `${SQUARE_SIDE}px`,
                height: `${SQUARE_SIDE}px`,
                fontSize: "16px",
                fontWeight: "bold",
                boxSizing: "border-box",
              }}
            >
              {renderNote(note)}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div
        style={{
          width: `${SQUARE_SIDE * 7}px`,
          height: `${SQUARE_SIDE}px`,
          margin: `${SQUARE_SIDE}px auto`,
          position: "relative",
          boxSizing: "content-box",
          background: "#fff",
          border: lineBorder,
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {bottomNotes.map((note, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: `${SQUARE_SIDE}px`,
                height: `${SQUARE_SIDE}px`,
                fontSize: "16px",
                fontWeight: "bold",
                boxSizing: "border-box",
                border: lineBorder,
              }}
            >
              {renderNote(note)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
