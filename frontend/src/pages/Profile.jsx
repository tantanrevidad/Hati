import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Plus, CreditCard, Trash2, ExternalLink } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getInitials, getAvatarColor, formatPeso } from "../data/mockData";
import BottomNav from "../components/BottomNav";

const PM_LABELS = { gcash: "GCash 💙", maya: "Maya 💚", bank: "Bank 🏦" };

export default function Profile() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { user } = state;
  const [showWallet, setShowWallet] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newPM, setNewPM] = useState("gcash");
  const [newRef, setNewRef] = useState("");

  const totalOwed = state.groups.reduce((s, g) => {
    const b = state.ledgers[g.id]?.balances.find((b) => b.userId === user.id);
    return s + Math.max(0, b?.netBalance ?? 0);
  }, 0);
  const totalOwes = state.groups.reduce((s, g) => {
    const b = state.ledgers[g.id]?.balances.find((b) => b.userId === user.id);
    return s + Math.abs(Math.min(0, b?.netBalance ?? 0));
  }, 0);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <div className="app-shell">
      <div className="page">
        {/* Header */}
        <div className="row-between anim-fade-up" style={{ marginBottom: 28 }}>
          <h1 className="text-xl">Profile</h1>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--color-danger)" }}
            onClick={handleLogout}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="anim-fade-up stagger-1" style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="avatar avatar-xl"
            style={{
              background: getAvatarColor(user.id), color: "#fff",
              margin: "0 auto 14px",
              boxShadow: `0 0 30px ${getAvatarColor(user.id)}55`,
            }}
          >
            {getInitials(user.displayName)}
          </div>
          <h2 className="text-xl">{user.displayName}</h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            {user.phone ?? user.email}
          </p>
          <span className="badge badge-primary" style={{ marginTop: 8 }}>
            {user.authMethod === "google" ? "🔵 Google" : user.authMethod === "phone" ? "📱 Phone" : "📧 Email"}
          </span>
        </div>

        {/* Stats */}
        <div className="anim-fade-up stagger-2" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginBottom: 24,
        }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-body" style={{ padding: "16px" }}>
              <div className="text-xs text-muted" style={{ marginBottom: 6 }}>TOTAL OWED TO YOU</div>
              <div className="font-bold text-accent" style={{ fontSize: "1.125rem" }}>
                {formatPeso(totalOwed)}
              </div>
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-body" style={{ padding: "16px" }}>
              <div className="text-xs text-muted" style={{ marginBottom: 6 }}>YOU OWE OTHERS</div>
              <div className="font-bold text-danger" style={{ fontSize: "1.125rem" }}>
                {formatPeso(totalOwes)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="anim-fade-up stagger-3" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <span className="section-title">Payment Methods</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setAdding(!adding)}
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {user.linkedPaymentMethods.length === 0 && !adding && (
            <div className="card-glass" style={{ padding: "14px 16px", textAlign: "center" }}>
              <p className="text-sm text-muted">No payment methods linked.</p>
            </div>
          )}

          <div className="stack gap-sm">
            {user.linkedPaymentMethods.map((pm, i) => (
              <div key={i} className="card">
                <div className="card-body" style={{ padding: "12px 16px" }}>
                  <div className="row-between">
                    <div className="row gap-sm">
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--color-primary-dim)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CreditCard size={16} color="var(--color-primary)" />
                      </div>
                      <div>
                        <div className="font-semi" style={{ fontSize: "0.875rem" }}>
                          {PM_LABELS[pm.type] ?? pm.type}
                        </div>
                        <div className="text-xs text-muted">
                          Linked {new Date(pm.linkedAt).toLocaleDateString("en-PH")}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-accent">Active</span>
                  </div>
                </div>
              </div>
            ))}

            {adding && (
              <div className="card anim-fade-up">
                <div className="card-body stack gap-md">
                  <div className="chip-group">
                    {["gcash", "maya", "bank"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`chip ${newPM === type ? "selected" : ""}`}
                        onClick={() => setNewPM(type)}
                      >
                        {PM_LABELS[type]}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder={newPM === "bank" ? "Account Number" : "Phone Number"}
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                  />
                  <div className="row gap-sm">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        dispatch({
                          type: "COMPLETE_ONBOARDING",
                          payload: {
                            linkedPaymentMethods: [
                              ...user.linkedPaymentMethods,
                              { type: newPM, referenceToken: newRef || `${newPM}-${Date.now()}`, linkedAt: new Date().toISOString() },
                            ],
                          },
                        });
                        setAdding(false);
                        setNewRef("");
                      }}
                    >
                      Link
                    </button>
                    <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stellar Wallet */}
        <div className="anim-fade-up stagger-4">
          <div className="section-title" style={{ marginBottom: 12 }}>Stellar Wallet</div>
          {user.walletAddress ? (
            <div className="card">
              <div className="card-body">
                <div className="text-xs text-muted" style={{ marginBottom: 6 }}>Custodial Address</div>
                <div style={{
                  fontFamily: "monospace", fontSize: "0.75rem",
                  wordBreak: "break-all", color: "var(--color-warning)",
                  fontWeight: 600, marginBottom: 12,
                }}>
                  {user.walletAddress}
                </div>
                <button className="btn btn-ghost btn-sm">
                  <ExternalLink size={13} /> View on Stellar Explorer
                </button>
              </div>
            </div>
          ) : (
            <div className="card-glass" style={{ padding: "14px 16px" }}>
              <div className="text-sm text-muted">
                ⭐ Your Stellar wallet is created automatically on your first settlement. No action needed.
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
