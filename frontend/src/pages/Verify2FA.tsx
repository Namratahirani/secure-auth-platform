
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Verify2FA() {
  const location = useLocation();
  const navigate = useNavigate();

  const { complete2FA } = useAuth();

  const twoFactorToken =
    location.state?.twoFactorToken;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!twoFactorToken) {
      setError(
        "Your verification session has expired. Please login again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be a 6-digit number.");
      return;
    }

    setLoading(true);

    try {
      // complete2FA now returns the authenticated user's role
      const role = await complete2FA(
        twoFactorToken,
        otp
      );

      // Redirect based on the role returned by the backend
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        {/* Left Side */}
        <div className="auth-brand">
          <div>
            <div className="brand-badge">
              🔐 Secure verification
            </div>

            <h1
              className="brand-heading"
              style={{ marginTop: "16px" }}
            >
              One more step. <br />
              <span>Almost there.</span>
            </h1>

            <p className="brand-subtext">
              We've sent a one-time verification code
              to your registered phone number.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Security check</span>

              <span style={{ color: "#818cf8" }}>
                2FA
              </span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: "75%" }}
              />
            </div>

            <p className="progress-footer">
              Your account is protected with two-factor
              authentication 🛡️
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Verify your identity</h2>

            <p>
              Enter the 6-digit OTP sent to your phone.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label>Verification code</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="123456"
                required
              />
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </form>

          <p className="switch-mode">
            Didn't receive the code?{" "}

            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Login again
            </button>
          </p>

          <div className="auth-footer-meta">
            Secure authentication • JWT • 2FA
          </div>
        </div>

      </div>
    </div>
  );
}

