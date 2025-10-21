import { http } from "../utils/BaseUrl";

export const DangNhap = (userLogin) => http.post("/auth/login", userLogin);
export const DangKy = (userRegister) => http.post("/otp/register/verify-otp", userRegister);
export const OTPDangKy = (email) => http.post("/otp/register/send-otp", { email });
export const ResetPassword = (data) => http.post("/auth/reset-password", data);
export const GetUserInfo = () => http.get("/auth/me")