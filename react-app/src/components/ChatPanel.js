import React, { useEffect, useRef, useState } from "react";
import { List, Avatar, Input } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import NotesArray from "./NotesArray";
import AiUtils from "../utils/AiUtils";

const ChatPanel = ({ rootNote, selectedMode, onKeyChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage = { type: "user", content: inputValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsChatLoading(true);

    try {
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

      const apiMessages = [
        systemMessage,
        ...messages
          .slice(-5)
          .filter((msg) => msg.type === "user" || msg.type === "ai")
          .map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        { role: "user", content: inputValue },
      ];

      const response = await fetch(AiUtils.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AiUtils.MODEL_NAME,
          messages: apiMessages,
          functions,
          function_call: "auto",
        }),
      });

      const data = await response.json();

      if (!data.choices?.[0]?.message) {
        throw new Error("Invalid API response");
      }

      const responseMessage = data.choices[0].message;

      if (responseMessage.function_call?.name === "set_key") {
        try {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments
          );

          if (functionArgs.new_key) {
            if (responseMessage.content) {
              setMessages((prev) => [
                ...prev,
                { type: "ai", content: responseMessage.content },
              ]);
            }

            const didChange = await onKeyChange?.(functionArgs.new_key);
            setMessages((prev) => [
              ...prev,
              {
                type: "system",
                content: didChange
                  ? `✓ Key changed to ${functionArgs.new_key}`
                  : `⚠️ Couldn't set key to ${functionArgs.new_key}`,
              },
            ]);
          }
        } catch (err) {
          console.error("Error handling function call:", err);
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              content: "⚠️ Error processing key change",
            },
          ]);
        }
      } else {
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
    <NotesArray
      squareSidePx={120}
      size={4}
      marginPx={60}
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
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
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
                          ? "#f6ffed"
                          : "#f0f0f0",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      wordBreak: "break-word",
                      fontStyle: msg.type === "system" ? "italic" : "normal",
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
  );
};

export default ChatPanel;
