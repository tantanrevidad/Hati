import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPeso, getInitials, getAvatarColor } from "../data/mockData";
import GroupCard from "../components/GroupCard";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { user, groups, ledgers } = state;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  // Net across all groups
  const totalNet = groups.reduce((sum, g) => {
    const ledger = ledgers[g.id];
    const myBal = ledger?.balances.find((b) => b.userId === user.id);
    return sum + (myBal?.netBalance ?? 0);
  }, 0);

  const owed   = groups.reduce((s, g) => {
    const b = ledgers[g.id]?.balances.find((b) => b.userId === user.id);
    return s + Math.max(0, b?.netBalance ?? 0);
  }, 0);
  const owes   = groups.reduce((s, g) => {
    const b = ledgers[g.id]?.balances.find((b) => b.userId === user.id);
    return s + Math.abs(Math.min(0, b?.netBalance ?? 0));
  }, 0);

  const pendingSettlements = state.settlements.filter(
    (s) => s.confirmations.some((c) => c.toUserId === user.id && !c.confirmedAt)
  );

  return (
    <div className="app-shell">
      <div className="page">
        {/* Header */}
        <div className="row-between anim-fade-up" style={{ marginBottom: 28 }}>
          <div>
            <p className="text-sm text-muted">{greeting()},</p>
            <h1 className="text-xl" style={{ marginTop: 2 }}>
              {user.displayName.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="row gap-sm">
            <button
              className="back-btn"
              onClick={() => navigate("/notifications")}
              style={{ position: "relative" }}
            >
              <Bell size={18} />
              {pendingSettlements.length > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--color-danger)",
                  border: "1.5px solid var(--color-surface)",
                }} />
              )}
            </button>
            <div
              className={`avatar avatar-md`}
              style={{ background: getAvatarColor(user.id), color: "#fff", cursor: "pointer" }}
              onClick={() => navigate("/profile")}
            >
              {getInitials(user.displayName)}
            </div>
          </div>
        </div>

        {/* Balance Summary Card */}
        <div className="card anim-fade-up stagger-1" style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
          border: "none",
          marginBottom: 28,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(26, 49, 44, 0.05)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(26, 49, 44, 0.04)",
          }} />

          <div className="card-body" style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.8125rem", color: "rgba(26, 49, 44, 0.7)", marginBottom: 4, fontWeight: 600 }}>
              NET BALANCE
            </p>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-bg)", marginBottom: 20 }}>
              {totalNet >= 0 ? "+" : ""}{formatPeso(totalNet)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{
                background: "rgba(26, 49, 44, 0.08)",
                borderRadius: 12, padding: "10px 14px",
              }}>
                <div className="row gap-xs" style={{ marginBottom: 4 }}>
                  <TrendingUp size={12} color="rgba(26, 49, 44, 0.7)" />
                  <span style={{ fontSize: "0.6875rem", color: "rgba(26, 49, 44, 0.7)", fontWeight: 600 }}>
                    YOU'RE OWED
                  </span>
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-bg)" }}>
                  {formatPeso(owed)}
                </div>
              </div>
              <div style={{
                background: "rgba(26, 49, 44, 0.08)",
                borderRadius: 12, padding: "10px 14px",
              }}>
                <div className="row gap-xs" style={{ marginBottom: 4 }}>
                  <TrendingDown size={12} color="rgba(26, 49, 44, 0.7)" />
                  <span style={{ fontSize: "0.6875rem", color: "rgba(26, 49, 44, 0.7)", fontWeight: 600 }}>
                    YOU OWE
                  </span>
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-bg)" }}>
                  {formatPeso(owes)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Confirmations Banner */}
        {pendingSettlements.length > 0 && (
          <div
            className="card anim-fade-up stagger-2"
            style={{
              background: "var(--color-warning-dim)",
              border: "1px solid var(--color-warning)",
              marginBottom: 20, cursor: "pointer",
            }}
            onClick={() => navigate(`/groups/${pendingSettlements[0].groupId}/settle`)}
          >
            <div className="card-body" style={{ padding: "12px 16px" }}>
              <div className="row gap-sm">
                <span style={{ fontSize: "1.25rem" }}>⏳</span>
                <div>
                  <div className="font-semi" style={{ fontSize: "0.875rem", color: "var(--color-warning)" }}>
                    {pendingSettlements.length} settlement{pendingSettlements.length > 1 ? "s" : ""} awaiting your confirmation
                  </div>
                  <div className="text-xs text-muted">Tap to confirm</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups */}
        <div>
          <div className="section-header anim-fade-up stagger-2">
            <span className="section-title">My Lisatahans</span>
            <span className="text-xs text-muted">{groups.length} active</span>
          </div>

          <div className="stack gap-sm">
            {groups.map((g, i) => (
              <GroupCard
                key={g.id}
                group={g}
                style={{ animationDelay: `${(i + 3) * 0.05}s` }}
                className="anim-fade-up"
              />
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate("/groups/new")}>
        <Plus size={26} />
      </button>

      <BottomNav />
    </div>
  );
}
