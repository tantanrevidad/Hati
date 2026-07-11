import React from "react";
import { Receipt, Camera, Clock } from "lucide-react";
import { formatPeso, getUserById, getInitials, getAvatarColor } from "../data/mockData";

const categoryColors = {
  rent:        { bg: "#7C5CFC22", text: "#A78BFA", label: "Rent" },
  utilities:   { bg: "#4FC3F722", text: "#4FC3F7", label: "Utilities" },
  groceries:   { bg: "#00D2A022", text: "#00D2A0", label: "Groceries" },
  other:       { bg: "#FFB34722", text: "#FFB347", label: "Other" },
};

export default function ExpenseItem({ expense, style }) {
  const payer = getUserById(expense.paidBy);
  const cat = categoryColors[expense.category] || categoryColors.other;
  const isScanned = expense.source === "invoice_scan";

  const timeAgo = (isoStr) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return "Just now";
  };

  return (
    <div className="card" style={{ ...style }}>
      <div className="card-body" style={{ padding: "14px 16px" }}>
        <div className="row-between">
          <div className="row gap-sm" style={{ flex: 1, minWidth: 0 }}>
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: cat.bg, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {isScanned
                ? <Camera size={16} color={cat.text} />
                : <Receipt size={16} color={cat.text} />
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: "0.875rem",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {expense.description}
              </div>
              <div className="row gap-xs" style={{ marginTop: 3 }}>
                <div
                  className="avatar avatar-sm"
                  style={{ width: 16, height: 16, fontSize: "0.5rem", background: getAvatarColor(expense.paidBy) }}
                >
                  {getInitials(payer?.displayName || "?")}
                </div>
                <span className="text-xs text-muted">{payer?.displayName}</span>
                <span className="text-xs text-muted-3">·</span>
                <Clock size={10} color="var(--color-text-3)" />
                <span className="text-xs text-muted-3">{timeAgo(expense.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
            <div className="font-bold" style={{ fontSize: "0.9375rem" }}>
              {formatPeso(expense.amount)}
            </div>
            <span className="badge" style={{ background: cat.bg, color: cat.text, fontSize: "0.6875rem" }}>
              {cat.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
