
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

        // Token is invalid/expired
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

      {/* Main content */}
      <main className="dashboard-content">

        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              AUTHENTICATED DASHBOARD
            </p>

            <h1>
              Welcome back 👋
            </h1>

            <p>
              Your account is securely authenticated.
            </p>
          </div>

          <div className="security-status">
            <span className="status-dot"></span>
            Secure session
          </div>
        </div>

        {/* Cards */}
        <div className="dashboard-grid">

          {/* Account */}
          <div className="dashboard-card">
            <div className="card-icon">
              👤
            </div>

            <h3>
              Account
            </h3>

            <div className="profile-details">

              <div>
                <span>Email</span>
                <strong>
                  {user?.email}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {user?.phone}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {user?.role}
                </strong>
              </div>

            </div>
          </div>

          {/* 2FA */}
          <div className="dashboard-card">
            <div className="card-icon">
              🔐
            </div>

            <h3>
              Two-factor authentication
            </h3>

            <p className="card-description">
              Add an extra layer of security to your account.
            </p>

            {user?.is2FAEnabled ? (
  <div className="security-badge">✓ Enabled</div>
) : (
  <button
    type="button"
    className="enable-2fa-btn"
    onClick={() => navigate("/2fa")}
  >
    Enable 2FA →
  </button>
)}
          </div>

          {/* JWT */}
          <div className="dashboard-card">
            <div className="card-icon">
              🛡️
            </div>

            <h3>
              Authentication
            </h3>

            <p className="card-description">
              Your session is protected using a JWT
              access token.
            </p>

            <div className="security-badge">
              ✓ Protected
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
