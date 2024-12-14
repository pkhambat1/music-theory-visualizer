import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const baseScale = [
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
const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const SQUARE_SIDE = 70;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";
const borderWidth = 1; // Border width in pixels
const lineBorder = `${borderWidth}px solid #333`;

function generateOctaves(octaveCount) {
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => baseScale.map((note) => (note === "C" ? note + octave : note))
  );
}

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

const notes = generateOctaves(4);

export default function NotesGrid() {
  const [bottomNotes, setBottomNotes] = useState(() => {
    const rootIndex = 0; // Default root index

    return majorIntervals.map(
      (interval) => notes[(rootIndex + interval) % notes.length]
    );
  });

  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);

  const [sliderRef] = useKeenSlider({
    loop: false,
    centered: true,
    slides: {
      perView: baseScale.length,
    },

    slideChanged(s) {
      const rootIndex = s.track.details.abs;

      if (rootIndex !== undefined) {
        const updatedNotes = majorIntervals.map(
          (interval) => notes[(rootIndex + interval) % notes.length]
        );

        setBottomNotes(updatedNotes);
      }
    },
  });

  const HoverLines = ({ hoveredIndex }) => {
    if (hoveredIndex === null) return null; // No lines to render when no cell is hovered

    // Generate the positions of the lines for the hovered cell
    const sourcePos = {
      x:
        hoveredIndex * SQUARE_SIDE +
        SQUARE_SIDE / 2 +
        borderWidth +
        ((baseScale.length - majorIntervals.length) / 2) * SQUARE_SIDE,
      y: SQUARE_SIDE * 4 + borderWidth * 5, // Bottom edge of MajorTriads row
    };

    const targetIndices = [hoveredIndex, hoveredIndex + 2, hoveredIndex + 4];
    const bottomGridOffsetX = ((baseScale.length - 7) * SQUARE_SIDE) / 2;

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2, // Ensure these lines are above the regular ones
        }}
      >
        {targetIndices.map((targetIdx) => {
          const targetPos = {
            x:
              targetIdx * SQUARE_SIDE +
              SQUARE_SIDE / 2 +
              bottomGridOffsetX +
              borderWidth,
            y: SQUARE_SIDE * 3 + borderWidth * 3, // Top edge of BottomRow
          };

          return (
            <line
              key={`hover-line-${hoveredIndex}-${targetIdx}`}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="black"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  const Lines = () => {
    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {Array.from({ length: 7 }).map((_, idx) => {
          const topPos = {
            x:
              majorIntervals[idx] * SQUARE_SIDE + SQUARE_SIDE / 2 + borderWidth, // Center of the top square horizontally
            y: SQUARE_SIDE + borderWidth, // Bottom edge of the top square, adjusted for border
          };

          const bottomGridOffsetX = ((baseScale.length - 7) * SQUARE_SIDE) / 2; // Adjust based on alignment
          const bottomPos = {
            x:
              idx * SQUARE_SIDE +
              SQUARE_SIDE / 2 +
              bottomGridOffsetX +
              borderWidth, // Center of the bottom square horizontally
            y: SQUARE_SIDE * 2 + borderWidth * 3, // Top edge of the bottom square, adjusted for border
          };

          // Assertion: Ensure the vertical distance between y2 and y1 equals SQUARE_SIDE
          const verticalDistance = bottomPos.y - topPos.y;
          console.assert(
            verticalDistance === SQUARE_SIDE + 2 * borderWidth,
            `Assertion failed: y2 - y1 = ${verticalDistance}, expected ${SQUARE_SIDE}`
          );

          return (
            <line
              key={idx}
              x1={topPos.x}
              y1={topPos.y}
              x2={bottomPos.x}
              y2={bottomPos.y}
              stroke="black"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  const BottomRow = () => (
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
  );

  const MajorTriads = () => {
    const triads = ["I", "II", "III", "IV", "V", "VI", "VII"];

    return (
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
          {triads.map((triad, idx) => (
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
                background: "#fff",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={() => setHoveredTriadIndex(idx)}
              // onMouseLeave={() => setHoveredTriadIndex(null)}
            >
              {triad}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "fit-content",
        margin: "50px auto",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Dynamic SVG Lines */}
      <Lines />

      {/* Hover Lines */}
      <HoverLines hoveredIndex={hoveredTriadIndex} />

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
            width: `${SQUARE_SIDE * baseScale.length}px`,
            height: `${SQUARE_SIDE}px`,
            zIndex: 1,
            display: "flex",
          }}
        >
          {baseScale.map((_, i) => {
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
                  border: lineBorder,
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
      <BottomRow />

      {/* MAJOR TRIADS */}
      <MajorTriads />
    </div>
  );
}
