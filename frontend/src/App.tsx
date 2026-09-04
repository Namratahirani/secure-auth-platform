
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TwoFactor from "./pages/TwoFactor";
import Verify2FA from "./pages/Verify2FA";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import DeveloperTools from "./pages/DeveloperTools";


import ProtectedRoute from "./components/ProtectedRoute";
import VerifyTOTP from "./pages/VerifyTOTP";

function App() {
  return (
    <Routes>
      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={<Login />}
      />
      

      <Route
  path="/developer-tools"
  element={<DeveloperTools />}
/>


      <Route
  path="/verify-totp"
  element={<VerifyTOTP />}
/>


      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* 2FA verification during login */}
      <Route
        path="/verify-2fa"
        element={<Verify2FA />}
      />

      {/* USER protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="USER">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/2fa"
        element={
          <ProtectedRoute allowedRole="USER">
            <TwoFactor />
          </ProtectedRoute>
        }
      />

      {/* ADMIN protected route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;

