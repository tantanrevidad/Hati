import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ArrowLeft, LogIn, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getGroupById } from "../data/mockData";
import AvatarStack from "../components/AvatarStack";

export default function JoinGroup() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // Find a group matching the slug (mock: match last 8 chars of any group id)
  const group = state.groups.find(
    (g) => g.id.slice(-8) === slug || g.id === slug
  ) ?? state.groups[0]; // fallback to first group for demo

  const isAlreadyMember = group?.memberIds.includes(state.user.id);

  const handleJoin = async () => {
    if (!state.isAuthenticated) {
      navigate("/auth?mode=login");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // In real app: POST /join/:slug with auth token
    setJoined(true);
    setLoading(false);
    setTimeout(() => navigate(`/groups/${group.id}`), 1200);
  };

  if (!state.isAuthenticated) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
          <h2 className="text-xl" style={{ marginBottom: 8 }}>Login required</h2>
          <p className="text-muted" style={{ marginBottom: 24 }}>
            You need to log in before joining a Listahan.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/auth?mode=login")}>
            <LogIn size={16} /> Log In to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh" }}>
      <div className="page-header" style={{ paddingTop: 52 }}>
        <button className="back-btn" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl">Join Listahan</h1>
      </div>

      <div style={{ padding: "0 24px" }}>
        {group ? (
          <div className="stack gap-lg anim-scale-in" style={{ textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: "var(--color-primary-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "20px auto 0", fontSize: "2.5rem",
            }}>
              {group.name.match(/[\u{1F300}-\u{1FFFF}]/u)?.[0] || "📋"}
            </div>

            <div>
              <h2 className="text-xl" style={{ marginBottom: 6 }}>
                {group.name.replace(/\s*[\u{1F300}-\u{1FFFF}]\s*/gu, "").trim()}
              </h2>
              <p className="text-muted text-sm">
                {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <AvatarStack userIds={group.memberIds} size="md" />
            </div>

            <div className="card-glass" style={{ padding: "12px 16px", textAlign: "left" }}>
              <div className="text-sm text-muted">
                By joining, you'll be able to see all expenses and balances in this Listahan.
              </div>
            </div>

            {joined ? (
              <div style={{
                padding: "16px",
                background: "var(--color-accent-dim)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-accent)",
                fontWeight: 600,
              }}>
                ✅ Joined! Redirecting...
              </div>
            ) : isAlreadyMember ? (
              <div style={{
                padding: "16px",
                background: "var(--color-primary-dim)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-primary)",
                fontWeight: 600,
              }}>
                You're already a member!
              </div>
            ) : (
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Listahan"}
              </button>
            )}

            {isAlreadyMember && (
              <button className="btn btn-ghost btn-full" onClick={() => navigate(`/groups/${group.id}`)}>
                Go to Group
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>😕</div>
            <p className="text-muted">This join link is invalid or expired.</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate("/home")}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
