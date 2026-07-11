import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Receipt, Equal, Percent, List, Sliders, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { users } from "../data/mockData";
import MentionInput from "../components/MentionInput";

const CATEGORIES = [
  { id: "rent",      label: "Rent",      emoji: "🏠" },
  { id: "utilities", label: "Utilities", emoji: "⚡" },
  { id: "groceries", label: "Groceries", emoji: "🛒" },
  { id: "other",     label: "Other",     emoji: "📋" },
];

const SPLIT_TYPES = [
  { id: "equal",      label: "Equal",      icon: Equal },
  { id: "percentage", label: "Percentage", icon: Percent },
  { id: "itemized",   label: "Itemized",   icon: List },
  { id: "custom",     label: "Custom",     icon: Sliders },
];

export default function AddExpense() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const group = state.groups.find((g) => g.id === groupId);
  const groupMembers = group?.memberIds ?? [];

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [splitType, setSplitType] = useState("equal");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Parse @mentions from description
  const parseMentions = (text) => {
    const mentions = [];
    const regex = /@([A-Za-z\s]+?)(?=\s@|\s[^a-zA-Z]|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const user = users.find((u) => u.displayName.toLowerCase().startsWith(name.toLowerCase()));
      if (user) mentions.push(user.id);
    }
    return [...new Set(mentions)];
  };

  const handleScan = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate Gemini API response
    setDescription("Jollibee — Chickenjoy meal x4");
    setAmount("870");
    setCategory("other");
    setScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const mentions = parseMentions(description);
    const participantIds = [...new Set([state.user.id, ...mentions, ...groupMembers])];

    dispatch({
      type: "ADD_EXPENSE",
      payload: {
        id: `exp-${Date.now()}`,
        groupId,
        description,
        mentions,
        amount: Math.round(parseFloat(amount) * 100),
        currency: "PHP",
        category,
        paidBy: state.user.id,
        splitType,
        splitDetails: { participantIds },
        source: "manual_description",
        createdAt: new Date().toISOString(),
        syncStatus: "local_only",
      },
    });

    setLoading(false);
    navigate(`/groups/${groupId}`);
  };

  return (
    <div style={{ minHeight: "100dvh" }}>
      {/* Header */}
      <div className="page-header" style={{ paddingTop: 52 }}>
        <button className="back-btn" onClick={() => navigate(`/groups/${groupId}`)}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl">Add Expense</h1>
      </div>

      <form className="stack gap-lg" style={{ padding: "0 24px 40px" }} onSubmit={handleSubmit}>
        {/* Gemini Scan Banner */}
        <div
          className="card-glass"
          style={{
            padding: "14px 16px",
            border: scanning ? "1px solid var(--color-primary)" : "1px dashed var(--color-border)",
            cursor: scanning ? "default" : "pointer",
            transition: "all 0.3s",
          }}
          onClick={!scanning ? handleScan : undefined}
        >
          <div className="row gap-sm">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--color-primary-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {scanning ? (
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(124,92,252,0.3)",
                  borderTopColor: "var(--color-primary)", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "block",
                }} />
              ) : (
                <Sparkles size={18} color="var(--color-primary)" />
              )}
            </div>
            <div>
              <div className="font-semi" style={{ fontSize: "0.875rem" }}>
                {scanning ? "Scanning with Gemini AI..." : "Scan Receipt with AI"}
              </div>
              <div className="text-xs text-muted">
                {scanning ? "Parsing your receipt..." : "Take a photo or upload — auto-fill with Gemini"}
              </div>
            </div>
            {!scanning && (
              <Camera size={16} color="var(--color-text-3)" style={{ marginLeft: "auto", flexShrink: 0 }} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="input-group anim-fade-up">
          <label className="input-label">Description</label>
          <MentionInput
            value={description}
            onChange={setDescription}
            placeholder='e.g. "@Mark ordered extra rice" — type @ to mention'
          />
          {description.includes("@") && (
            <div style={{
              fontSize: "0.75rem", color: "var(--color-primary)",
              display: "flex", alignItems: "center", gap: 4, marginTop: 4,
            }}>
              <span>✨</span>
              Mentioned members will be included in the split
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="input-group anim-fade-up stagger-1">
          <label className="input-label">Amount (₱)</label>
          <div className="input-icon">
            <span className="icon" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-2)" }}>₱</span>
            <input
              className="input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="input-group anim-fade-up stagger-2">
          <label className="input-label">Category</label>
          <div className="chip-group">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                type="button"
                className={`chip ${category === id ? "selected" : ""}`}
                onClick={() => setCategory(id)}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Split Type */}
        <div className="input-group anim-fade-up stagger-3">
          <label className="input-label">Split Type</label>
          <div className="chip-group">
            {SPLIT_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`chip ${splitType === id ? "selected" : ""}`}
                onClick={() => setSplitType(id)}
              >
                <Icon size={12} style={{ display: "inline", marginRight: 4 }} />
                {label}
              </button>
            ))}
          </div>
          {(splitType === "percentage" || splitType === "itemized" || splitType === "custom") && (
            <div style={{
              padding: "10px 14px", marginTop: 8,
              background: "var(--color-warning-dim)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem", color: "var(--color-warning)",
              fontWeight: 500,
            }}>
              Advanced split details available after save (Phase 2 feature)
            </div>
          )}
        </div>

        {/* Paid by */}
        <div className="input-group anim-fade-up stagger-4">
          <label className="input-label">Paid by</label>
          <div style={{
            padding: "12px 14px",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--color-border)",
            fontSize: "0.9375rem", fontWeight: 500,
            color: "var(--color-text-2)",
          }}>
            You
          </div>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          type="submit"
          disabled={loading || !description.trim() || !amount}
          style={{ marginTop: 8 }}
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
