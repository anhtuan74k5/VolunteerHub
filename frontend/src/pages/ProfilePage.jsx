import React, { useEffect, useState } from "react";
import { getMe } from "../api/authApi";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Chưa đăng nhập.");
      return;
    }
    getMe(token)
      .then((res) => setUser(res.data))
      .catch((err) =>
        setStatus(
          err.response?.data?.message || "Không lấy được thông tin người dùng"
        )
      );
  }, []);

  return (
    <div>
      <h2>👤 Hồ sơ người dùng</h2>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>{status}</p>}
    </div>
  );
}
