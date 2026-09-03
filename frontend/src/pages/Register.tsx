import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setMessage("");
    setLoading(true);

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
          <div>
            <div className="brand-badge">Get started</div>

            <h1 className="brand-heading">
              A simple place to
              <br />
              <span>keep learning.</span>
            </h1>

            <p className="brand-subtext">
              Create your account and keep everything you need in one place.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Create your account</h2>
            <p>Enter your details to get started.</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          {message && <div className="form-success">{message}</div>}

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

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <span
                    className={
                      showPassword ? "eye-icon eye-hidden" : "eye-icon"
                    }
                  >
                    <span className="eye-pupil"></span>
                  </span>
                </button>
              </div>
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
        </div>
      </div>
    </div>
  );
}

export default Register;