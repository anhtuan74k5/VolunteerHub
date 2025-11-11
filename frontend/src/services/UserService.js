import { http } from "../utils/BaseUrl";

export const DangNhap = (userLogin) => http.post("/api/auth/login", userLogin);
export const DangKy = (userRegister) => http.post("/api/auth/register/verify", userRegister);
export const OTPDangKy = (email) => http.post("/api/auth/register/send-otp", { email });
export const ResetPassword = (data) => http.post("/api/auth/reset/verify", data);
export const GetUserInfo = () => http.get("/api/auth/me");