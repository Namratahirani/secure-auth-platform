
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      // If 2FA is enabled, go to OTP verification
      if (result.requires2FA) {
        navigate("/verify-2fa", {
          state: {
            twoFactorToken: result.twoFactorToken,
          },
        });
      }

      // Normal login
      else if (result.role === "ADMIN") {
        navigate("/admin");
      }

      // Normal USER login
      else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        {/* Left Side: Product Branding */}
        <div className="auth-brand">
          <div>
            <div className="brand-badge">
              ✨ Learn smarter with Learnly
            </div>

            <h1
              className="brand-heading"
              style={{ marginTop: "16px" }}
            >
              Your goals. <br />
              <span>Your journey.</span>
            </h1>

            <p className="brand-subtext">
              Build your learning streak, track your progress,
              and keep improving every single day.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Weekly progress</span>
              <span style={{ color: "#818cf8" }}>
                78%
              </span>
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" />
            </div>

            <p className="progress-footer">
              Keep going! You're doing great 🚀
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome back 👋</h2>

            <p>
              Sign in to access your dashboard and continue
              learning.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label>Password</label>

                <Link
                  to="/forgot-password"
                  className="auth-link"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
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
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="switch-mode">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="auth-link"
            >
              Create account
            </Link>
          </p>

          <div className="auth-footer-meta">
            Secure authentication • JWT • 2FA
          </div>
        </div>

      </div>
    </div>
  );
}
