import React, { useState, useRef, useEffect } from "react";
import { users } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function MentionInput({ value, onChange, placeholder }) {
  const { state } = useApp();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    // Detect @mention trigger
    const cursor = e.target.selectionStart;
    const textUpToCursor = val.slice(0, cursor);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.id !== state.user.id &&
          u.displayName.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const textUpToCursor = value.slice(0, cursor);
    const mentionStart = textUpToCursor.lastIndexOf("@");
    const newVal =
      value.slice(0, mentionStart) +
      `@${user.displayName} ` +
      value.slice(cursor);
    onChange(newVal);
    setShowSuggestions(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={textareaRef}
        className="input textarea"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
      />
      {showSuggestions && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          zIndex: 50,
          boxShadow: "var(--shadow-lg)",
        }}>
          {suggestions.map((user) => (
            <button
              key={user.id}
              type="button"
              style={{
                width: "100%", textAlign: "left",
                padding: "10px 14px",
                background: "none",
                color: "var(--color-text)",
                fontSize: "0.875rem",
                fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-glass)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user);
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--color-primary-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-primary)",
                flexShrink: 0,
              }}>
                {user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              {user.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
