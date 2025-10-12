import React, { useState } from "react";
import { sendRegisterOtp, verifyRegisterOtp } from "../api/authApi";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", birthday: "", email: "", username: "", password: "", confirmPassword: "", otp: "" });
  const [status, setStatus] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) { setStatus("Vui lòng nhập email trước khi gửi OTP"); return; }
    setStatus("Đang gửi OTP...");
    try {
      const res = await sendRegisterOtp(form.email);
      setStatus(res.data?.message || "Đã gửi OTP. Kiểm tra email.");
      setOtpSent(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Không gửi được OTP");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setStatus("Mật khẩu không khớp."); return; }
    if (!form.otp) { setStatus("Vui lòng nhập OTP."); return; }
    setStatus("Đang tạo tài khoản...");
    try {
      const payload = { name: form.name, email: form.email, username: form.username, birthday: form.birthday, password: form.password, otp: form.otp };
      const res = await verifyRegisterOtp(payload);
      setStatus(res.data?.message || "Tạo tài khoản thành công!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Tạo tài khoản thất bại");
    }
  };

  return (
    <div>
      <h2>🆕 Tạo tài khoản mới</h2>
      <form style={{ display: "grid", gap: 12 }}>
        <input name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} required />
        <input name="birthday" type="date" placeholder="Ngày sinh" value={form.birthday} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="username" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} required />

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={handleSendOtp}>📩 Gửi OTP</button>
          {otpSent && <span>OTP đã gửi! Kiểm tra email.</span>}
        </div>

        <input name="otp" placeholder="Nhập OTP từ email" value={form.otp} onChange={handleChange} required />
        <button onClick={handleRegister}>Tạo tài khoản</button>
      </form>
      <p style={{ color: "#2b6cb0", marginTop: 12 }}>{status}</p>
    </div>
  );
}