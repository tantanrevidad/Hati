import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CreditCard, Wallet, ArrowRight, Check } from "lucide-react";
import { useApp } from "../context/AppContext";

const STEPS = ["profile", "payment"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.user.displayName || "");
  const [method, setMethod] = useState(null);
  const [refToken, setRefToken] = useState("");
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { type: "gcash", label: "GCash", color: "#00ADEF", emoji: "💙" },
    { type: "maya",  label: "Maya",  color: "#1EC28B", emoji: "💚" },
    { type: "bank",  label: "Bank",  color: "#7C5CFC", emoji: "🏦" },
  ];

  const handleNext = async () => {
    if (step === 0) {
      if (!name.trim()) return;
      setStep(1);
    } else {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700));
      dispatch({
        type: "COMPLETE_ONBOARDING",
        payload: {
          displayName: name,
          linkedPaymentMethods: method
            ? [{ type: method, referenceToken: refToken || `${method.toUpperCase()}-${Date.now()}`, linkedAt: new Date().toISOString() }]
            : [],
        },
      });
      setLoading(false);
      navigate("/home");
    }
  };

  const handleSkip = () => {
    dispatch({ type: "COMPLETE_ONBOARDING", payload: { displayName: name } });
    navigate("/home");
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="orb-container">
        <div className="orb orb-1" style={{ opacity: 0.1 }} />
        <div className="orb orb-2" style={{ opacity: 0.07 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 430, margin: "0 auto", padding: "56px 24px 40px" }}>
        {/* Step dots */}
        <div className="row gap-sm" style={{ marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: i <= step ? "var(--color-primary)" : "var(--color-border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {step === 0 && (
          <div className="stack gap-lg anim-scale-in">
            <div>
              <h1 className="text-2xl" style={{ marginBottom: 6 }}>Set up your profile</h1>
              <p className="text-muted">How should your friends see you?</p>
            </div>

            {/* Avatar picker */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "var(--color-primary-dim)",
                border: "2px dashed var(--color-primary)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <Camera size={28} color="var(--color-primary)" />
                <span style={{ fontSize: "0.6875rem", color: "var(--color-primary)", fontWeight: 600, marginTop: 4 }}>Add photo</span>
              </div>
              <p className="text-xs text-muted">Optional</p>
            </div>

            <div className="input-group">
              <label className="input-label">Display Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleNext}
              disabled={!name.trim()}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="stack gap-lg anim-scale-in">
            <div>
              <h1 className="text-2xl" style={{ marginBottom: 6 }}>Link payment 💳</h1>
              <p className="text-muted">Makes settling up instant. You can skip this for now.</p>
            </div>

            <div className="stack gap-sm">
              {paymentMethods.map(({ type, label, color, emoji }) => (
                <button
                  key={type}
                  onClick={() => setMethod(method === type ? null : type)}
                  style={{
                    padding: "16px",
                    background: method === type ? "var(--color-primary-dim)" : "var(--color-surface-2)",
                    border: `1.5px solid ${method === type ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "all 0.2s",
                    color: "var(--color-text)",
                  }}
                >
                  <div className="row gap-sm">
                    <span style={{ fontSize: "1.25rem" }}>{emoji}</span>
                    <span style={{ fontWeight: 600 }}>{label}</span>
                  </div>
                  {method === type && (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--color-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {method && (
              <div className="input-group anim-fade-up">
                <label className="input-label">{method === "bank" ? "Account Number" : `${method.charAt(0).toUpperCase() + method.slice(1)} Number`}</label>
                <input
                  className="input"
                  placeholder={method === "bank" ? "0000 0000 0000" : "09XX XXX XXXX"}
                  value={refToken}
                  onChange={(e) => setRefToken(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? "Setting up..." : method ? "Link & Continue" : "Continue"}
            </button>
            <button className="btn btn-ghost btn-full" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
