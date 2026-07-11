import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { formatPeso, getLedgerByGroup, getUserById, getInitials, getAvatarColor } from "../data/mockData";
import { useApp } from "../context/AppContext";
import AvatarStack from "./AvatarStack";

export default function GroupCard({ group, style }) {
  const navigate = useNavigate();
  const { state } = useApp();
  const ledger = state.ledgers[group.id];
  const myBalance = ledger?.balances.find((b) => b.userId === state.user.id);
  const net = myBalance?.netBalance ?? 0;
  const isArchiving = group.zeroBalanceSince !== null;

  const handleClick = () => navigate(`/groups/${group.id}`);

  return (
    <div className="card card-hover" style={style} onClick={handleClick}>
      <div className="card-body">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <div className="row gap-sm">
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "var(--color-primary-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem",
            }}>
              {group.name.match(/[\u{1F300}-\u{1FFFF}]/u)?.[0] || "📋"}
            </div>
            <div>
              <div className="font-semi" style={{ fontSize: "0.9375rem" }}>
                {group.name.replace(/\s*[\u{1F300}-\u{1FFFF}]\s*/gu, "").trim()}
              </div>
              <div className="row gap-xs" style={{ marginTop: 2 }}>
                <Users size={11} color="var(--color-text-3)" />
                <span className="text-xs text-muted-3">{group.memberIds.length} members</span>
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--color-text-3)" />
        </div>

        <div className="row-between">
          <AvatarStack userIds={group.memberIds.slice(0, 4)} size="sm" />
          <div style={{ textAlign: "right" }}>
            {net === 0 ? (
              <span className="badge badge-muted">Settled</span>
            ) : net > 0 ? (
              <>
                <div className="text-xs text-muted" style={{ marginBottom: 2 }}>You're owed</div>
                <div className="font-bold text-accent" style={{ fontSize: "0.9375rem" }}>
                  {formatPeso(net)}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-muted" style={{ marginBottom: 2 }}>You owe</div>
                <div className="font-bold text-danger" style={{ fontSize: "0.9375rem" }}>
                  {formatPeso(Math.abs(net))}
                </div>
              </>
            )}
          </div>
        </div>

        {isArchiving && (
          <div style={{
            marginTop: 10,
            padding: "6px 10px",
            background: "var(--color-warning-dim)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-warning)",
          }}>
            ⏳ Auto-archiving soon — ₱0 balance for 7 days
          </div>
        )}
      </div>
    </div>
  );
}
