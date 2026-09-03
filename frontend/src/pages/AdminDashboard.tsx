import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../App.css";

interface AdminUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
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
            err.response?.data?.message || "Unable to load users."
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

      {/* Navbar */}
      <nav className="admin-nav">

        <div className="dashboard-logo">
          Secure<span>Auth</span>
        </div>

        <div className="admin-nav-right">

          <div className="admin-account">
            <span className="admin-indicator"></span>
            <span>Admin</span>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </nav>

      {/* Main */}
      <main className="admin-content">

        {/* Header */}
        <section className="admin-header">

          <div className="admin-title-section">

            <p className="dashboard-eyebrow">
              ADMINISTRATION
            </p>

            <h1>User Management</h1>

            <p className="admin-subtitle">
              Manage registered accounts and monitor account status.
            </p>

          </div>

          {/* Total users */}
          <div className="admin-count-card">

            <span className="admin-count-label">
              TOTAL USERS
            </span>

            <strong>{users.length}</strong>

            <span className="admin-count-description">
              Registered accounts
            </span>

          </div>

        </section>

        {error ? (

          <div className="admin-error">

            <div className="error-icon">
              !
            </div>

            <div>
              <h3>Access denied</h3>
              <p>{error}</p>
            </div>

            <button
              className="enable-2fa-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </button>

          </div>

        ) : (

          <section className="admin-table-card">

            {/* Table header */}
            <div className="admin-table-header">

              <div>
                <h2>Registered Users</h2>

                <p>
                  Overview of accounts registered on SecureAuth.
                </p>
              </div>

              <div className="user-count-small">
                {users.length} {users.length === 1 ? "user" : "users"}
              </div>

            </div>

            {/* Table */}
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr key={user.id}>

                      <td>
                        <div className="user-email">
                          <div className="user-avatar">
                            {user.email.charAt(0).toUpperCase()}
                          </div>

                          <strong>{user.email}</strong>
                        </div>
                      </td>

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
                        <span
                          className={
                            user.isActive
                              ? "table-status enabled"
                              : "table-status disabled"
                          }
                        >
                          <span className="status-mini-dot"></span>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="joined-date">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>
    </div>
  );
}

export default AdminDashboard;