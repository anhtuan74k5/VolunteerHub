import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Lấy token từ Local Storage khi khởi tạo
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };
    
    // Logic: Kiểm tra Token khi ứng dụng tải lần đầu
    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token); 
                // Kiểm tra token hết hạn
                if (decodedUser.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Lấy user info từ payload của JWT
                    // Note: Nếu bạn muốn lấy thêm chi tiết user (name, role,...) từ DB, bạn có thể gọi API ở đây
                    setUser(decodedUser); 
                }
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                logout(); 
            }
        }
        setLoading(false);
    }, [token]); // Thêm token vào dependencies để logic chạy lại khi token thay đổi

    const signup = async (userData) => {
        // Sử dụng URL Backend
        const response = await axios.post('http://localhost:5000/api/auth/signup', userData);
        return response.data;
    };

    const signin = async (credentials) => {
        // Sử dụng URL Backend
        const response = await axios.post('http://localhost:5000/api/auth/signin', credentials);
        
        const { token: newToken, user: userData } = response.data;

        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // Lưu thông tin user từ response vào state (Tùy chọn: Có thể dùng decoded token thay thế)
            setUser(userData); 
        }
        return response.data;
    };
    
    // Trong khi đang kiểm tra token, hiển thị Loading
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Đang kiểm tra phiên đăng nhập...</div>;
    }

    return (
        <AuthContext.Provider value={{ token, user, signup, signin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
