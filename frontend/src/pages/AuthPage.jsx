import React, { useState } from 'react';
import { useAuth } from '../content/AuthContext';
import './AuthPage.css'; 

const AuthPage = () => {
    // State để chuyển đổi giữa form đăng nhập và đăng ký
    const [isLogin, setIsLogin] = useState(true); 
    
    // State để lưu trữ dữ liệu người dùng nhập vào form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    // State để hiển thị lỗi từ server và thông báo thành công
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false); // Flag để phân biệt lỗi và thông báo

    // Lấy hàm signin và signup từ AuthContext
    const { signin, signup } = useAuth();

    const { name, email, password } = formData;

    // Hàm xử lý khi người dùng thay đổi input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage(''); // Xóa thông báo khi người dùng bắt đầu nhập
    };

    // Hàm xử lý khi người dùng submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            if (isLogin) {
                // Chế độ đăng nhập
                await signin({ email, password });
                // App.jsx sẽ tự động chuyển hướng sang Dashboard vì user state đã thay đổi
            } else {
                // Chế độ đăng ký
                const response = await signup({ name, email, password });
                setMessage(response.message); // Hiển thị thông báo thành công
                setIsError(false);
                setIsLogin(true); // Chuyển về form đăng nhập sau khi đăng ký thành công
                setFormData({ name: '', email: email, password: '' }); 
            }
        } catch (err) {
            // Lấy lỗi từ response của API và hiển thị
            setMessage(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
            setIsError(true);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
                
                {/* Hiển thị thông báo hoặc lỗi */}
                {message && (
                    <p className={isError ? 'error-message' : 'success-message'}
                       style={{ color: isError ? '#f44336' : '#4CAF50', fontWeight: 'bold' }}>
                        {message}
                    </p>
                )}
                
                {/* Chỉ hiển thị trường "Tên" ở chế độ đăng ký */}
                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="name">Tên</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                </button>

                <p className="toggle-form">
                    {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? ' Đăng ký ngay' : ' Đăng nhập'}
                    </span>
                </p>
            </form>
        </div>
    );
};

export default AuthPage;
