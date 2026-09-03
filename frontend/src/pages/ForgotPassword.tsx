import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });

      setMessage(
        "If an account exists with this email, a password reset link has been generated."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        <div className="auth-brand">
          <div>
            <div className="brand-badge">
              🔑 Account recovery
            </div>

            <h1
              className="brand-heading"
              style={{ marginTop: "16px" }}
            >
              Forgot your
              <br />
              <span>password?</span>
            </h1>

            <p className="brand-subtext">
              No worries. Enter your registered email and we'll
              help you securely reset your password.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Account recovery</span>
              <span style={{ color: "#818cf8" }}>50%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: "50%" }}
              />
            </div>

            <p className="progress-footer">
              We'll guide you through the recovery process.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset your password</h2>
            <p>
              Enter the email associated with your account.
            </p>
          </div>

          {error && <div className="form-error">{error}</div>}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Generating reset link..."
                : "Send reset link"}
            </button>
          </form>

          <p className="switch-mode">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>

          <div className="auth-footer-meta">
            Secure password recovery • Single-use token
          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;