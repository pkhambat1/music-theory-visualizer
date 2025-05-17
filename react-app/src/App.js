import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRow from "./components/DistonicScaleDegreesRow";
import LineGroup from "./components/LineGroup";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import { renderNote, generateOctaves, playNote } from "./utils/helpers";
import NotesArray from "./components/NotesArray";
import { DownOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import { Dropdown, Space, Select, List, Avatar, Input } from "antd";
import NotesUtils from "./utils/NotesUtils";

const squareSidePx = 60;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

const defaultRootNote = "C3";
export const baseScaleLeftOverflow = 5;
export const baseScaleWithOverflowSize =
  NotesUtils.chromaticScale.length + 2 * baseScaleLeftOverflow;
export const borderPx = 1.5;
export const baseScaleLeftOverflowSize =
  (baseScaleWithOverflowSize - NotesUtils.chromaticScale.length) / 2;
export const getLineBorder = (borderWidth) => `${borderWidth}px solid #333`;

export const notes = generateOctaves(6);

function modeIntervalsToMode(rootNote, intervals) {
  // return intervals.map((inter) => notes[inter + notes.indexOf(rootNote)]);
  return intervals.map((inter) => inter + notes.indexOf(rootNote));
}

export function addOverflowToModeIntervals(modeIntervals) {
  return [
    ...[2, 3, 4, 5, 6].map(
      (idx) => modeIntervals[idx] - (NotesUtils.chromaticScale.length - 1)
    ),
    ...modeIntervals,
    ...[1, 2, 3, 4, 5].map(
      (idx) => modeIntervals[idx] + NotesUtils.chromaticScale.length - 1
    ),
  ];
}

export const modeLeftOverflowSize =
  (addOverflowToModeIntervals(NotesUtils.modes["Ionian (major)"]).length -
    NotesUtils.modes["Ionian (major)"].length) /
  2;

export default function App() {
  const [selectedMode, setSelectedMode] = useState("Ionian (major)");
  const [rootNote, setRootNote] = useState(defaultRootNote);
  const modeIntervals = NotesUtils.modes[selectedMode];
  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals)
  );

  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals);
    setModeNotesWithOverflow(
      modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current)
    );
  }, [rootNote, modeIntervals]);
  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState(() => {
    return modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current);
  });
  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);
  // const [hoveredSeventhChordIndex, setHoveredSeventhChordIndex] =
  //   useState(null);
  const [triadNotes, setTriadNotes] = useState([]);
  // Initializze to empty array size 7
  const [majorScaleNotes, setMajorScaleNotes] = useState([
    ...Array(NotesUtils.modes["Ionian (major)"].length),
  ]);

  const [sliderRef, sliderInstanceRef] = useKeenSlider({
    centered: true,
    slides: {
      perView: baseScaleWithOverflowSize,
    },
    initial: notes.indexOf(defaultRootNote) - baseScaleLeftOverflowSize,

    slideChanged(s) {
      console.log("Slider changed event!", {
        position: s.track.details.abs,
        newRootIndex: s.track.details.abs + baseScaleLeftOverflowSize,
        newRootNote: notes[s.track.details.abs + baseScaleLeftOverflowSize],
      });
      const rootIndex = s.track.details.abs + baseScaleLeftOverflowSize;
      setRootNote(notes[rootIndex]);
    },
  });

  const items = Object.keys(NotesUtils.modes).map((mode) => ({
    key: mode,
    label: mode,
  }));

  const [selectedExtensions, setSelectedExtensions] = useState(
    Array.from({ length: modeIntervals.length }, () => [])
  );

  // Add these new state variables for the chat after the existing state variables
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Replace the existing useEffect with a simpler one that just logs the key
  useEffect(() => {
    console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);
  }, []);

  // Add this ref for the message container
  const messagesContainerRef = useRef(null);

  // Add useEffect for auto-scrolling
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]); // Re-run whenever messages change

  // Simplify handleSendMessage
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const newUserMessage = { type: "user", content: inputValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsChatLoading(true);

    try {
      // Define function for changing key
      const functions = [
        {
          name: "set_key",
          description: "Set the root note/key of the musical scale",
          parameters: {
            type: "object",
            properties: {
              new_key: {
                type: "string",
                description: "The new root note, like C3, F#4, etc.",
              },
            },
            required: ["new_key"],
          },
        },
      ];

      // Enhanced system message to recognize more variants
      const systemMessage = {
        role: "system",
        content: `You are a music assistant. Your primary job is to help users set their musical key when requested.

IMPORTANT: When the user asks to change the key in ANY way, ALWAYS use the set_key function.

NEVER respond with plain text for key changes. If you see ANY of these patterns (or similar):
- "set key to X"
- "set to X"
- "change key to X"
- "change to X"
- "make the key X"

You MUST respond with a function call to set_key with the new_key parameter.

If the user doesn't specify an octave (like just saying "G" instead of "G3"), use octave 3 as default.

IMPORTANT: The set_key function is the ONLY way to change keys. TEXT RESPONSES CANNOT CHANGE KEYS.

Current key: ${rootNote}
Current mode: ${selectedMode}`,
      };

      // Build API messages - just the necessary context
      const apiMessages = [
        systemMessage,
        // Convert only true conversation messages (user/ai) for the API context
        ...messages
          .slice(-5)
          .filter(
            (msg) =>
              msg.type === "user" ||
              (msg.type === "ai" && !msg.content.includes("Key"))
          )
          .map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        // Add the new user message
        { role: "user", content: inputValue },
      ];

      // Log exactly what we're sending to the API
      console.log("Sending to API:", JSON.stringify(apiMessages, null, 2));

      // Make API call
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: apiMessages,
            functions: functions,
            function_call: "auto",
          }),
        }
      );

      const data = await response.json();
      console.log("Raw AI response:", JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message) {
        throw new Error("Invalid API response");
      }

      const responseMessage = data.choices[0].message;
      console.log(
        "Response message:",
        JSON.stringify(responseMessage, null, 2)
      );

      // Handle function call for setting key
      if (responseMessage.function_call?.name === "set_key") {
        try {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments
          );

          if (functionArgs.new_key) {
            // Add AI response to chat if provided (usually null for function calls)
            if (responseMessage.content) {
              setMessages((prev) => [
                ...prev,
                {
                  type: "ai",
                  content: responseMessage.content,
                },
              ]);
            }

            // Try to move slider to set the key
            const targetNoteIndex = notes.indexOf(functionArgs.new_key);

            if (
              targetNoteIndex !== -1 &&
              sliderInstanceRef.current?.moveToIdx
            ) {
              const targetPosition =
                targetNoteIndex - baseScaleLeftOverflowSize;
              sliderInstanceRef.current.moveToIdx(targetPosition);

              // Add confirmation that clearly indicates it's a UI message, not from the AI
              setMessages((prev) => [
                ...prev,
                {
                  type: "system", // Changed from "ai" to "system"
                  content: `✓ Key changed to ${functionArgs.new_key}`,
                },
              ]);
            } else {
              // Handle failure
              setMessages((prev) => [
                ...prev,
                {
                  type: "system", // Changed from "ai" to "system"
                  content: `⚠️ Couldn't set key to ${functionArgs.new_key}`,
                },
              ]);
            }
          }
        } catch (e) {
          console.error("Error handling function call:", e);
          setMessages((prev) => [
            ...prev,
            {
              type: "system", // Changed from "ai" to "system"
              content: "⚠️ Error processing key change",
            },
          ]);
        }
      } else {
        // For regular responses, just add the message
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: responseMessage.content || "I'm not sure how to respond.",
          },
        ]);
      }
    } catch (error) {
      console.error("API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I encountered an error.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
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
      <NotesArray squareSidePx={squareSidePx} show_border={false}>
        <h1>
          You're in Key of {renderNote(rootNote)} mode{" "}
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                setSelectedMode(key);
              },
            }}
            trigger={["click"]}
          >
            <Space>
              {selectedMode} <DownOutlined />
            </Space>
          </Dropdown>
        </h1>
      </NotesArray>

      <LineGroup
        aboveRowIntervals={NotesUtils.modes["Ionian (major)"]}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={1}
        belowRowSquareSidePx={squareSidePx}
        isBelowRowModeInterval={true}
      />
      <LineGroup
        aboveRowIntervals={modeIntervals}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={3}
        belowRowSquareSidePx={squareSidePx}
        isBelowRowModeInterval={true}
      />
      <LineGroup
        aboveRowIntervals={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={5}
        belowRowSquareSidePx={squareSidePx * 2}
        isBelowRowModeInterval={false}
      />

      <HoverLines
        hoveredIndex={hoveredTriadIndex}
        SQUARE_SIDE={squareSidePx}
        borderWidth={borderPx}
        baseScale={NotesUtils.chromaticScale}
        majorIntervals={modeIntervals}
        belowRowIndex={5}
      />

      <TriadScale
        baseScale={NotesUtils.chromaticScale}
        squareSidePx={squareSidePx}
        triadNotes={triadNotes}
        notes={notes}
      />

      {/* Major scale row */}
      <NotesArray
        squareSidePx={squareSidePx}
        marginPx={squareSidePx}
        size={NotesUtils.modes[selectedMode].length}
      >
        {majorScaleNotes.map((note, idx) => (
          <NoteCell squareSidePx={squareSidePx} idx={idx} key={idx}>
            {note && renderNote(note)}
          </NoteCell>
        ))}
      </NotesArray>

      <NotesArray
        squareSidePx={squareSidePx}
        marginPx={squareSidePx}
        size={baseScaleWithOverflowSize}
        show_border={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            display: "flex",
            translate: `${
              (baseScaleLeftOverflowSize * 100) /
              NotesUtils.chromaticScale.length
            }%`,
            outline: getLineBorder(borderPx), // HACK: cause `border` seems to break things
          }}
        >
          {NotesUtils.chromaticScale.map((_, idx) => {
            let background = null;
            if (idx === 0) {
              background = pinkColor;
            } else if (modeIntervals.includes(idx)) {
              background = greyColor;
            }
            return (
              <NoteCell
                key={idx}
                squareSidePx={squareSidePx}
                opt_background={background}
              />
            );
          })}
        </div>

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
            <NoteCell
              key={idx}
              idx={idx}
              squareSidePx={squareSidePx}
              className="keen-slider__slide"
              show_border={false}
              onClick={() => playNote(note)}
            >
              {renderNote(note)}
            </NoteCell>
          ))}
        </div>
      </NotesArray>

      {/* Mode row */}
      <NotesArray
        squareSidePx={squareSidePx}
        size={modeNotesWithOverflow.length}
        marginPx={squareSidePx}
        show_border={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            display: "flex",
            translate: `${
              (modeLeftOverflowSize * 100) / modeIntervals.length
            }%`,
            outline: getLineBorder(borderPx), // HACK: cause `border` seems to break things
          }}
        >
          {/* Just boxes */}
          {modeIntervals.map((_, idx) => {
            return <NoteCell key={idx} squareSidePx={squareSidePx} idx={idx} />;
          })}
        </div>

        {modeNotesWithOverflow.map((note, idx) => {
          const noteString = notes[note];
          return (
            <NoteCell
              squareSidePx={squareSidePx}
              idx={idx}
              key={idx}
              show_border={false}
              onClick={() => playNote(noteString)}
            >
              {noteString && renderNote(noteString)}
            </NoteCell>
          );
        })}
      </NotesArray>

      <DiatonicScaleDegreesRow
        SQUARE_SIDE={squareSidePx}
        modeNotesWithOverflow={modeNotesWithOverflow}
        setHoveredChordIndex={setHoveredTriadIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        chordType="triads"
        setMajorScaleNotes={setMajorScaleNotes}
        selectedExtensions={selectedExtensions}
      />

      {/* Seventh chords */}
      {/* <DiatonicScaleDegreesRow
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredChordIndex={setHoveredSeventhChordIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
        chordType="seventhChords"
        selectedExtensions={selectedExtensions}
      /> */}

      {/* Variation Controls */}
      <NotesArray
        size={modeIntervals.length}
        squareSidePx={squareSidePx * 2}
        marginPx={squareSidePx}
      >
        {Array.from({ length: modeIntervals.length }).map((_, i) => (
          <NoteCell
            key={i}
            squareSidePx={squareSidePx * 2}
            overflow="visible"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%", // Adjust the width as needed
              minWidth: "100px", // Ensures a minimum width for smaller screens
              padding: "10px",
              boxSizing: "border-box",
            }}
          >
            <Select
              mode="multiple"
              placeholder="Select an option"
              options={[
                { value: "maj", label: "maj" },
                { value: "m", label: "m" },
                { value: "dim", label: "dim" },
                { value: "aug", label: "aug" },
                { value: "sus2", label: "sus2" },
                { value: "sus4", label: "sus4" },
                { value: "7", label: "7" },
                { value: "maj7", label: "maj7" },
                { value: "add9", label: "add9" },
                { value: "9", label: "9" },
              ]}
              style={{
                width: "100px",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onChange={(value) => {
                setSelectedExtensions((prev) => {
                  const newExtensions = [...prev];
                  newExtensions[i] = value;
                  console.log("selectedExtensions", newExtensions);
                  return newExtensions;
                });
              }}
              maxCount={3}
            />
          </NoteCell>
        ))}
      </NotesArray>

      {/* Add the chat interface at the bottom, after all existing components */}
      <div style={{ marginTop: "100px", width: "100%" }}>
        <NotesArray
          squareSidePx={squareSidePx * 2}
          size={4}
          marginPx={squareSidePx}
          show_border={false}
        >
          <div
            style={{
              width: "100%",
              height: "400px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
              background: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "10px",
                borderBottom: "1px solid #f0f0f0",
                background: "#f9f9f9",
              }}
            >
              <h3 style={{ margin: 0 }}>AI Music Assistant</h3>
            </div>
            <div
              style={{ flex: 1, overflowY: "auto", padding: "16px" }}
              ref={messagesContainerRef}
            >
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item
                    style={{
                      justifyContent:
                        msg.type === "user" ? "flex-end" : "flex-start",
                      padding: "8px 0",
                      borderBottom: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        maxWidth: "80%",
                        flexDirection:
                          msg.type === "user" ? "row-reverse" : "row",
                      }}
                    >
                      {msg.type !== "system" && (
                        <Avatar
                          icon={
                            msg.type === "user" ? (
                              <UserOutlined />
                            ) : (
                              <RobotOutlined />
                            )
                          }
                        />
                      )}
                      <div
                        style={{
                          background:
                            msg.type === "user"
                              ? "#e6f7ff"
                              : msg.type === "system"
                              ? "#f6ffed" // Light green for system messages
                              : "#f0f0f0", // Gray for AI
                          padding: "8px 12px",
                          borderRadius: "8px",
                          wordBreak: "break-word",
                          fontStyle:
                            msg.type === "system" ? "italic" : "normal",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
              <Input.Search
                placeholder="Ask about music theory or set key..."
                enterButton="Send"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSearch={handleSendMessage}
                loading={isChatLoading}
              />
            </div>
          </div>
        </NotesArray>
      </div>
    </div>
  );
}
