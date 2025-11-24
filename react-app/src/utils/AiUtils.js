import NotesUtils from "./NotesUtils";

/**
 * AiUtils class encapsulates all AI-related functionality for the music theory application.
 * This class handles interactions with the OpenAI API and processes AI responses.
 */
class AiUtils {
  // Class constants
  static MODEL_NAME = "gpt-4o-mini";
  static API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  static MAX_TOKENS = 1024;
  static CONTEXT_TYPES = {
    APPLICATION: "APPLICATION",
    CHORD_BUILDER: "CHORD_BUILDER",
  };

  /**
   * Creates a new instance of AiUtils.
   * @param {string} apiKey - The OpenAI API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = AiUtils.API_ENDPOINT;
    this.model = AiUtils.MODEL_NAME;
  }

  /**
   * Defines the available functions that the AI can call.
   * @returns {Array} Array of function definitions
   */
  static getAvailableFunctions() {
    return [
      {
        name: "set_key",
        description: "Set the application root note/key of the musical scale.",
        parameters: {
          type: "object",
          properties: {
            new_key: {
              type: "string",
              description: "The application root note, like C3, F#4, etc.",
            },
          },
          required: ["new_key"],
        },
      },
      {
        name: "set_mode",
        description: "Change the application musical mode/scale type.",
        parameters: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              description: "The application mode to change to.",
              enum: Object.keys(NotesUtils.modes),
            },
          },
          required: ["mode"],
        },
      },
      {
        name: "set_chord_progression_key",
        description: "Set the root note/key for the chord builder.",
        parameters: {
          type: "object",
          properties: {
            progression_key: {
              type: "string",
              description: "The chord builder root note, like C3, F#4, etc.",
            },
          },
          required: ["progression_key"],
        },
      },
      {
        name: "set_chord_progression_mode",
        description:
          "Change the musical mode/scale type for the chord builder.",
        parameters: {
          type: "object",
          properties: {
            progression_mode: {
              type: "string",
              description: "The chord builder mode to change to.",
              enum: Object.keys(NotesUtils.modes),
            },
          },
          required: ["progression_mode"],
        },
      },
      {
        name: "set_extension",
        description:
          "Set chord extensions for a specific scale degree in the chord builder.",
        parameters: {
          type: "object",
          properties: {
            scale_degree: {
              type: "integer",
              description: "The scale degree (1-7) to modify extensions for",
              minimum: 1,
              maximum: 7,
            },
            extensions: {
              type: "array",
              description: "The extension(s) to apply to this chord",
              items: {
                type: "string",
                enum: [
                  "maj",
                  "m",
                  "dim",
                  "aug",
                  "sus2",
                  "sus4",
                  "7",
                  "maj7",
                  "add9",
                  "9",
                ],
              },
            },
          },
          required: ["scale_degree", "extensions"],
        },
      },
      {
        name: "build_chord_progression",
        description: "Build a custom chord progression in the chord builder.",
        parameters: {
          type: "object",
          properties: {
            chords: {
              type: "array",
              description: "The chord progression to build",
              items: {
                type: "object",
                properties: {
                  degree: {
                    type: "integer",
                    description: "Scale degree (1-7)",
                    minimum: 1,
                    maximum: 7,
                  },
                  extensions: {
                    type: "array",
                    description: "List of extensions to apply",
                    items: {
                      type: "string",
                      enum: [
                        "maj",
                        "m",
                        "dim",
                        "aug",
                        "sus2",
                        "sus4",
                        "7",
                        "maj7",
                        "add9",
                        "9",
                      ],
                    },
                  },
                },
                required: ["degree"],
              },
            },
          },
          required: ["chords"],
        },
      },
    ];
  }

  /**
   * Creates a system message for the AI with current context.
   * @param {string} currentKey - The current musical key
   * @param {string} currentMode - The current musical mode
   * @param {string} currentChordProgressionKey - The current chord progression key
   * @param {string} currentChordProgressionMode - The current chord progression mode
   * @returns {Object} System message object
   */
  static createSystemMessage(
    currentKey,
    currentMode,
    currentChordProgressionKey,
    currentChordProgressionMode
  ) {
    const availableModes = Object.keys(NotesUtils.modes).join(", ");
    return {
      role: "system",
      content: `You are an expert music assistant with the ability to modify the application's state.

CRITICAL INSTRUCTIONS FOR FUNCTION CALLS:
1. When a request implies changes to both key and mode (e.g., "G Melodic Minor", "F# minor"):
   - You MUST make TWO separate function calls: set_key AND set_mode.
   - Never skip either one when both are implied.

2. When a request involves setting context then performing an action:
   - You MUST make ALL necessary function calls in sequence.
   - Example: "Build I V VI I in C major for Chord Builder"
   - Requires: set_chord_progression_key → set_chord_progression_mode → build_chord_progression

3. Never announce context assumptions in your responses.

MODE SYNONYMS (use the EXACT target value shown on the right when calling set_mode or set_chord_progression_mode):
- "Major", "Ionian" → Ionian (major)
- "Minor", "Natural Minor", "Aeolian" → Aeolian (natural minor)
- "Harmonic minor" → Harmonic Minor
- "Melodic minor" → Melodic Minor
- "Dorian" → Dorian
- "Phrygian" → Phrygian
- "Lydian" → Lydian
- "Mixolydian" → Mixolydian
- "Locrian" → Locrian

CONTEXT RULES:
- If not specified as "Chord Builder", assume changes apply to the APPLICATION.
- Be precise, direct, and complete in your actions.

FUNCTION REFERENCE:

set_key:
- Changes the APPLICATION root note.
- Parameters: { "new_key": "string" }
- Example: { "new_key": "G3" }

set_mode:
- Changes the APPLICATION mode.
- Parameters: { "mode": "string" }
- Example: { "mode": "Melodic Minor" }
- Valid modes: ${availableModes}

set_chord_progression_key:
- Changes the CHORD BUILDER root note.
- Parameters: { "progression_key": "string" }
- Example: { "progression_key": "C3" }

set_chord_progression_mode:
- Changes the CHORD BUILDER mode.
- Parameters: { "progression_mode": "string" }
- Example: { "progression_mode": "Lydian" }
- Valid modes: ${availableModes}

set_extension:
- Adds chord extensions to scale degrees in CHORD BUILDER.
- Parameters: { "scale_degree": integer, "extensions": array_of_strings }
- Example: { "scale_degree": 3, "extensions": ["maj7"] }

build_chord_progression:
- Creates a chord progression in CHORD BUILDER.
- Parameters: { "chords": array_of_objects }
- Example: { "chords": [{ "degree": 1 }, { "degree": 4 }, { "degree": 5 }, { "degree": 1 }] }
- Each chord object needs: "degree" (required) and optionally "extensions" (array).

CURRENT STATE:
- APPLICATION: Key: ${currentKey}, Mode: ${currentMode}
- CHORD BUILDER: Key: ${currentChordProgressionKey}, Mode: ${currentChordProgressionMode}`,
    };
  }

  /**
   * Creates the API request payload for the OpenAI API.
   * @param {Array} messages - The conversation messages
   * @returns {Object} The request payload
   */
  createApiRequestPayload(messages) {
    return {
      model: this.model,
      messages,
      tools: AiUtils.getAvailableFunctions().map((fn) => ({
        type: "function",
        function: fn,
      })),
      tool_choice: "auto",
      max_tokens: AiUtils.MAX_TOKENS,
    };
  }

  /**
   * Sends a message to the AI and processes the response.
   * @param {string} userMessage - The user's message
   * @param {string} currentKey - The current musical key
   * @param {string} currentMode - The current musical mode
   * @param {string} currentChordProgressionKey - The current chord progression key
   * @param {string} currentChordProgressionMode - The current chord progression mode
   * @returns {Promise<Object>} The AI's response
   */
  async sendMessage(
    userMessage,
    currentKey,
    currentMode,
    currentChordProgressionKey,
    currentChordProgressionMode
  ) {
    try {
      const systemMessage = AiUtils.createSystemMessage(
        currentKey,
        currentMode,
        currentChordProgressionKey,
        currentChordProgressionMode
      );
      const apiMessages = [
        systemMessage,
        { role: "user", content: userMessage },
      ];

      const requestPayload = this.createApiRequestPayload(apiMessages);
      const response = await this.makeApiRequest(requestPayload);

      return this.validateAndExtractResponse(response);
    } catch (error) {
      console.error("AI API error:", error);
      throw error;
    }
  }

  /**
   * Makes the API request to the OpenAI API.
   * @param {Object} requestPayload - The request payload
   * @returns {Promise<Object>} The API response
   */
  async makeApiRequest(requestPayload) {
    return fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    }).then((response) => response.json());
  }

  /**
   * Validates and extracts the response from the API.
   * @param {Object} data - The API response data
   * @returns {Object} The validated response message
   */
  validateAndExtractResponse(data) {
    if (!data.choices?.[0]?.message) {
      throw new Error("Invalid API response");
    }
    return data.choices[0].message;
  }

  /**
   * Processes a function call from the AI response.
   * @param {Object} functionCall - The function call object from the AI response
   * @param {Object} responseMessage - The full response message from the AI
   * @returns {Object} The processed function call result
   */
  static processFunctionCall(functionCall, responseMessage) {
    const functionName = functionCall.function.name;
    let functionArgs;

    try {
      functionArgs = JSON.parse(functionCall.function.arguments);
    } catch (error) {
      console.error(`Error parsing arguments for ${functionName}:`, error);
      functionArgs = {};
    }

    return {
      functionName,
      functionArgs,
      responseMessage: responseMessage.content || null,
    };
  }

  /**
   * Handles a set_key function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Array} notes - The available notes
   * @param {Object} sliderInstanceRef - Reference to the slider instance
   * @param {number} baseScaleLeftOverflowSize - The base scale left overflow size
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleSetKey(
    functionArgs,
    notes,
    sliderInstanceRef,
    baseScaleLeftOverflowSize,
    addMessage
  ) {
    if (!functionArgs.new_key) {
      addMessage({
        type: "system",
        content: "⚠️ Missing new_key parameter for set_key",
      });
      return false;
    }

    const targetNoteIndex = notes.indexOf(functionArgs.new_key);
    if (targetNoteIndex === -1) {
      addMessage({
        type: "system",
        content: `⚠️ Invalid key: ${functionArgs.new_key}`,
      });
      return false;
    }

    if (!sliderInstanceRef?.current?.moveToIdx) {
      addMessage({
        type: "system",
        content: `⚠️ Slider not ready to change key to ${functionArgs.new_key}`,
      });
      return false;
    }

    const targetPosition = targetNoteIndex - baseScaleLeftOverflowSize;
    sliderInstanceRef.current.moveToIdx(targetPosition);

    addMessage({
      type: "system",
      content: `✓ Key changed to ${functionArgs.new_key}`,
    });
    return true;
  }

  /**
   * Handles a set_mode function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Function} setSelectedMode - Function to set the selected mode
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleSetMode(functionArgs, setSelectedMode, addMessage) {
    if (!functionArgs.mode) {
      addMessage({
        type: "system",
        content: "⚠️ Missing mode parameter for set_mode",
      });
      return false;
    }

    // Normalize mode name to match NotesUtils.modes keys
    const canonicalMode = AiUtils.normalizeModeName(functionArgs.mode);
    if (!canonicalMode) {
      addMessage({
        type: "system",
        content: `⚠️ Unknown mode: ${functionArgs.mode}`,
      });
      return false;
    }

    setSelectedMode(canonicalMode);
    addMessage({
      type: "system",
      content: `✓ Mode changed to ${canonicalMode}`,
    });
    return true;
  }

  /**
   * Handles a set_chord_progression_key function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Function} setChordProgressionKey - Function to set the chord progression key
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleSetChordProgressionKey(
    functionArgs,
    setChordProgressionKey,
    addMessage
  ) {
    if (!functionArgs.progression_key) {
      addMessage({
        type: "system",
        content: "⚠️ Missing progression_key parameter",
      });
      return false;
    }

    setChordProgressionKey(functionArgs.progression_key);
    addMessage({
      type: "system",
      content: `✓ Chord Builder key changed to ${functionArgs.progression_key}`,
    });
    return true;
  }

  /**
   * Handles a set_chord_progression_mode function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Function} setChordProgressionMode - Function to set the chord progression mode
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleSetChordProgressionMode(
    functionArgs,
    setChordProgressionMode,
    addMessage
  ) {
    if (!functionArgs.progression_mode) {
      addMessage({
        type: "system",
        content: "⚠️ Missing progression_mode parameter",
      });
      return false;
    }

    const canonicalMode = AiUtils.normalizeModeName(
      functionArgs.progression_mode
    );
    if (!canonicalMode) {
      addMessage({
        type: "system",
        content: `⚠️ Unknown chord progression mode: ${functionArgs.progression_mode}`,
      });
      return false;
    }

    setChordProgressionMode(canonicalMode);
    addMessage({
      type: "system",
      content: `✓ Chord Builder mode changed to ${canonicalMode}`,
    });
    return true;
  }

  /**
   * Handles a set_extension function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Array} modeIntervals - The mode intervals
   * @param {Function} setSelectedExtensions - Function to set the selected extensions
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleSetExtension(
    functionArgs,
    modeIntervals,
    setSelectedExtensions,
    addMessage
  ) {
    // Validate parameters
    if (!functionArgs.scale_degree) {
      addMessage({
        type: "system",
        content: "⚠️ Missing scale_degree parameter",
      });
      return false;
    }

    if (!functionArgs.extensions || !Array.isArray(functionArgs.extensions)) {
      addMessage({
        type: "system",
        content: "⚠️ Missing or invalid extensions parameter",
      });
      return false;
    }

    const degreeIndex = functionArgs.scale_degree - 1;
    if (degreeIndex < 0 || degreeIndex >= modeIntervals.length) {
      addMessage({
        type: "system",
        content: `⚠️ Invalid scale degree: ${functionArgs.scale_degree}`,
      });
      return false;
    }

    // Update extensions
    setSelectedExtensions((prev) => {
      const newExtensions = [...prev];
      newExtensions[degreeIndex] = functionArgs.extensions;
      return newExtensions;
    });

    // Format message
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const romanNumeral = romanNumerals[degreeIndex];

    addMessage({
      type: "system",
      content: `✓ Set ${romanNumeral} chord extensions to ${functionArgs.extensions.join(
        ", "
      )}`,
    });
    return true;
  }

  /**
   * Handles a build_chord_progression function call.
   * @param {Object} functionArgs - The arguments for the function call
   * @param {Function} setChordProgression - Function to set the chord progression
   * @param {Function} addMessage - Function to add a message to the chat
   * @returns {boolean} Whether the operation was successful
   */
  static handleBuildChordProgression(
    functionArgs,
    setChordProgression,
    addMessage
  ) {
    if (!functionArgs.chords || !Array.isArray(functionArgs.chords)) {
      addMessage({
        type: "system",
        content: "⚠️ Invalid chord progression format",
      });
      return false;
    }

    // Validate and sanitize each chord
    const validatedChords = functionArgs.chords.map((chord) => {
      if (typeof chord !== "object" || chord === null) {
        return { degree: 1, extensions: [] };
      }

      const degree =
        typeof chord.degree === "number" &&
        chord.degree >= 1 &&
        chord.degree <= 7
          ? chord.degree
          : 1;

      const extensions = Array.isArray(chord.extensions)
        ? chord.extensions
        : [];

      return { degree, extensions };
    });

    setChordProgression(validatedChords);

    // Format the progression for display
    const formattedProgression =
      AiUtils.formatChordProgression(validatedChords);

    addMessage({
      type: "system",
      content: `✓ Built chord progression: ${formattedProgression}`,
    });
    return true;
  }

  /**
   * Formats a chord progression for display.
   * @param {Array} chords - The chord progression
   * @returns {string} The formatted chord progression
   */
  static formatChordProgression(chords) {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

    return chords
      .map((chord) => {
        const degree = romanNumerals[chord.degree - 1] || "?";
        const extensions = chord.extensions?.join(",") || "";
        return extensions ? `${degree}${extensions}` : degree;
      })
      .join(" - ");
  }

  /**
   * Processes a tool call and executes the appropriate handler.
   * @param {Object} toolCall - The tool call object from the AI response
   * @param {Object} responseMessage - The full response message from the AI
   * @param {Object} handlers - Object containing handler functions and necessary parameters
   * @returns {boolean} Whether the operation was successful
   */
  static processToolCall(toolCall, responseMessage, handlers) {
    // Validate toolCall
    if (!toolCall || !toolCall.function || !toolCall.function.name) {
      console.error("Invalid tool call:", toolCall);
      return {
        success: false,
        functionName: undefined,
        functionArgs: {},
        toolCallId: toolCall?.id,
      };
    }

    const { functionName, functionArgs } = AiUtils.processFunctionCall(
      toolCall,
      responseMessage
    );

    // Log the detected tool and its arguments
    console.log(
      `AI detected tool: ${functionName} with arguments:`,
      functionArgs
    );

    let success = false;
    switch (functionName) {
      case "set_key":
        success = AiUtils.handleSetKey(
          functionArgs,
          handlers.notes,
          handlers.sliderInstanceRef,
          handlers.baseScaleLeftOverflowSize,
          handlers.addMessage
        );
        break;
      case "set_mode":
        success = AiUtils.handleSetMode(
          functionArgs,
          handlers.setSelectedMode,
          handlers.addMessage
        );
        break;
      case "set_chord_progression_key":
        success = AiUtils.handleSetChordProgressionKey(
          functionArgs,
          handlers.setChordProgressionKey,
          handlers.addMessage
        );
        break;
      case "set_chord_progression_mode":
        success = AiUtils.handleSetChordProgressionMode(
          functionArgs,
          handlers.setChordProgressionMode,
          handlers.addMessage
        );
        break;
      case "set_extension":
        success = AiUtils.handleSetExtension(
          functionArgs,
          handlers.modeIntervals,
          handlers.setSelectedExtensions,
          handlers.addMessage
        );
        break;
      case "build_chord_progression":
        success = AiUtils.handleBuildChordProgression(
          functionArgs,
          handlers.setChordProgression,
          handlers.addMessage
        );
        break;
      default:
        console.warn(`Unknown function: ${functionName}`);
        handlers.addMessage({
          type: "system",
          content: `⚠️ Unknown function: ${functionName}`,
        });
        success = false;
    }

    return {
      success,
      functionName,
      functionArgs,
      toolCallId: toolCall.id, // present for modern tool_calls
    };
  }

  /**
   * Processes all tool calls in a response message and executes the appropriate handlers.
   * @param {Object} responseMessage - The full response message from the AI
   * @param {Object} handlers - Object containing handler functions and necessary parameters
   */
  static processAllToolCalls(responseMessage, handlers) {
    if (!responseMessage) {
      console.error("Invalid response message");
      return { results: [] };
    }

    // Handle the main textual content, if present
    if (responseMessage.content && handlers.addMessage) {
      handlers.addMessage({
        type: "ai",
        content: responseMessage.content,
      });
    }

    const results = [];

    // Prefer modern tool_calls array when available
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(
        "Full AI response tool_calls array:",
        JSON.stringify(responseMessage.tool_calls, null, 2)
      );

      for (const toolCall of responseMessage.tool_calls) {
        const result = AiUtils.processToolCall(
          toolCall,
          responseMessage,
          handlers
        );
        results.push(result);
      }

      return { results };
    }

    // Fallback: handle legacy single function_call
    if (responseMessage.function_call && responseMessage.function_call.name) {
      const legacyWrappedToolCall = {
        function: {
          name: responseMessage.function_call.name,
          arguments: responseMessage.function_call.arguments,
        },
      };

      console.log(
        "Processing legacy function_call:",
        JSON.stringify(responseMessage.function_call, null, 2)
      );

      const result = AiUtils.processToolCall(
        legacyWrappedToolCall,
        responseMessage,
        handlers
      );
      results.push(result);
      return { results, isLegacy: true };
    }

    console.log("AI response did not include any tool_calls or function_call.");
    return { results };
  }

  /**
   * Handles a user prompt, sends it to the AI, and processes the response.
   * @param {string} prompt - The user's input.
   * @param {Object} currentAppState - Object containing current app state (e.g., rootNote, selectedMode).
   * @param {Object} appSetters - Object containing app state setters (e.g., setMessages, setInputValue).
   */
  async handleUserPrompt(prompt, currentAppState, appSetters) {
    // Validate input
    if (!prompt || !prompt.trim()) {
      return;
    }

    // Add user message to chat
    this.addUserMessage(prompt, appSetters);

    try {
      // Get AI response
      const responseMessage = await this.sendMessage(
        prompt,
        currentAppState.rootNote,
        currentAppState.selectedMode,
        currentAppState.chordProgressionKey,
        currentAppState.chordProgressionMode
      );

      // Create handlers for tool calls
      const handlers = this.createHandlersForToolCalls(
        currentAppState,
        appSetters
      );

      // Process all tool calls and collect results
      const { results, isLegacy } = AiUtils.processAllToolCalls(
        responseMessage,
        handlers
      );

      // If the assistant invoked tools, send tool results back once to allow follow-up tool calls
      if (results && results.length > 0) {
        const systemMessage = AiUtils.createSystemMessage(
          currentAppState.rootNote,
          currentAppState.selectedMode,
          currentAppState.chordProgressionKey,
          currentAppState.chordProgressionMode
        );

        // Build continuation messages: system → original user → assistant (with tool call) → tool results
        const continuationMessages = [
          systemMessage,
          { role: "user", content: prompt },
          // Include the assistant message so the model sees its own tool_call(s)
          {
            role: "assistant",
            content: responseMessage.content || null,
            tool_calls: responseMessage.tool_calls,
            function_call: responseMessage.function_call,
          },
        ];

        // Append tool results in correct role/shape
        for (const r of results) {
          const content = JSON.stringify({
            success: r.success,
            args: r.functionArgs,
          });
          if (r.toolCallId) {
            // Modern tool call result
            continuationMessages.push({
              role: "tool",
              tool_call_id: r.toolCallId,
              content,
            });
          } else if (isLegacy && r.functionName) {
            // Legacy function_call result
            continuationMessages.push({
              role: "function",
              name: r.functionName,
              content,
            });
          }
        }

        // Ask the model to continue once
        const followUpPayload =
          this.createApiRequestPayload(continuationMessages);
        const followUpResponse = await this.makeApiRequest(followUpPayload);
        const followUpMessage =
          this.validateAndExtractResponse(followUpResponse);

        // Process any subsequent tool calls (e.g., set_mode)
        AiUtils.processAllToolCalls(followUpMessage, handlers);
      }
    } catch (error) {
      this.handleAiError(error, appSetters);
    } finally {
      appSetters.setIsChatLoading(false);
    }
  }

  /**
   * Adds a user message to the chat and sets loading state.
   * @param {string} prompt - The user's input.
   * @param {Object} appSetters - Object containing app state setters.
   */
  addUserMessage(prompt, appSetters) {
    const newUserMessage = { type: "user", content: prompt };
    appSetters.setMessages((prev) => [...prev, newUserMessage]);
    appSetters.setInputValue("");
    appSetters.setIsChatLoading(true);
  }

  /**
   * Creates handlers for tool calls.
   * @param {Object} currentAppState - Object containing current app state.
   * @param {Object} appSetters - Object containing app state setters.
   * @returns {Object} Object containing handlers for tool calls.
   */
  createHandlersForToolCalls(currentAppState, appSetters) {
    // Helper to add messages to the chat
    const addMessageToState = (message) => {
      appSetters.setMessages((prev) => [...prev, message]);
    };

    return {
      notes: currentAppState.notes,
      sliderInstanceRef: currentAppState.sliderInstanceRef,
      baseScaleLeftOverflowSize: currentAppState.baseScaleLeftOverflowSize,
      setSelectedMode: appSetters.setSelectedMode,
      setSelectedExtensions: appSetters.setSelectedExtensions,
      setChordProgression: appSetters.setChordProgression,
      modeIntervals: currentAppState.modeIntervals,
      setChordProgressionKey: appSetters.setChordProgressionKey,
      setChordProgressionMode: appSetters.setChordProgressionMode,
      addMessage: addMessageToState,
    };
  }

  /**
   * Handles AI errors.
   * @param {Error} error - The error object.
   * @param {Object} appSetters - Object containing app state setters.
   */
  handleAiError(error, appSetters) {
    console.error("AI interaction error in handleUserPrompt:", error);
    appSetters.setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        content: "Sorry, I encountered an error during the AI interaction.",
      },
    ]);
  }

  // Helper to normalize mode names and accept common synonyms
  static normalizeModeName(inputMode) {
    if (!inputMode || typeof inputMode !== "string") return null;
    const value = inputMode.trim().toLowerCase();

    const synonyms = new Map([
      ["major", "Ionian (major)"],
      ["ionian", "Ionian (major)"],
      ["ionian (major)", "Ionian (major)"],
      ["minor", "Aeolian (natural minor)"],
      ["natural minor", "Aeolian (natural minor)"],
      ["aeolian", "Aeolian (natural minor)"],
      ["aeolian (natural minor)", "Aeolian (natural minor)"],
      ["harmonic minor", "Harmonic Minor"],
      ["melodic minor", "Melodic Minor"],
      ["dorian", "Dorian"],
      ["phrygian", "Phrygian"],
      ["lydian", "Lydian"],
      ["mixolydian", "Mixolydian"],
      ["locrian", "Locrian"],
    ]);

    if (synonyms.has(value)) {
      return synonyms.get(value);
    }

    // Try exact key match (case-insensitive) against available modes
    const availableKeys = Object.keys(NotesUtils.modes);
    const found = availableKeys.find((k) => k.toLowerCase() === value);
    if (found) {
      return found;
    }

    return null;
  }
}

export default AiUtils;
