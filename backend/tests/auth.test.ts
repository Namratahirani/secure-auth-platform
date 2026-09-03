import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
describe("Authentication", () => {

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testPhone = "+919876543210";

  let refreshToken: string;
  let rotatedRefreshToken: string;

  describe("POST /api/auth/register", () => {

    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          phone: testPhone,
        });

      expect(response.status).toBe(201);

      expect(response.body.message).toBe(
        "User registered successfully"
      );

      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe(testEmail);

      expect(response.body.user).not.toHaveProperty(
        "passwordHash"
      );
    });

  });

  describe("POST /api/auth/login", () => {

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);

      expect(response.body.message).toBe(
        "Login successful"
      );

      expect(response.body.requires2FA).toBe(false);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      refreshToken = response.body.refreshToken;
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });

  });

  describe("POST /api/auth/token/refresh", () => {

    it("should refresh access and refresh tokens", async () => {
      const response = await request(app)
        .post("/api/auth/token/refresh")
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);

      expect(response.body.message).toBe(
        "Tokens refreshed successfully"
      );

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      expect(response.body.refreshToken).not.toBe(
        refreshToken
      );

      rotatedRefreshToken = response.body.refreshToken;
    });

    it("should reject the old refresh token after rotation", async () => {
      const response = await request(app)
        .post("/api/auth/token/refresh")
        .send({
          refreshToken,
        });

      expect(response.status).toBe(401);

      expect(response.body.message).toBe(
        "Refresh token has been revoked"
      );
    });

    it("should accept the newly rotated refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/token/refresh")
        .send({
          refreshToken: rotatedRefreshToken,
        });

      expect(response.status).toBe(200);

      expect(response.body.message).toBe(
        "Tokens refreshed successfully"
      );

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

  });

});

describe("Two-Factor Authentication", () => {

  const twoFAEmail = `2fa-${Date.now()}@example.com`;
  const twoFAPassword = "TestPassword123!";
  const twoFAPhone = "+919876543210";

  let accessToken: string;
  let otp: string;

  it("should register a user for 2FA", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: twoFAEmail,
        password: twoFAPassword,
        phone: twoFAPhone,
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("id");
  });

  it("should login and receive access token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: twoFAEmail,
        password: twoFAPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");

    accessToken = response.body.accessToken;
  });

  it("should send OTP when enabling 2FA", async () => {

    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await request(app)
      .post("/api/auth/2fa/enable")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(consoleSpy).toHaveBeenCalled();

    const calls = consoleSpy.mock.calls
      .map(call => call.join(" "))
      .join("\n");

    const otpMatch = calls.match(
      /Your Sstudize SecureAuth OTP is: (\d{6})/
    );

    expect(otpMatch).not.toBeNull();

    otp = otpMatch![1];

    consoleSpy.mockRestore();
  });

  it("should verify OTP and enable 2FA", async () => {

    const response = await request(app)
      .post("/api/auth/2fa/verify")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        otp,
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "2FA enabled successfully"
    );

    const user = await prisma.user.findUnique({
      where: {
        email: twoFAEmail,
      },
    });

    expect(user?.is2FAEnabled).toBe(true);
  });

});

describe("2FA Login", () => {

  const login2FAEmail = `login2fa-${Date.now()}@example.com`;
  const login2FAPassword = "TestPassword123!";
  const login2FAPhone = "+919876543210";

  let twoFactorToken: string;
  let otp: string;

  it("should create a user with 2FA enabled", async () => {

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: login2FAEmail,
        password: login2FAPassword,
        phone: login2FAPhone,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: login2FAEmail,
        password: login2FAPassword,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.accessToken;

    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await request(app)
      .post("/api/auth/2fa/enable")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    const calls = consoleSpy.mock.calls
      .map(call => call.join(" "))
      .join("\n");

    const otpMatch = calls.match(
      /Your Sstudize SecureAuth OTP is: (\d{6})/
    );

    expect(otpMatch).not.toBeNull();

    otp = otpMatch![1];

    consoleSpy.mockRestore();

    const verifyResponse = await request(app)
      .post("/api/auth/2fa/verify")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        otp,
      });

    expect(verifyResponse.status).toBe(200);
  });

  it("should require 2FA during login", async () => {

    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: login2FAEmail,
        password: login2FAPassword,
      });

    expect(response.status).toBe(200);

    expect(response.body.requires2FA).toBe(true);
    expect(response.body).toHaveProperty("twoFactorToken");

    twoFactorToken = response.body.twoFactorToken;

    const calls = consoleSpy.mock.calls
      .map(call => call.join(" "))
      .join("\n");

    const otpMatch = calls.match(
      /Your Sstudize SecureAuth OTP is: (\d{6})/
    );

    expect(otpMatch).not.toBeNull();

    otp = otpMatch![1];

    consoleSpy.mockRestore();
  });

  it("should complete login after valid 2FA verification", async () => {

    const response = await request(app)
      .post("/api/auth/2fa-login/verify")
      .send({
        twoFactorToken,
        otp,
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "2FA verification successful"
    );

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

});

describe("Forgot Password and Reset Password", () => {

  const resetEmail = `reset-${Date.now()}@example.com`;
  const oldPassword = "OldPassword123!";
  const newPassword = "NewPassword123!";

  let resetToken: string;

  it("should register a user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: resetEmail,
        password: oldPassword,
        phone: "+919876543210",
      });

    expect(response.status).toBe(201);
  });

  it("should create a password reset token", async () => {

    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: resetEmail,
      });

    expect(response.status).toBe(200);

    const calls = consoleSpy.mock.calls
      .map(call => call.join(" "))
      .join("\n");

    const tokenMatch = calls.match(
      /reset-password\?token=([a-f0-9]+)/
    );

    expect(tokenMatch).not.toBeNull();

    resetToken = tokenMatch![1];

    consoleSpy.mockRestore();
  });

  it("should reset the password using a valid token", async () => {

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        newPassword,
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Password reset successful"
    );
  });

  it("should reject reuse of the same reset token", async () => {

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        newPassword: "AnotherPassword123!",
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Password reset token has already been used"
    );
  });

  it("should login with the new password", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: resetEmail,
        password: newPassword,
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

});

describe("Profile", () => {

  it("should return the authenticated user's profile", async () => {

    const email = `profile-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password,
        phone: "+919876543210"
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.accessToken;

    const profileResponse = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(profileResponse.status).toBe(200);

    expect(profileResponse.body.user.email).toBe(email);
    expect(profileResponse.body.user).toHaveProperty("id");
    expect(profileResponse.body.user).toHaveProperty("role");
    expect(profileResponse.body.user).toHaveProperty("is2FAEnabled");
  });

  it("should reject unauthenticated profile requests", async () => {

    const response = await request(app)
      .get("/api/profile");

    expect(response.status).toBe(401);
  });

});

describe("Logout", () => {
  const logoutEmail = `logout-${Date.now()}@example.com`;
  const logoutPassword = "TestPassword123!";

  let refreshToken: string;

  it("should register and login a user", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: logoutEmail,
        password: logoutPassword,
        phone: "+919876543210",
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: logoutEmail,
        password: logoutPassword,
      });

    expect(loginResponse.status).toBe(200);

    refreshToken = loginResponse.body.refreshToken;

    expect(refreshToken).toBeDefined();
  });

  it("should logout and revoke the refresh token", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Logout successful"
    );
  });

  it("should reject the revoked refresh token", async () => {
    const response = await request(app)
      .post("/api/auth/token/refresh")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Refresh token has been revoked"
    );
  });
});

describe("Role-Based Access Control (RBAC)", () => {

  const userEmail = `rbac-user-${Date.now()}@example.com`;
  const userPassword = "TestPassword123!";

  let userAccessToken: string;

  it("should reject unauthenticated admin requests", async () => {
    const response = await request(app)
      .get("/api/admin/users");

    expect(response.status).toBe(401);
  });

  it("should register and login a normal USER", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: userEmail,
        password: userPassword,
        phone: "+919876543210",
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: userPassword,
      });

    expect(loginResponse.status).toBe(200);

    userAccessToken = loginResponse.body.accessToken;

    expect(userAccessToken).toBeDefined();
  });

  it("should reject a normal USER from accessing admin routes", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(response.status).toBe(403);

    expect(response.body.message).toBe("Access denied");
  });

  it("should allow an ADMIN to access admin routes", async () => {
    const admin = await prisma.user.findUnique({
      where: {
        email: "admin@secureauth.com",
      },
    });

    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("ADMIN");

    const adminLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@secureauth.com",
        password: "AdminPassword123!",
      });

    expect(adminLoginResponse.status).toBe(200);

    const adminAccessToken = adminLoginResponse.body.accessToken;

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("users");
    expect(Array.isArray(response.body.users)).toBe(true);

    if (response.body.users.length > 0) {
      expect(response.body.users[0]).not.toHaveProperty("passwordHash");
    }
  });

});