import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Đang đăng nhập...");
    try {
      const res = await login({ identifier, password });
      const token = res.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        setStatus("Đăng nhập thành công!");
        navigate("/me");
      } else {
        setStatus("Không nhận được token từ server.");
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <div>
      <h2>🔑 Đăng nhập</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Email hoặc Tên đăng nhập" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Đăng nhập</button>
      </form>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link to="/register">Tạo tài khoản mới</Link>
        <Link to="/reset-password">Quên mật khẩu?</Link>
      </div>
      <p style={{ color: "#2b6cb0", marginTop: 12 }}>{status}</p>
    </div>
  );
}