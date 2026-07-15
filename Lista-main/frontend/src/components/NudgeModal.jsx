import React, { useState } from "react";
import { Bell, X, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getUserById } from "../data/mockData";

export default function NudgeModal({ groupId, toUserId, onClose }) {
  const { state, dispatch } = useApp();
  const [sent, setSent] = useState(false);

  const toUser = getUserById(toUserId);

  // Check rate limit: max 1 nudge per pair per 24h
  const already = state.nudges.find(
    (n) =>
      n.groupId === groupId &&
      n.fromUserId === state.user.id &&
      n.toUserId === toUserId &&
      Date.now() - new Date(n.sentAt).getTime() < 86400000
  );

  const handleNudge = () => {
    if (already) return;
    dispatch({
      type: "SEND_NUDGE",
      payload: {
        id: `nudge-${Date.now()}`,
        groupId,
        fromUserId: state.user.id,
        toUserId,
        sentAt: new Date().toISOString(),
        acknowledged: false,
      },
    });
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--color-primary-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Bell size={28} color="var(--color-primary)" />
          </div>

          {sent ? (
            <>
              <div className="text-lg" style={{ marginBottom: 8 }}>Nudge sent! 👋</div>
              <div className="text-muted text-sm">{toUser?.displayName} has been notified.</div>
            </>
          ) : already ? (
            <>
              <div className="text-lg" style={{ marginBottom: 8 }}>Already nudged</div>
              <div className="row gap-sm" style={{ justifyContent: "center", marginTop: 8 }}>
                <AlertCircle size={14} color="var(--color-warning)" />
                <span className="text-sm text-muted">You can only nudge once per 24 hours.</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-lg" style={{ marginBottom: 8 }}>
                Nudge {toUser?.displayName}?
              </div>
              <div className="text-sm text-muted">
                They'll get a notification that you're waiting on them.
              </div>
            </>
          )}
        </div>

        <div className="stack gap-sm">
          {!sent && !already && (
            <button className="btn btn-primary btn-full" onClick={handleNudge}>
              <Bell size={16} /> Send Nudge
            </button>
          )}
          <button className="btn btn-ghost btn-full" onClick={onClose}>
            {sent ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
