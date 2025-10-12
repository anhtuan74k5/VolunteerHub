
import React from 'react';
import { useAuth } from '../content/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    // Nếu chưa đăng nhập (user là null), sẽ không bao giờ được render nếu dùng Router

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h2>Chào mừng, {user?.name || 'Khách'}!</h2>
            <p>Email: {user?.email}</p>
            <p>Vai trò: **{user?.role}**</p>
            <p>Bạn đã đăng nhập thành công!</p>
            <button 
                onClick={logout} 
                style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Đăng Xuất
            </button>
        </div>
    );
};

export default Dashboard;