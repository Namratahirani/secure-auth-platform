import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../App.css";

interface AdminUser {
  id: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  is2FAEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

function AdminDashboard() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUsers(response.data.users);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);

        if (err.response?.status === 403) {
          setError("You do not have permission to access this page.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load users."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchUsers();
    } else {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <div className="dashboard-logo">
          Secure<span>Auth</span>
        </div>

        <div className="admin-nav-right">
          <span className="admin-label">ADMIN PANEL</span>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <p className="dashboard-eyebrow">
              ADMINISTRATION
            </p>

            <h1>User management</h1>

            <p>
              View registered users and their authentication status.
            </p>
          </div>

          <div className="admin-count">
            <strong>{users.length}</strong>
            <span>Total users</span>
          </div>
        </div>

        {error ? (
          <div className="admin-error">
            <div className="card-icon">🛡️</div>
            <h3>Access denied</h3>
            <p>{error}</p>

            <button
              className="enable-2fa-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to dashboard
            </button>
          </div>
        ) : (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div>
                <h2>Registered users</h2>
                <p>
                  Authentication and account overview
                </p>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>2FA</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.email}</strong>
                      </td>

                      <td>{user.phone}</td>

                      <td>
                        <span
                          className={
                            user.role === "ADMIN"
                              ? "role-badge admin-role"
                              : "role-badge user-role"
                          }
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        {user.is2FAEnabled ? (
                          <span className="table-status enabled">
                            ✓ Enabled
                          </span>
                        ) : (
                          <span className="table-status disabled">
                            Not enabled
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            user.isActive
                              ? "table-status enabled"
                              : "table-status disabled"
                          }
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;