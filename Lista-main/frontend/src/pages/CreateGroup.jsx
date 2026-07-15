import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, QrCode, Copy, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { users as allUsers } from "../data/mockData";
import BottomNav from "../components/BottomNav";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [name, setName] = useState("");
  const [step, setStep] = useState("name"); // name | share
  const [newGroup, setNewGroup] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const group = {
      id: `group-${Date.now()}`,
      name,
      hostId: state.user.id,
      memberIds: [state.user.id],
      memberJoinedAt: { [state.user.id]: new Date().toISOString() },
      createdAt: new Date().toISOString(),
      status: "active",
      zeroBalanceSince: null,
    };
    dispatch({ type: "ADD_GROUP", payload: group });
    setNewGroup(group);
    setLoading(false);
    setStep("share");
  };

  const joinLink = newGroup
    ? `https://lista.ph/join/${newGroup.id.slice(-8)}`
    : "";

  const handleCopy = () => {
    navigator.clipboard?.writeText(joinLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const EMOJIS = ["🏖️", "🏠", "🍜", "🎉", "✈️", "🏋️", "🎮", "💼", "🍕", "🎸"];
  const [selectedEmoji, setSelectedEmoji] = useState("🎉");

  return (
    <div className="app-shell">
      <div className="page">
        <div className="row gap-md" style={{ marginBottom: 28 }}>
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl">New Listahan</h1>
        </div>

        {step === "name" && (
          <div className="stack gap-lg anim-fade-up">
            {/* Emoji picker */}
            <div>
              <label className="input-label" style={{ marginBottom: 10, display: "block" }}>
                Pick an icon
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelectedEmoji(e)}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: selectedEmoji === e ? "var(--color-primary-dim)" : "var(--color-surface-2)",
                      border: `1.5px solid ${selectedEmoji === e ? "var(--color-primary)" : "var(--color-border)"}`,
                      fontSize: "1.375rem",
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Listahan Name</label>
              <input
                className="input"
                placeholder='e.g. "Boracay Trip", "BGC Condo", "Team Lunch"'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="card-glass" style={{ padding: 14 }}>
              <div className="row gap-sm">
                <Users size={16} color="var(--color-text-2)" />
                <span className="text-sm text-muted">
                  Invite members after creating. Share a QR code or link.
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleCreate}
              disabled={!name.trim() || loading}
            >
              {loading ? "Creating..." : <><Plus size={18} /> Create Listahan</>}
            </button>
          </div>
        )}

        {step === "share" && newGroup && (
          <div className="stack gap-lg anim-scale-in" style={{ textAlign: "center" }}>
            <div>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "var(--color-primary-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: "2rem",
              }}>
                {selectedEmoji}
              </div>
              <h2 className="text-xl">"{name}" created! 🎉</h2>
              <p className="text-muted" style={{ marginTop: 6 }}>
                Share this link so others can join your Listahan.
              </p>
            </div>

            {/* QR Code */}
            <div style={{
              width: 180, height: 180, margin: "0 auto",
              background: "#fff", borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <QrCode size={130} color="#0D0E1A" />
            </div>

            {/* Link */}
            <div style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 8,
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: "0.8125rem",
                color: "var(--color-primary)", flex: 1, textAlign: "left",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {joinLink}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCopy}
                style={{ flexShrink: 0 }}
              >
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>

            <div className="stack gap-sm" style={{ textAlign: "left" }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate(`/groups/${newGroup.id}`)}
              >
                Go to Listahan
              </button>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => navigate("/home")}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
