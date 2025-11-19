import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { Mail, Lock } from "lucide-react";
import { closeModal, openLogin } from "../redux/reducers/UserReducer";
import { OTPResetPassword, ResetPassword } from "../services/UserService";
import otp from "../assets/img/Icon_Otp.png"

export default function ForgetPassword() {
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Gửi OTP
    const handleSendOtp = async () => {
        if (!form.email) return Swal.fire("Không thành công", "Vui lòng nhập email", "error");
        setLoading(true);
        try {
            await OTPResetPassword(form.email);
            Swal.fire("Thành công", "OTP đã được gửi đến email của bạn", "success");
            setOtpSent(true);
        } catch (err) {
            Swal.fire("Không thành công", err.response?.data?.message || "Gửi OTP thất bại", "error");
        }
        setLoading(false);
    };

    // Đặt lại mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!form.email || !form.otp || !form.newPassword || !form.confirmPassword) {
            return Swal.fire("Không thành công", "Vui lòng nhập đầy đủ thông tin", "error");
        }
        if (form.newPassword !== form.confirmPassword) {
            return Swal.fire("Không thành công", "Mật khẩu nhập lại không khớp", "error");
        }

        setLoading(true);
        try {
            await ResetPassword({
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword,
            });
            Swal.fire("Thành công", "Mật khẩu đã được cập nhật", "success");
            dispatch(closeModal());
            setTimeout(() => {
                dispatch(openLogin());
            }, 1500);
        } catch (err) {
            Swal.fire("Không thành công", err.response?.data?.message || "Đặt lại mật khẩu thất bại", "error");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
                {/* Header */}
                <div className="bg-[#2d2d3a] flex justify-between items-center px-5 py-5">
                    <h2 className="text-2xl font-bold text-[#e6c675]">Quên Mật Khẩu</h2>
                    <button
                        onClick={() => dispatch(closeModal())}
                        className="bg-red-600 text-white rounded-md px-2 py-1 hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="p-6">
                    {/* Email */}
                    <div className="flex gap-4">
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                                <Mail size={18} /> Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-[300px] bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                                OTP:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Ấn gửi OTP"
                                    value={form.otp}
                                    onChange={handleChange}
                                    className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#1B1B26] hover:bg-[#CDA550] text-sm h-full bg-[#DCBA58] rounded-r-md px-1 border-t border-r border-b border-gray-300 "
                                >
                                    <img
                                        src={otp}
                                        alt="Gửi Otp"
                                        className="w-[40px]"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                            <Lock size={18} /> Mật khẩu mới:
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Nhập mật khẩu mới"
                            value={form.newPassword}
                            onChange={handleChange}
                            className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 text-black"
                            required
                        />
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                            <Lock size={18} /> Xác nhận mật khẩu:
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 text-black"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md text-white font-semibold transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#2d2d3a] hover:bg-[#1f1f2b]"
                            }`}
                    >
                        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>

                    {/* Chuyển về đăng nhập */}
                    <p className="text-center mt-4 text-sm text-gray-700">
                        Nhớ mật khẩu chưa?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                dispatch(closeModal());
                                dispatch(openLogin());
                            }}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
