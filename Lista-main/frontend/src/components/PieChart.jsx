import React, { useRef, useEffect } from "react";
import { formatPeso, getAvatarColor, getInitials, getUserById } from "../data/mockData";

const COLORS = [
  "#7C5CFC", "#00D2A0", "#FF5C7A", "#FFB347",
  "#4FC3F7", "#CE93D8", "#80CBC4", "#FFAB91",
];

export default function PieChart({ balances, size = 160 }) {
  const canvasRef = useRef(null);
  const total = balances.reduce((s, b) => s + Math.abs(b.netBalance), 0);

  useEffect(() => {
    if (!canvasRef.current || total === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size / 2 - 8;
    const gap = 0.04; // gap between slices (radians)
    let startAngle = -Math.PI / 2;

    balances.forEach((b, i) => {
      const slice = (Math.abs(b.netBalance) / total) * (2 * Math.PI);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle + gap / 2, startAngle + slice - gap / 2);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.shadowColor = COLORS[i % COLORS.length];
      ctx.shadowBlur = 6;
      ctx.fill();
      startAngle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI);
    ctx.fillStyle = "#161827";
    ctx.shadowColor = "transparent";
    ctx.fill();
  }, [balances, size, total]);

  if (total === 0) {
    return (
      <div style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 6,
      }}>
        <div style={{ fontSize: "2rem" }}>✅</div>
        <div className="text-sm text-muted">All settled!</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <canvas ref={canvasRef} style={{ borderRadius: "50%" }} />

      {/* Legend */}
      <div className="stack gap-xs" style={{ width: "100%" }}>
        {balances.map((b, i) => {
          const user = getUserById(b.userId);
          return (
            <div key={b.userId} className="row-between" style={{ fontSize: "0.8125rem" }}>
              <div className="row gap-sm">
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: COLORS[i % COLORS.length], flexShrink: 0,
                }} />
                <span className="text-muted">{user?.displayName ?? b.userId}</span>
              </div>
              <span
                className="font-semi"
                style={{ color: b.netBalance >= 0 ? "var(--color-accent)" : "var(--color-danger)" }}
              >
                {b.netBalance >= 0 ? "+" : ""}{formatPeso(b.netBalance)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
