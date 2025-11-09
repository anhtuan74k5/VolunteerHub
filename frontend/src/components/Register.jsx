import React, { useState } from "react";
import { User, Lock, Mail, Calendar } from "lucide-react";
import { useDispatch } from "react-redux";
import { closeModal, openLogin } from "../redux/reducers/UserReducer";
import Swal from "sweetalert2";
import { DangKy, OTPDangKy } from "../services/UserService";
import { useEffect } from "react";
import otp from "../assets/img/otp3.png";

export default function Register() {
    const dispatch = useDispatch();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const [form, setForm] = useState({
        name: "",
        birthday: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        const { email } = form;
        if (!email) {
            Swal.fire("Không thành công", "Vui lòng nhập email trước khi yêu cầu OTP.", "error");
            return;
        }

        try {
            const response = await OTPDangKy(email);
            if (response && response.status === 200) {
                Swal.fire("Thành công", "OTP đã được gửi tới email của bạn.", "success");
            } else {
                const errorMessage = response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.";
                Swal.fire("Không thành công", errorMessage, "error");
            }
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.message || "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.";
                Swal.fire("Không thành công", errorMessage, "error");
            } else {
                console.error("Network error:", error);
                Swal.fire("Không thành công", "Không thể kết nối đến server. Vui lòng thử lại.", "error");
            }
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, birthday, email, username, password, confirmPassword, otp } = form;

        if (!name || !birthday || !email || !username || !password || !confirmPassword || !otp) {
            Swal.fire("Không thành công", "Vui lòng điền đầy đủ thông tin.", "error");
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire("Mật khẩu không khớp", "Vui lòng kiểm tra lại.", "error");
            return;
        }

        try {
            const response = await DangKy({
                name,
                birthday,
                email,
                username,
                password,
                otp,
            });
            console.log(response);
            if (response && response.status === 200) {
                Swal.fire({
                    title: "Đăng ký thành công!",
                    text: "Vui lòng đăng nhập để tiếp tục.",
                    icon: "success",
                    confirmButtonText: "Đăng nhập",
                }).then(() => {
                    dispatch(closeModal());
                    dispatch(openLogin());
                });
            } else {
                Swal.fire("Không thành công", response.message || "Đăng ký thất bại. Vui lòng thử lại.", "error");
            }
        } catch (error) {
            const errorMessage = error.response.data?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.";
            Swal.fire("Không thành công", errorMessage, "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
                {/* Header */}
                <div className="bg-[#2d2d3a] flex justify-between items-center px-5 py-3">
                    <h2 className="text-2xl font-bold text-[#e6c675]">Đăng Ký Tài Khoản</h2>
                    <button
                        onClick={() => dispatch(closeModal())}
                        className="bg-red-600 text-white rounded-md px-2 py-1 hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Name */}
                    <div className="mb-4 flex space-x-4">
                        <div className="w-1/2">
                            <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                                <User size={18} /> Họ và tên:
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                required
                            />
                        </div>

                        {/* Birth */}
                        <div className="w-1/2">
                            <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                                <Calendar size={18} /> Ngày sinh:
                            </label>
                            <input
                                type="date"
                                name="birthday"
                                value={form.birthday}
                                onChange={handleChange}
                                className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                required
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                            <User size={18} /> Tên đăng nhập:
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                            <Lock size={18} /> Mật khẩu:
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            required
                        />
                    </div>

                    {/* RePassword */}
                    <div className="mb-5">
                        <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                            <Lock size={18} /> Xác nhận mật khẩu:
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-[#f5f5f5] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            required
                        />
                    </div>

                    {/* Email and OTP */}
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


                    {/* Submit */}
                    <div className="flex justify-center mb-4 pt-1">
                        <button
                            type="submit"
                            className="bg-[#2d2d3a] text-white font-semibold py-3 rounded-md hover:bg-[#1f1f2b] transition-colors w-[480px] "
                        >
                            Đăng Ký
                        </button>
                    </div>

                    {/* Switch to login */}
                    <div className="text-left pt-2">
                        <p className="text-sm text-gray-700">
                            Đã có tài khoản?{" "}
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
                    </div>

                </form>
            </div>
        </div>
    );
}
