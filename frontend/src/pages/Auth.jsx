import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Phone, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { currentUser } from "../data/mockData";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { dispatch } = useApp();

  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [method, setMethod] = useState("phone");
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credential) { setError("Please enter your phone or email."); return; }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: method,
          credential: credential,
          displayName: credential.includes("@") ? credential.split("@")[0] : `User_${credential.slice(-4)}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("lista_token", data.token);
      dispatch({ type: "LOGIN", payload: data.user });

      setLoading(false);
      navigate(mode === "signup" ? "/onboarding" : "/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to backend server.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    const googleEmail = prompt("Enter your Google account email to simulate OAuth callback:", "google_user@gmail.com");
    if (!googleEmail) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "google",
          credential: googleEmail,
          displayName: "Google User",
          photoUrl: "https://lh3.googleusercontent.com/a/default",
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Google authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("lista_token", data.token);
      dispatch({ type: "LOGIN", payload: data.user });

      setLoading(false);
      navigate(mode === "signup" ? "/onboarding" : "/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to backend server.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="orb-container">
        <div className="orb orb-1" style={{ opacity: 0.08 }} />
        <div className="orb orb-2" style={{ opacity: 0.06 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 430, margin: "0 auto", padding: "0 24px" }}>
        {/* Back */}
        <div style={{ paddingTop: 56, marginBottom: 32 }}>
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="anim-fade-up" style={{ marginBottom: 32 }}>
          <h1 className="text-2xl" style={{ marginBottom: 6 }}>
            {mode === "login" ? "Welcome back 👋" : "Join Lista 🎉"}
          </h1>
          <p className="text-muted">
            {mode === "login"
              ? "Log in to your account to continue."
              : "Create your account to start splitting."}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: "flex", background: "var(--color-surface-2)",
          borderRadius: "var(--radius-full)", padding: 4,
          marginBottom: 28,
        }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "10px",
                borderRadius: "var(--radius-full)",
                background: mode === m ? "var(--color-primary)" : "none",
                color: mode === m ? "#fff" : "var(--color-text-2)",
                fontWeight: 600, fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          className="btn btn-ghost btn-full"
          onClick={handleGoogle}
          disabled={loading}
          style={{ marginBottom: 20, justifyContent: "center" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="row gap-md" style={{ marginBottom: 20 }}>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
          <span className="text-xs text-muted-3">or</span>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Method tabs */}
        <div className="chip-group" style={{ marginBottom: 20 }}>
          <button
            className={`chip ${method === "phone" ? "selected" : ""}`}
            onClick={() => { setMethod("phone"); setCredential(""); }}
          >
            <Phone size={13} style={{ marginRight: 4, display: "inline" }} />
            Phone
          </button>
          <button
            className={`chip ${method === "email" ? "selected" : ""}`}
            onClick={() => { setMethod("email"); setCredential(""); }}
          >
            <Mail size={13} style={{ marginRight: 4, display: "inline" }} />
            Email
          </button>
        </div>

        {/* Form */}
        <form className="stack gap-md anim-fade-up" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">
              {method === "phone" ? "Phone Number" : "Email Address"}
            </label>
            <input
              className="input"
              type={method === "phone" ? "tel" : "email"}
              placeholder={method === "phone" ? "+63 9XX XXX XXXX" : "you@example.com"}
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 46 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", color: "var(--color-text-3)",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "var(--color-danger-dim)",
              borderRadius: "var(--radius-md)", fontSize: "0.875rem",
              color: "var(--color-danger)",
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <span style={{
                width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin 0.7s linear infinite", display: "inline-block",
              }} />
            ) : (
              mode === "login" ? "Log In" : "Create Account"
            )}
          </button>
        </form>

        <p className="text-xs text-muted" style={{ textAlign: "center", marginTop: 24 }}>
          By continuing, you agree to Lista's Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
