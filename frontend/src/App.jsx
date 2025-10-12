import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const nav = { display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" };
  return (
    <BrowserRouter>
      <nav style={nav}>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Tạo tài khoản</Link>
        <Link to="/reset-password">Quên mật khẩu</Link>
        <Link to="/me">Hồ sơ</Link>
      </nav>
      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/me" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}