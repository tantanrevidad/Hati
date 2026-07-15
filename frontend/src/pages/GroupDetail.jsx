import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, HandCoins, Bell, BarChart3, List, Share2, Archive, X, Copy } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPeso, getExpensesByGroup, getUserById, getInitials, getAvatarColor } from "../data/mockData";
import ExpenseItem from "../components/ExpenseItem";
import PieChart from "../components/PieChart";
import NudgeModal from "../components/NudgeModal";
import BottomNav from "../components/BottomNav";
import AvatarStack from "../components/AvatarStack";
import QRCode from "react-qr-code";


export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const group = state.groups.find((g) => g.id === id);
  const ledger = state.ledgers[id];
  const expenses = state.expenses.filter((e) => e.groupId === id);
  const groupSettlements = state.settlements?.filter((s) => s.groupId === id) || [];

  const [tab, setTab] = useState("expenses");
  const [nudgeTarget, setNudgeTarget] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  const joinSlug = group.joinSlug || group.id.slice(-8);
  const joinUrl = `${window.location.origin}/join/${joinSlug}`;

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const groupTotal = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Combine expenses and settlements chronologically
  const timelineItems = [
    ...expenses.map(e => ({ ...e, type: "expense", date: new Date(e.createdAt) })),
    ...groupSettlements.map(s => ({
      ...s,
      type: "settlement",
      date: new Date(s.initiatedAt),
      toUserId: s.confirmations?.[0]?.toUserId || s.toUserId || s.confirmations?.[0]?.userId
    }))
  ].sort((a, b) => b.date - a.date);

  // Group items by date
  const groupTimelineByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const dateString = item.date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(item);
    });
    return groups;
  };
  const groupedTimeline = groupTimelineByDate(timelineItems);

  const getCategoryEmoji = (category) => {
    switch (category) {
      case "rent":
        return { emoji: "🏠", bg: "rgba(137, 215, 183, 0.08)" };
      case "utilities":
        return { emoji: "⚡", bg: "rgba(255, 179, 71, 0.08)" };
      case "groceries":
        return { emoji: "🛒", bg: "rgba(137, 215, 183, 0.08)" };
      default:
        return { emoji: "🧾", bg: "rgba(255, 244, 225, 0.04)" };
    }
  };

  return (
    <div className="app-shell">
      <div className="page-no-pad">
        {/* Mockup Header: centered title and simple options */}
        <div style={{
          padding: "56px 24px 24px",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div className="row-between" style={{ marginBottom: 20, alignItems: "center" }}>
            <div className="row gap-xs" style={{ alignItems: "center", flex: 1, minWidth: 0 }}>
              <button className="back-btn" onClick={() => navigate("/home")} style={{ marginRight: 8, flexShrink: 0 }}>
                <ArrowLeft size={18} />
              </button>
              <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>
                {group.name.match(/[\u{1F300}-\u{1FFFF}]/u)?.[0] || "📋"}
              </span>
              <h1 className="text-md font-bold" style={{ 
                margin: 0, 
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis",
                maxWidth: "140px"
              }}>
                {group.name.replace(/\s*[\u{1F300}-\u{1FFFF}]\s*/gu, "").trim()}
              </h1>
            </div>
            
            {/* Profiles stack & plus button */}
            <div className="row gap-xs" style={{ alignItems: "center", flexShrink: 0 }}>
              <AvatarStack userIds={group.memberIds || []} size="sm" />
              <button 
                onClick={() => setShowInviteModal(true)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--color-primary-dim)",
                  border: "1.5px solid var(--color-border)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                  transition: "all 0.2s"
                }}
                className="btn-hover"
                title="Invite Roommates"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Mockup Cards: My Expenses & Group Total side-by-side */}
          <div className="row gap-sm" style={{ marginTop: 16 }}>
            {/* My Balance Card */}
            <div className="card" style={{
              flex: 1,
              background: net >= 0 ? "rgba(137, 215, 183, 0.05)" : "rgba(255, 92, 122, 0.05)",
              borderColor: net >= 0 ? "var(--color-primary)" : "var(--color-danger)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
            }}>
              <span className="text-xs text-muted" style={{ display: "block", marginBottom: 4 }}>
                My Balance
              </span>
              <div className="font-bold text-lg" style={{ color: net >= 0 ? "var(--color-primary)" : "var(--color-danger)" }}>
                {net === 0 ? "" : net > 0 ? "+" : "-"}{formatPeso(Math.abs(net))}
              </div>
              <span className="text-xs text-muted-3">
                {net === 0 ? "All settled" : net > 0 ? "You're owed" : "You owe"}
              </span>
            </div>

            {/* Group Total Card */}
            <div className="card" style={{
              flex: 1,
              background: "rgba(255, 244, 225, 0.02)",
              borderColor: "var(--color-border)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
            }}>
              <span className="text-xs text-muted" style={{ display: "block", marginBottom: 4 }}>
                Group Total
              </span>
              <div className="font-bold text-lg" style={{ color: "var(--color-text)" }}>
                {formatPeso(groupTotal)}
              </div>
              <span className="text-xs text-muted-3">
                Total spent
              </span>
            </div>
          </div>

          <div className="row-between" style={{ marginTop: 12 }}>
            <span className="text-xs text-muted-3">{group.memberIds.length} members</span>
            <button 
              onClick={() => setTab(tab === "expenses" ? "balances" : "expenses")}
              style={{
                background: "none", color: "var(--color-primary)",
                fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4
              }}
            >
              {tab === "expenses" ? "View breakdown" : "View expenses"} <span style={{ fontSize: "1rem" }}>›</span>
            </button>
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

        {/* Tab Content */}
        <div style={{ padding: "16px 24px", paddingBottom: 100 }}>
          {tab === "expenses" && (
            <div className="stack">
              {timelineItems.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🧾</div>
                  <p className="text-muted">No transactions yet.</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}
                    onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                    Add first expense
                  </button>
                </div>
              ) : (
                Object.keys(groupedTimeline).map((dateStr) => (
                  <div key={dateStr} className="stack">
                    {/* Date Header */}
                    <div style={{
                      fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-3)",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      marginTop: "20px", marginBottom: "8px"
                    }}>
                      {dateStr}
                    </div>

                    <div className="stack gap-sm">
                      {groupedTimeline[dateStr].map((item) => {
                        if (item.type === "settlement") {
                          const fromUser = getUserById(item.fromUserId);
                          const toUser = getUserById(item.toUserId);
                          if (!fromUser || !toUser) return null;
                          return (
                            <div key={item.id} className="card card-glass" style={{ padding: "12px 16px" }}>
                              <div className="row-between">
                                <div className="row gap-md">
                                  {/* Settlement Mockup: user CR -> user DM arrow link */}
                                  <div className="row gap-xs" style={{ alignItems: "center" }}>
                                    <div className="avatar" style={{
                                      background: getAvatarColor(fromUser.id),
                                      color: "#fff", width: 28, height: 28, fontSize: "0.7rem",
                                      border: "1.5px solid var(--color-border)"
                                    }}>
                                      {getInitials(fromUser.displayName)}
                                    </div>
                                    <span style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>➔</span>
                                    <div className="avatar" style={{
                                      background: getAvatarColor(toUser.id),
                                      color: "#fff", width: 28, height: 28, fontSize: "0.7rem",
                                      border: "1.5px solid var(--color-border)"
                                    }}>
                                      {getInitials(toUser.displayName)}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                      {fromUser.id === state.user.id ? "You" : fromUser.displayName.split(" ")[0]} paid {toUser.id === state.user.id ? "You" : toUser.displayName.split(" ")[0]}
                                    </div>
                                    <span className="text-xs text-muted-3">
                                      {item.method.toUpperCase()} · {item.status === "confirmed" ? "Confirmed" : "Pending"}
                                    </span>
                                  </div>
                                </div>
                                <div className="font-bold" style={{ fontSize: "0.9375rem", color: "var(--color-primary)" }}>
                                  {formatPeso(item.amount)}
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          const payer = getUserById(item.paidBy);
                          if (!payer) return null;
                          const isExpanded = expandedExpenseId === item.id;
                          const participants = item.splitDetails?.participantIds || group.memberIds;
                          const shareAmount = item.amount / participants.length;
                          const iconObj = getCategoryEmoji(item.category);

                          return (
                            <div 
                              key={item.id} 
                              className="card card-hover"
                              onClick={() => setExpandedExpenseId(isExpanded ? null : item.id)}
                            >
                              <div className="card-body" style={{ padding: "14px 16px" }}>
                                <div className="row-between">
                                  <div className="row gap-sm" style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      width: 36, height: 36, borderRadius: 10,
                                      background: iconObj.bg, display: "flex",
                                      alignItems: "center", justifyItems: "center", justifyContent: "center",
                                      fontSize: "1.1rem", flexShrink: 0
                                    }}>
                                      {iconObj.emoji}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{
                                        fontWeight: 600, fontSize: "0.875rem",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                      }}>
                                        {item.description}
                                      </div>
                                      <div className="text-xs text-muted">
                                        Paid by {item.paidBy === state.user.id ? "You" : payer.displayName.split(" ")[0]}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ textAlign: "right", marginLeft: 8 }}>
                                    <div className="font-bold" style={{ fontSize: "0.9375rem" }}>
                                      {formatPeso(item.amount)}
                                    </div>
                                    <span className="text-xs text-muted-3">
                                      {isExpanded ? "Hide details ▲" : "View details ▼"}
                                    </span>
                                  </div>
                                </div>

                                {/* Expanded detail block: matches Left Mockup breakdown style */}
                                {isExpanded && (
                                  <div 
                                    className="anim-fade-up" 
                                    style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 16 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="row-between" style={{ marginBottom: 12 }}>
                                      <span className="input-label" style={{ fontSize: "0.7rem", color: "var(--color-text-3)" }}>
                                        Split Breakdown
                                      </span>
                                      <div className="row gap-xs" style={{ background: "var(--color-surface-2)", padding: 2, borderRadius: 20 }}>
                                        <span style={{ fontSize: "0.65rem", padding: "2px 8px", background: "var(--color-primary)", color: "var(--color-bg)", borderRadius: 20, fontWeight: 700 }}>
                                          By Person
                                        </span>
                                        <span style={{ fontSize: "0.65rem", padding: "2px 8px", color: "var(--color-text-3)", fontWeight: 700 }}>
                                          By Item
                                        </span>
                                      </div>
                                    </div>

                                    <div className="stack gap-sm">
                                      {participants.map(pId => {
                                        const pUser = getUserById(pId);
                                        if (!pUser) return null;
                                        return (
                                          <div key={pId} className="row-between" style={{ padding: "4px 0" }}>
                                            <div className="row gap-sm">
                                              <div className="avatar" style={{
                                                background: getAvatarColor(pId), color: "#fff",
                                                width: 22, height: 22, fontSize: "0.55rem"
                                              }}>
                                                {getInitials(pUser.displayName)}
                                              </div>
                                              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-2)" }}>
                                                {pUser.id === state.user.id ? "You" : pUser.displayName}
                                              </span>
                                            </div>
                                            <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                                              {formatPeso(shareAmount)}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
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

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-sheet anim-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360, margin: "auto" }}>
            <div className="modal-handle" />
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>Invite Friends</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                style={{ background: "none", border: "none", color: "var(--color-text-3)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-muted" style={{ marginBottom: 20 }}>
              Share this QR code or copy the link below to invite roommates to <strong>{group.name}</strong>.
            </p>

            <div style={{ 
              background: "#fff", 
              padding: 16, 
              borderRadius: "var(--radius-md)", 
              border: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px",
              width: 172,
              height: 172,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)"
            }}>
              <QRCode 
                value={joinUrl}
                size={140}
                fgColor="#13463B"
                bgColor="#ffffff"
              />
            </div>

            <div className="row gap-xs" style={{ 
              background: "var(--color-surface-2)", 
              padding: "8px 12px", 
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              marginBottom: 16,
              alignItems: "center"
            }}>
              <span className="text-xs text-muted-2" style={{ 
                flex: 1, 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                fontFamily: "monospace"
              }}>
                {joinUrl}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(joinUrl);
                  setShowShareToast(true);
                  setTimeout(() => setShowShareToast(false), 2000);
                }}
                style={{ 
                  background: "var(--color-primary-dim)", 
                  border: "none", 
                  color: "var(--color-primary)", 
                  padding: "6px 10px", 
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
                className="btn-hover"
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <div className="stack gap-sm">
              <button 
                className="btn btn-primary btn-full"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `Join ${group.name} on Lista`,
                        text: `Hey! Use this link to join our Listahan "${group.name}" on Lista:`,
                        url: joinUrl,
                      });
                    } catch (err) {
                      console.log(err);
                    }
                  } else {
                    navigator.clipboard.writeText(joinUrl);
                    setShowShareToast(true);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }
                }}
              >
                <Share2 size={16} /> Share Link
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setShowInviteModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareToast && (
        <div className="toast">🔗 Join link copied!</div>
      )}

      <BottomNav />
    </div>
  );
}
