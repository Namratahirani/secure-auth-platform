import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../App.css";

interface User {
  id: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  is2FAEnabled: boolean;
}

function Dashboard() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        await logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [accessToken, logout, navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          Secure<span>Auth</span>
        </div>

        <button
          className="logout-btn"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </nav>

      {/* Dashboard */}
      <main className="dashboard-content">

        {/* Header */}
        <section className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              ACCOUNT OVERVIEW
            </p>

            <h1>Your Dashboard</h1>

            <p className="dashboard-subtitle">
              Manage your account and security settings from one place.
            </p>
          </div>

          <div className="session-status">
            <span className="status-dot"></span>
            <span>Secure session</span>
          </div>
        </section>

        {/* Dashboard Cards */}
        <section className="dashboard-grid">

          {/* Account Card */}
          <div className="dashboard-card account-card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <span></span>
                </div>

                <div>
                  <h3>Account</h3>
                  <p>Your account information</p>
                </div>
              </div>
            </div>

            <div className="profile-details">

              <div className="profile-item">
                <span>Email address</span>
                <strong>{user?.email}</strong>
              </div>

              <div className="profile-item">
                <span>Phone number</span>
                <strong>{user?.phone}</strong>
              </div>

              <div className="profile-item">
                <span>Account role</span>
                <strong>{user?.role}</strong>
              </div>

            </div>
          </div>

          {/* 2FA Card */}
          <div className="dashboard-card security-card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon shield-icon">
                  <span></span>
                </div>

                <div>
                  <h3>Two-factor authentication</h3>
                  <p>Protect your account with an additional verification step.</p>
                </div>
              </div>
            </div>

            <div className="card-bottom">
              {user?.is2FAEnabled ? (
                <div className="security-badge">
                  <span className="badge-dot"></span>
                  Enabled
                </div>
              ) : (
                <button
                  type="button"
                  className="enable-2fa-btn"
                  onClick={() => navigate("/2fa")}
                >
                  Enable 2FA
                  <span>→</span>
                </button>
              )}
            </div>
          </div>

          {/* Authentication Card */}
          <div className="dashboard-card authentication-card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon lock-icon">
                  <span></span>
                </div>

                <div>
                  <h3>Authentication</h3>
                  <p>
                    Your session is protected using secure JWT authentication.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-bottom">
              <div className="security-badge">
                <span className="badge-dot"></span>
                Protected
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;