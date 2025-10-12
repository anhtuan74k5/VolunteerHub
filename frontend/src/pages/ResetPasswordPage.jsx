import React, { useState } from "react";
import { sendResetOtp, resetPassword } from "../api/authApi";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setStatus("Đang gửi OTP...");
    try {
      const res = await sendResetOtp(email);
      setStatus(res.data?.message || "OTP đã được gửi. Kiểm tra email.");
      setOtpSent(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Không gửi được OTP");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("Đang đặt lại mật khẩu...");
    try {
      const res = await resetPassword({ email, otp, newPassword });
      setStatus(res.data?.message || "Đặt lại mật khẩu thành công!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div>
      <h2>🔁 Quên mật khẩu</h2>
      <form style={{ display: "grid", gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={handleSendOtp}>📩 Gửi OTP</button>
          {otpSent && <span>OTP đã gửi!</span>}
        </div>
        <input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button onClick={handleReset}>Đặt lại mật khẩu</button>
      </form>
      <p style={{ color: "#2b6cb0", marginTop: 12 }}>{status}</p>
    </div>
  );
}