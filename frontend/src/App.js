import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import VolunteerActivities from "./pages/VolunteerActivities";
import Donation from "./pages/Donation";

// 👇 1. IMPORT CÁC HÀM CẦN THIẾT
import { subscribeUserToPush } from './utils/notificationService';
import { getLocalStorage } from './utils/Configs'; 
import { LOCALSTORAGE_USER } from './utils/Constants';

class App extends Component {

  // 👇 2. THÊM HÀM LIFECYCLE 'componentDidMount'
  // Hàm này sẽ tự động chạy 1 lần khi App được tải
  componentDidMount() {
    // Kiểm tra xem người dùng đã đăng nhập (còn token) chưa
    const user = getLocalStorage(LOCALSTORAGE_USER);
    
    if (user?.accessToken) {
      // Nếu đã đăng nhập, KÍCH HOẠT đăng ký nhận thông báo
      console.log("App mounted, user is logged in. Subscribing to push...");
      subscribeUserToPush();
    }
  }

  render() {
    return (
      <Router>
        <Header />
        <div className="pt-20"> {/* thêm padding để tránh header che */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hoat-dong" element={<VolunteerActivities />} />
            <Route path="/quyen-gop" element={<Donation />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    );
  }
}

export default App;