import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage(
        "Password reset successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. The link may be invalid or expired."
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
              🔐 Secure password reset
            </div>

            <h1
              className="brand-heading"
              style={{ marginTop: "16px" }}
            >
              Create a new
              <br />
              <span>password.</span>
            </h1>

            <p className="brand-subtext">
              Choose a strong password to keep your account
              protected.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Account recovery</span>
              <span style={{ color: "#818cf8" }}>100%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: "100%" }}
              />
            </div>

            <p className="progress-footer">
              Almost done. Set your new password.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Set new password</h2>
            <p>
              Enter your new password below.
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
              <label htmlFor="password">
                New password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Enter password again"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Resetting password..."
                : "Reset password"}
            </button>
          </form>

          <p className="switch-mode">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>

          <div className="auth-footer-meta">
            Single-use token • Secure password recovery
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;