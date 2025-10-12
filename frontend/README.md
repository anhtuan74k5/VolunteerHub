# VolunteerHub Frontend v2
- Trang mặc định: /login (Email hoặc Username + Password)
- /register: Tạo tài khoản (name, birthday, email, username, password, confirmPassword, OTP)
- /reset-password: Email + (Gửi OTP) + OTP + Mật khẩu mới
- /me: Hiển thị thông tin người dùng

Chạy:
npm install
npm start

Lưu ý backend:
- /api/auth/login nên nhận { identifier, password } để hỗ trợ email hoặc username.
- /api/otp/register/verify-otp nhận { name, username, birthday, email, password, otp }.
- /api/otp/reset/verify nhận { email, otp, newPassword }.
