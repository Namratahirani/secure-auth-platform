import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function VerifyTOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const { completeTOTP } = useAuth();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const twoFactorToken =
    location.state?.twoFactorToken;

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

    if (!/^\d{6}$/.test(token)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const role = await completeTOTP(
        twoFactorToken,
        token
      );

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("TOTP verification failed:", err);

      setError(
        err.response?.data?.message ||
          "Invalid authenticator code. Please try again."
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
              Secure verification
            </div>

            <h1 className="brand-heading">
              Verify your
              <br />
              <span>authenticator.</span>
            </h1>

            <p className="brand-subtext">
              Open your authenticator app and enter
              the 6-digit code shown for SecureAuth.
            </p>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-header">
            <h2>Authenticator verification</h2>

            <p>
              Enter the 6-digit code from your
              authenticator app.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="totp">
                Authentication code
              </label>

              <input
                id="totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={token}
                onChange={(e) =>
                  setToken(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                loading || token.length !== 6
              }
            >
              {loading
                ? "Verifying..."
                : "Verify code"}
            </button>
          </form>

          <p className="switch-mode">
            The code changes every few seconds.
          </p>

        </div>
      </div>
    </div>
  );
}