import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, QrCode, Banknote, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPeso, getUserById, getInitials, getAvatarColor } from "../data/mockData";

const METHODS = [
  {
    id: "qrph",
    label: "QRPH",
    sub: "UnionBank, BPI, BDO & more",
    emoji: "📱",
    color: "var(--color-primary)",
  },
  {
    id: "cash",
    label: "Cash",
    sub: "Mark as paid in person",
    emoji: "💵",
    color: "var(--color-accent)",
  },
  {
    id: "stellar",
    label: "Stellar",
    sub: "Crypto — instant, borderless",
    emoji: "⭐",
    color: "var(--color-warning)",
  },
];

export default function SettleUp() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const ledger = state.ledgers[groupId];
  const group = state.groups.find((g) => g.id === groupId);

  const [method, setMethod] = useState("qrph");
  const [step, setStep] = useState("select"); // select | confirm | done
  const [expanded, setExpanded] = useState(null);

  if (!ledger || !group) return null;

  // People the current user owes
  const whoIOwe = ledger.balances.filter(
    (b) => b.userId !== state.user.id && b.netBalance > 0
  );

  // People who owe the current user
  const whoOwesMe = ledger.balances.filter(
    (b) => b.userId !== state.user.id && b.netBalance < 0
  );

  const totalIOwe = whoIOwe.reduce((s, b) => s + b.netBalance, 0);
  const toUserIds = whoIOwe.map((b) => b.userId);

  const handleSettle = () => {
    if (whoIOwe.length === 0) { setStep("done"); return; }
    dispatch({
      type: "INITIATE_SETTLEMENT",
      payload: {
        id: `settle-${Date.now()}`,
        groupId,
        fromUserId: state.user.id,
        method,
        amount: totalIOwe,
        status: method === "stellar" ? "pending" : "awaiting_confirmation",
        stellarTxHash: null,
        confirmations: toUserIds.map((uid) => ({ toUserId: uid, confirmedAt: null })),
        initiatedAt: new Date().toISOString(),
      },
    });
    setStep("done");
  };

  const handleConfirmForMe = (settlementId, fromUserId) => {
    dispatch({
      type: "CONFIRM_SETTLEMENT",
      payload: { settlementId, toUserId: state.user.id },
    });
  };

  const pendingForMe = state.settlements.filter(
    (s) =>
      s.groupId === groupId &&
      s.confirmations.some((c) => c.toUserId === state.user.id && !c.confirmedAt)
  );

  return (
    <div style={{ minHeight: "100dvh" }}>
      <div className="page-header" style={{ paddingTop: 52 }}>
        <button className="back-btn" onClick={() => navigate(`/groups/${groupId}`)}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl">Settle Up</h1>
      </div>

      <div className="stack gap-lg" style={{ padding: "0 24px 60px" }}>
        {step === "done" ? (
          <div className="anim-scale-in" style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--color-accent-dim)", margin: "0 auto 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={36} color="var(--color-accent)" />
            </div>
            <h2 className="text-xl" style={{ marginBottom: 8 }}>Settlement initiated!</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              {toUserIds.length > 0
                ? `Waiting for ${toUserIds.length} member${toUserIds.length > 1 ? "s" : ""} to confirm.`
                : "All settled!"}
            </p>
            <button className="btn btn-primary" onClick={() => navigate(`/groups/${groupId}`)}>
              Back to Group
            </button>
          </div>
        ) : (
          <>
            {/* Pending confirmations for me */}
            {pendingForMe.length > 0 && (
              <div className="stack gap-sm">
                <div className="section-title">Confirm Payments to You</div>
                {pendingForMe.map((s) => {
                  const fromUser = getUserById(s.fromUserId);
                  return (
                    <div key={s.id} className="card">
                      <div className="card-body">
                        <div className="row-between">
                          <div className="row gap-sm">
                            <div
                              className="avatar avatar-md"
                              style={{ background: getAvatarColor(s.fromUserId), color: "#fff" }}
                            >
                              {getInitials(fromUser?.displayName || "?")}
                            </div>
                            <div>
                              <div className="font-semi">{fromUser?.displayName}</div>
                              <div className="text-xs text-muted">sent you {formatPeso(s.amount)} via {s.method.toUpperCase()}</div>
                            </div>
                          </div>
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleConfirmForMe(s.id, s.fromUserId)}
                          >
                            <Check size={13} /> Confirm
                          </button>
                        </div>
                        {s.method === "qrph" && (
                          <div style={{
                            marginTop: 10, padding: "6px 10px",
                            background: "var(--color-warning-dim)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.75rem", color: "var(--color-warning)", fontWeight: 600,
                          }}>
                            🔔 Simulated QRPH payment — confirm receipt manually
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* My debts */}
            {whoIOwe.length > 0 && (
              <div className="stack gap-md">
                <div>
                  <div className="section-title" style={{ marginBottom: 8 }}>What you owe</div>
                  {whoIOwe.map((b) => {
                    const user = getUserById(b.userId);
                    return (
                      <div key={b.userId} className="card" style={{ marginBottom: 8 }}>
                        <div className="card-body" style={{ padding: "12px 16px" }}>
                          <div className="row-between">
                            <div className="row gap-sm">
                              <div className="avatar avatar-md" style={{ background: getAvatarColor(b.userId), color: "#fff" }}>
                                {getInitials(user?.displayName || "?")}
                              </div>
                              <div>
                                <div className="font-semi">{user?.displayName}</div>
                                <div className="text-xs text-muted">you owe them</div>
                              </div>
                            </div>
                            <div className="font-bold text-danger">{formatPeso(b.netBalance)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="card" style={{ background: "var(--color-danger-dim)", border: "1px solid var(--color-danger)" }}>
                  <div className="card-body" style={{ padding: "12px 16px" }}>
                    <div className="row-between">
                      <span className="font-semi" style={{ color: "var(--color-danger)" }}>Total to pay</span>
                      <span className="font-bold text-danger" style={{ fontSize: "1.125rem" }}>
                        {formatPeso(totalIOwe)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Method Selector */}
                <div>
                  <div className="section-title" style={{ marginBottom: 10 }}>Payment Method</div>
                  <div className="stack gap-sm">
                    {METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        style={{
                          padding: 16,
                          background: method === m.id ? `${m.color}18` : "var(--color-surface-2)",
                          border: `1.5px solid ${method === m.id ? m.color : "var(--color-border)"}`,
                          borderRadius: "var(--radius-md)",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer", transition: "all 0.2s",
                          color: "var(--color-text)",
                          textAlign: "left",
                        }}
                      >
                        <div className="row gap-md">
                          <span style={{ fontSize: "1.5rem" }}>{m.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: method === m.id ? m.color : "var(--color-text)" }}>
                              {m.label}
                            </div>
                            <div className="text-xs text-muted">{m.sub}</div>
                          </div>
                        </div>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: method === m.id ? m.color : "var(--color-border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}>
                          {method === m.id && <Check size={13} color="#fff" strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QRPH QR Code */}
                {method === "qrph" && (
                  <div className="anim-scale-in" style={{ textAlign: "center" }}>
                    <div style={{
                      width: 180, height: 180, margin: "0 auto 12px",
                      background: "#fff", borderRadius: 16,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      <QrCode size={130} color="#0D0E1A" />
                    </div>
                    <div style={{
                      display: "inline-block", padding: "4px 12px",
                      background: "var(--color-warning-dim)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem", fontWeight: 600,
                      color: "var(--color-warning)",
                    }}>
                      🔔 Simulated QRPH — for demo only
                    </div>
                  </div>
                )}

                {/* Stellar */}
                {method === "stellar" && (
                  <div className="anim-scale-in card-glass" style={{ padding: 16 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Recipient Stellar Address</div>
                    <div style={{
                      fontFamily: "monospace", fontSize: "0.75rem",
                      wordBreak: "break-all", color: "var(--color-warning)", fontWeight: 600,
                    }}>
                      GBTEST123STELLAR456WALLET789XLM001
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: 8 }}>
                      Stellar wallet will be created at first settlement.
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-full btn-lg" onClick={handleSettle}>
                  Pay {formatPeso(totalIOwe)} via {method.toUpperCase()}
                </button>
              </div>
            )}

            {whoIOwe.length === 0 && pendingForMe.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                <h2 className="text-lg">You're all settled!</h2>
                <p className="text-muted" style={{ marginTop: 8 }}>No outstanding balances in this group.</p>
                <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => navigate(`/groups/${groupId}`)}>
                  Back to Group
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
