import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function TwoFactor() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enable" | "verify">("enable");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post(
        "/auth/2fa/enable",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage(
        "A verification OTP has been sent to your registered phone number."
      );
      setStep("verify");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to enable two-factor authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      await api.post(
        "/auth/2fa/verify",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage("Two-factor authentication enabled successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-badge">🔐 Secure your account</div>

          <div>
            <h1 className="brand-heading">
              One more step.
              <br />
              <span>Stay protected.</span> 🛡️
            </h1>

            <p className="brand-subtext">
              Two-factor authentication adds an extra layer of security
              whenever you sign in.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Security setup</span>
              <span>{step === "enable" ? "50%" : "100%"}</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: step === "enable" ? "50%" : "100%",
                }}
              />
            </div>

            <p className="progress-footer">
              {step === "enable"
                ? "Enable two-factor authentication."
                : "Verify your identity with the OTP."}
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Two-factor authentication</h2>

            <p>
              {step === "enable"
                ? "Add an extra layer of security to your account."
                : "Enter the OTP sent to your registered phone."}
            </p>
          </div>

          {error && <div className="form-error">{error}</div>}

          {message && <div className="form-success">{message}</div>}

          {step === "enable" ? (
            <div className="auth-form">
              <div className="security-info">
                <div className="card-icon">📱</div>

                <p>
                  We'll send a one-time verification code to your
                  registered phone number.
                </p>
              </div>

              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={handleEnable}
              >
                {loading ? "Sending OTP..." : "Enable 2FA"}
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Verification code</label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={handleVerify}
              >
                {loading ? "Verifying..." : "Verify & enable"}
              </button>
            </div>
          )}

          <button
            type="button"
            className="auth-link"
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            ← Back to dashboard
          </button>

          <div className="auth-footer-meta">
            Secure authentication · JWT · 2FA
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactor;