import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, Users } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(124,92,252,${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const features = [
    { icon: Zap,    label: "Instant splits", sub: "Equal, percentage, or custom" },
    { icon: Shield, label: "QRPH & Stellar", sub: "Philippine payment rails" },
    { icon: Users,  label: "Settle together", sub: "All members confirm" },
  ];

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0,
      }} />

      {/* Orbs */}
      <div className="orb-container" style={{ zIndex: 0 }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1, maxWidth: 430, margin: "0 auto",
        padding: "0 24px", minHeight: "100dvh",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Top */}
        <div style={{ paddingTop: 60 }} className="anim-fade-up">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--color-primary-dim)",
            border: "1px solid rgba(124,92,252,0.3)",
            borderRadius: "var(--radius-full)",
            padding: "6px 14px",
            fontSize: "0.8125rem", fontWeight: 600,
            color: "var(--color-primary)",
            marginBottom: 32,
          }}>
            🇵🇭 Made for Filipino groups
          </div>

          <h1 style={{
            fontSize: "3rem", fontWeight: 800, lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Your tab.<br />
            <span className="grad-text">Settled.</span>
          </h1>

          <p style={{ fontSize: "1.0625rem", color: "var(--color-text-2)", lineHeight: 1.6 }}>
            Split bills, track debts, and settle up with GCash, Maya, QRPH, or Stellar. No awkward "bayad na ba?" moments.
          </p>
        </div>

        {/* Features */}
        <div className="stack gap-sm anim-fade-up stagger-2" style={{ marginTop: 40 }}>
          {features.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} className="card-glass" style={{ padding: "12px 16px" }}>
              <div className="row gap-md">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--color-primary-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <div className="font-semi" style={{ fontSize: "0.9375rem" }}>{label}</div>
                  <div className="text-xs text-muted">{sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="stack gap-sm anim-fade-up stagger-4" style={{ paddingBottom: 48, marginTop: 32 }}>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-ghost btn-full btn-lg"
            onClick={() => navigate("/auth?mode=login")}
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
