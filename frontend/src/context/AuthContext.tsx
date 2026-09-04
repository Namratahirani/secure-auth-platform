import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

interface User {
  id: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  is2FAEnabled: boolean;
  isTotpEnabled: boolean;
}

interface LoginResult {
  requires2FA: boolean;
  requiresTOTP: boolean;
  twoFactorToken?: string;
  role?: "USER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (
    email: string,
    password: string
  ) => Promise<LoginResult>;

  complete2FA: (
    twoFactorToken: string,
    otp: string
  ) => Promise<"USER" | "ADMIN">;

  completeTOTP: (
    twoFactorToken: string,
    token: string
  ) => Promise<"USER" | "ADMIN">;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  // Restore user after browser refresh
  useEffect(() => {
    const loadUser = async () => {
      if (!accessToken) {
        setUser(null);
        return;
      }

      try {
        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error(
          "Failed to restore user session:",
          error
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      }
    };

    loadUser();
  }, [accessToken]);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    // TOTP required
    if (response.data.requiresTOTP) {
      return {
        requires2FA: false,
        requiresTOTP: true,
        twoFactorToken: response.data.twoFactorToken,
      };
    }

    // SMS 2FA required
    if (response.data.requires2FA) {
      return {
        requires2FA: true,
        requiresTOTP: false,
        twoFactorToken: response.data.twoFactorToken,
      };
    }

    // Normal login
    setAccessToken(response.data.accessToken);

    localStorage.setItem(
      "accessToken",
      response.data.accessToken
    );

    setRefreshToken(response.data.refreshToken);

    localStorage.setItem(
      "refreshToken",
      response.data.refreshToken
    );

    setUser(response.data.user);

    return {
      requires2FA: false,
      requiresTOTP: false,
      role: response.data.user.role,
    };
  };

  // =========================================================
  // SMS 2FA
  // =========================================================

  const complete2FA = async (
    twoFactorToken: string,
    otp: string
  ): Promise<"USER" | "ADMIN"> => {
    const response = await api.post(
      "/auth/2fa-login/verify",
      {
        twoFactorToken,
        otp,
      }
    );

    setAccessToken(response.data.accessToken);

    localStorage.setItem(
      "accessToken",
      response.data.accessToken
    );

    setRefreshToken(response.data.refreshToken);

    localStorage.setItem(
      "refreshToken",
      response.data.refreshToken
    );

    setUser(response.data.user);

    return response.data.user.role;
  };

  // =========================================================
  // TOTP
  // =========================================================

  const completeTOTP = async (
    twoFactorToken: string,
    token: string
  ): Promise<"USER" | "ADMIN"> => {
    const response = await api.post(
      "/auth/totp-login/verify",
      {
        twoFactorToken,
        token,
      }
    );

    setAccessToken(response.data.accessToken);

    localStorage.setItem(
      "accessToken",
      response.data.accessToken
    );

    setRefreshToken(response.data.refreshToken);

    localStorage.setItem(
      "refreshToken",
      response.data.refreshToken
    );

    setUser(response.data.user);

    return response.data.user.role;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    try {
      if (refreshToken) {
        await api.post("/auth/logout", {
          refreshToken,
        });
      }
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        complete2FA,
        completeTOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}