"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "./useChat";
import styles from "./ChatWidget.module.scss";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isStreaming, activeToolCall } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeToolCall]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.widgetContainer}>
      {open && (
        <div className={styles.chatPanel}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.avatar}>🏙️</span>
              <div>
                <p className={styles.title}>Propchain AI</p>
                <p className={styles.subtitle}>UAE Real Estate Advisor</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.role === "user" ? styles.user : styles.assistant}`}
              >
                <div className={styles.bubble}>
                  {msg.content || (msg.role === "assistant" && isStreaming ? (
                    <span className={styles.cursor}>▋</span>
                  ) : null)}
                </div>
              </div>
            ))}

            {activeToolCall && (
              <div className={styles.toolCallIndicator}>
                <span className={styles.spinner} />
                <span>Fetching {formatToolName(activeToolCall)}...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about returns, yields, properties..."
              rows={1}
              disabled={isStreaming}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? "..." : "Send"}
            </button>
          </div>

          <div className={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className={styles.suggestionChip} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={styles.fab} onClick={() => setOpen((o) => !o)}>
        {open ? "✕" : "💬"}
        {!open && <span className={styles.fabLabel}>Ask AI</span>}
      </button>
    </div>
  );
}

const SUGGESTIONS = [
  "Best yield properties?",
  "If I invest AED 50,000 in Marina Tower A?",
  "Market overview",
];

function formatToolName(tool: string) {
  return tool.replace(/_/g, " ");
}
