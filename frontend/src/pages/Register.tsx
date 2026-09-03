
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    console.log("Register button clicked");
    console.log("Sending request to:", "http://localhost:5000/api/auth/register");

    try {
      const response = await api.post("/auth/register", {
        email,
        phone,
        password,
      });

      console.log("Registration successful:", response.data);

      setMessage("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="brand-badge">
            ✨ Start your journey
          </div>

          <div>
            <h1 className="brand-heading">
              Learn.
              <br />
              Grow.
              <br />
              <span>Level up.</span> 🚀
            </h1>

            <p className="brand-subtext">
              Create your account and start building better learning
              habits, one step at a time.
            </p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span>Your journey starts here</span>
              <span>0%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: "5%" }}
              />
            </div>

            <p className="progress-footer">
              Take the first step toward your goals.
            </p>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-header">
            <h2>Create your account</h2>
            <p>Set up your account to get started.</p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <div className="auth-form">

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="submit-btn"
              disabled={loading}
              onClick={handleRegister}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </div>

          <p className="switch-mode">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>

          <div className="auth-footer-meta">
            Secure authentication · JWT · 2FA
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;

