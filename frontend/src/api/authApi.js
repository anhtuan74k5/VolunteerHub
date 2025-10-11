import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000/api" });
export const login = (data) => API.post("/auth/login", data); // expects { identifier, password }
export const getMe = (token) => API.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
export const sendRegisterOtp = (email) => API.post("/otp/register/send-otp", { email });
export const verifyRegisterOtp = (data) => API.post("/otp/register/verify-otp", data);
export const sendResetOtp = (email) => API.post("/otp/reset/send-otp", { email });
export const resetPassword = (data) => API.post("/otp/reset/verify", data);