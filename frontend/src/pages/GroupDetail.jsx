import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, HandCoins, Bell, BarChart3, List, Share2, Archive } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPeso, getExpensesByGroup, getUserById, getInitials, getAvatarColor } from "../data/mockData";
import ExpenseItem from "../components/ExpenseItem";
import PieChart from "../components/PieChart";
import NudgeModal from "../components/NudgeModal";
import BottomNav from "../components/BottomNav";
import AvatarStack from "../components/AvatarStack";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const group = state.groups.find((g) => g.id === id);
  const ledger = state.ledgers[id];
  const expenses = state.expenses.filter((e) => e.groupId === id);

  const [tab, setTab] = useState("expenses");
  const [nudgeTarget, setNudgeTarget] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);

  if (!group) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="text-muted">Group not found.</p>
      <button className="btn btn-ghost" onClick={() => navigate("/home")} style={{ marginTop: 16 }}>
        ← Back to Home
      </button>
    </div>
  );

  const myBalance = ledger?.balances.find((b) => b.userId === state.user.id);
  const net = myBalance?.netBalance ?? 0;
  const debtors = ledger?.balances.filter(
    (b) => b.userId !== state.user.id && b.netBalance < 0
  );

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="app-shell">
      <div className="page-no-pad">
        {/* Hero Header */}
        <div style={{
          background: "linear-gradient(180deg, rgba(124,92,252,0.15) 0%, transparent 100%)",
          padding: "56px 24px 24px",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div className="row-between" style={{ marginBottom: 20 }}>
            <button className="back-btn" onClick={() => navigate("/home")}>
              <ArrowLeft size={18} />
            </button>
            <button className="back-btn" onClick={handleShare}>
              <Share2 size={18} />
            </button>
          </div>

          <div className="anim-fade-up">
            <div style={{ fontSize: "2rem", marginBottom: 6 }}>
              {group.name.match(/[\u{1F300}-\u{1FFFF}]/u)?.[0] || "📋"}
            </div>
            <h1 className="text-xl" style={{ marginBottom: 8 }}>
              {group.name.replace(/\s*[\u{1F300}-\u{1FFFF}]\s*/gu, "").trim()}
            </h1>

            <div className="row gap-sm" style={{ marginBottom: 16 }}>
              <AvatarStack userIds={group.memberIds} size="sm" />
              <span className="text-xs text-muted">{group.memberIds.length} members</span>
              {group.status === "active" && (
                <span className="status-dot active" style={{ marginLeft: 4 }} />
              )}
            </div>

            {/* My balance pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px",
              background: net >= 0 ? "var(--color-accent-dim)" : "var(--color-danger-dim)",
              border: `1px solid ${net >= 0 ? "var(--color-accent)" : "var(--color-danger)"}`,
              borderRadius: "var(--radius-full)",
            }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-2)" }}>
                {net === 0 ? "All settled" : net > 0 ? "You're owed" : "You owe"}
              </span>
              {net !== 0 && (
                <span className="font-bold" style={{
                  fontSize: "1rem",
                  color: net >= 0 ? "var(--color-accent)" : "var(--color-danger)",
                }}>
                  {formatPeso(Math.abs(net))}
                </span>
              )}
            </div>
          </div>

          {/* Archive warning */}
          {group.zeroBalanceSince && (
            <div style={{
              marginTop: 12, padding: "8px 12px",
              background: "var(--color-warning-dim)",
              borderRadius: "var(--radius-md)", fontSize: "0.8125rem",
              color: "var(--color-warning)", fontWeight: 600,
            }}>
              <Archive size={13} style={{ display: "inline", marginRight: 4 }} />
              Auto-archiving soon — ₱0 balance for 7 days
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="row gap-sm" style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/groups/${id}/expenses/new`)}>
            <Plus size={14} /> Add Expense
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => navigate(`/groups/${id}/settle`)}>
            <HandCoins size={14} /> Settle Up
          </button>
          {debtors?.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setNudgeTarget(debtors[0].userId)}
            >
              <Bell size={14} /> Nudge
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="row" style={{ padding: "0 24px", borderBottom: "1px solid var(--color-border)" }}>
          {[{ id: "expenses", icon: List, label: "Expenses" }, { id: "balances", icon: BarChart3, label: "Balances" }].map(({ id: tid, icon: Icon, label }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              style={{
                flex: 1, padding: "14px 0",
                background: "none", color: tab === tid ? "var(--color-primary)" : "var(--color-text-3)",
                fontWeight: 600, fontSize: "0.875rem",
                borderBottom: `2px solid ${tab === tid ? "var(--color-primary)" : "transparent"}`,
                transition: "all 0.2s",
              }}
              className="row gap-xs"
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "16px 24px", paddingBottom: 100 }}>
          {tab === "expenses" && (
            <div className="stack gap-sm">
              {expenses.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🧾</div>
                  <p className="text-muted">No expenses yet.</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}
                    onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                    Add first expense
                  </button>
                </div>
              ) : (
                expenses.map((e, i) => (
                  <ExpenseItem key={e.id} expense={e} style={{ animationDelay: `${i * 0.04}s` }} />
                ))
              )}
            </div>
          )}

          {tab === "balances" && ledger && (
            <div className="anim-scale-in">
              <PieChart balances={ledger.balances} size={200} />
            </div>
          )}
        </div>
      </div>

      {nudgeTarget && (
        <NudgeModal
          groupId={id}
          toUserId={nudgeTarget}
          onClose={() => setNudgeTarget(null)}
        />
      )}

      {showShareToast && (
        <div className="toast">🔗 Join link copied!</div>
      )}

      <BottomNav />
    </div>
  );
}
