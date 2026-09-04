import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import "../App.css";

interface User {
  id: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";

  // SMS 2FA
  is2FAEnabled: boolean;

  // Authenticator / TOTP
  isTotpEnabled: boolean;
}

function Dashboard() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // TOTP SETUP STATE
  // =========================================================

  const [showTotpSetup, setShowTotpSetup] = useState(false);

  const [totpUri, setTotpUri] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState("");
  const [totpMessage, setTotpMessage] = useState("");

  // =========================================================
  // FETCH PROFILE
  // =========================================================

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
        console.error(
          "Failed to fetch profile:",
          error
        );

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

  // =========================================================
  // SETUP AUTHENTICATOR
  // =========================================================

  const handleSetupTotp = async () => {
    try {
      setTotpLoading(true);
      setTotpError("");
      setTotpMessage("");

      const response = await api.post(
        "/auth/totp/setup",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setTotpUri(response.data.uri);
      setTotpSecret(response.data.secret);

      setShowTotpSetup(true);
    } catch (error: any) {
      console.error(
        "TOTP setup failed:",
        error
      );

      setTotpError(
        error.response?.data?.message ||
          "Unable to start authenticator setup."
      );
    } finally {
      setTotpLoading(false);
    }
  };

  // =========================================================
  // VERIFY AUTHENTICATOR
  // =========================================================

  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) {
      setTotpError(
        "Please enter the 6-digit authenticator code."
      );

      return;
    }

    try {
      setTotpLoading(true);
      setTotpError("");
      setTotpMessage("");

      await api.post(
        "/auth/totp/verify",
        {
          token: totpCode,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Only enable TOTP.
      // Do NOT change SMS 2FA status here.
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              isTotpEnabled: true,
            }
          : currentUser
      );

      setShowTotpSetup(false);
      setTotpCode("");

      setTotpMessage(
        "Authenticator enabled successfully!"
      );
    } catch (error: any) {
      console.error(
        "TOTP verification failed:",
        error
      );

      setTotpError(
        error.response?.data?.message ||
          "Invalid authenticator code."
      );
    } finally {
      setTotpLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

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

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dashboard-content">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-eyebrow">
              ACCOUNT OVERVIEW
            </p>

            <h1>
              Your Dashboard
            </h1>

            <p>
              Manage your account and security
              settings from one place.
            </p>

          </div>

          <div className="security-status">

            <span className="status-dot"></span>

            Secure session

          </div>

        </section>

        {/* ===================================================
            DASHBOARD GRID
        =================================================== */}

        <section className="dashboard-grid">

          {/* =================================================
              ACCOUNT CARD
          ================================================= */}

          <div className="dashboard-card">

            <h3>
              Account
            </h3>

            <p className="card-description">
              Your account information
            </p>

            <div className="profile-details">

              <div>

                <span>
                  Email address
                </span>

                <strong>
                  {user?.email}
                </strong>

              </div>

              <div>

                <span>
                  Phone number
                </span>

                <strong>
                  {user?.phone}
                </strong>

              </div>

              <div>

                <span>
                  Account role
                </span>

                <strong>
                  {user?.role}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================================
              TWO FACTOR AUTHENTICATION CARD
          ================================================= */}

          <div className="dashboard-card">

            <h3>
              Two-factor authentication
            </h3>

            <p className="card-description">
              Protect your account with additional
              verification methods.
            </p>

            {/* =================================================
                SMS 2FA
            ================================================= */}

            <div
              style={{
                marginTop: "20px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  marginBottom: "12px",
                }}
              >

                <div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "14px",
                      color: "#eeeeee",
                    }}
                  >
                    SMS verification
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#777777",
                    }}
                  >
                   
                  </span>

                </div>

                {user?.is2FAEnabled ? (

                  <div className="security-badge">

                    <span className="status-dot"></span>

                    Enabled

                  </div>

                ) : (

                  <button
                    type="button"
                    className="enable-2fa-btn"
                    onClick={() =>
                      navigate("/2fa")
                    }
                  >
                    Enable SMS 2FA
                  </button>

                )}

              </div>

            </div>

            {/* =================================================
                AUTHENTICATOR / TOTP
            ================================================= */}

            <div
              style={{
                marginTop: "22px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >

                <div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "14px",
                      color: "#eeeeee",
                    }}
                  >
                    Authenticator app
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#777777",
                    }}
                  >
                    
                  </span>

                </div>

                {user?.isTotpEnabled ? (

                  <div className="security-badge">

                    <span className="status-dot"></span>

                    Enabled

                  </div>

                ) : (

                  <button
                    type="button"
                    className="enable-2fa-btn"
                    onClick={handleSetupTotp}
                    disabled={totpLoading}
                  >
                    {totpLoading
                      ? "Setting up..."
                      : "Set up Authenticator"}
                  </button>

                )}

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {totpError && (

              <div
                className="form-error"
                style={{
                  marginTop: "18px",
                }}
              >
                {totpError}
              </div>

            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {totpMessage && (

              <div
                className="form-success"
                style={{
                  marginTop: "18px",
                }}
              >
                {totpMessage}
              </div>

            )}

            {/* =================================================
                TOTP SETUP PANEL
            ================================================= */}

            {showTotpSetup &&
              !user?.isTotpEnabled && (

                <div
                  style={{
                    marginTop: "25px",
                    padding: "20px",
                    background: "#181818",
                    border: "1px solid #292929",
                    borderRadius: "12px",
                  }}
                >

                  <h4
                    style={{
                      marginBottom: "10px",
                      fontSize: "15px",
                    }}
                  >
                    Set up your authenticator
                  </h4>

                  <p
                    style={{
                      color: "#888",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      marginBottom: "20px",
                    }}
                  >
                    Open Google Authenticator or
                    Microsoft Authenticator and
                    scan this QR code.
                  </p>

                  {/* QR CODE */}

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "15px",
                      width: "fit-content",
                      borderRadius: "10px",
                      margin: "0 auto 20px",
                    }}
                  >

                    <QRCodeSVG
                      value={totpUri}
                      size={190}
                    />

                  </div>

                  {/* MANUAL SECRET */}

                  <p
                    style={{
                      color: "#777",
                      fontSize: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    Can't scan the QR code?
                    Enter this key manually:
                  </p>

                  <div
                    style={{
                      padding: "10px",
                      background: "#101010",
                      border: "1px solid #292929",
                      borderRadius: "8px",
                      color: "#ffc400",
                      fontSize: "12px",
                      wordBreak: "break-all",
                      marginBottom: "20px",
                    }}
                  >
                    {totpSecret}
                  </div>

                  {/* CODE INPUT */}

                  <label
                    style={{
                      display: "block",
                      color: "#d7d7d7",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    Enter the 6-digit code from
                    your authenticator
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    style={{
                      width: "100%",
                      height: "50px",
                      padding: "0 14px",
                      background: "#111111",
                      border: "1px solid #333333",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontSize: "18px",
                      letterSpacing: "5px",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />

                  {/* VERIFY */}

                  <button
                    type="button"
                    className="submit-btn"
                    style={{
                      marginTop: "15px",
                    }}
                    onClick={handleVerifyTotp}
                    disabled={
                      totpLoading ||
                      totpCode.length !== 6
                    }
                  >
                    {totpLoading
                      ? "Verifying..."
                      : "Verify & Enable"}
                  </button>

                </div>

              )}

          </div>

          {/* =================================================
              AUTHENTICATION CARD
          ================================================= */}

          <div className="dashboard-card">

            <h3>
              Authentication
            </h3>

            <p className="card-description">
              Your session is protected using
              secure JWT authentication.
            </p>

            <div className="security-badge">

              <span className="status-dot"></span>

              Protected

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;