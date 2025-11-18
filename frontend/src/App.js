import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import VolunteerActivities from "./pages/VolunteerActivities";
import Donation from "./pages/Donation";
import UserProfile from "./pages/UserProfile";
import AdminTemplate from "./templates/AdminTemplate";
import UserTemplate from "./templates/UserTemplate";
import EventManagerTemplate from "./templates/EventManagerTemplate";
import Users from "./pages/Admin/User/User";
import NotFound from "./pages/NotFound";
import EventDetail from "./pages/EventDetail";
import AdminEvents from "./pages/Admin/Events/AdminEvents";
import PendingEvents from "./pages/Admin/Events/PendingAdminEvents";
import EventManagerEvents from "./pages/EventManager/Event/EventManagerEvents";
import CreateEvent from "./pages/EventManager/Event/CreatEvents";
import AdminEventDetail from "./pages/Admin/Events/AdminEventDetail";
import Participants from "./pages/EventManager/Participant/Participant";
// import EditEvent from "./pages/EventManager/Event/EditEvent";

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
        <Routes>
          {/* User routes */}
          <Route path='/' element={<UserTemplate />}>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/khong-co" element={<NotFound />} />
            <Route path="/trang-chu" element={<HomePage />} />
            <Route path="/hoat-dong" element={<VolunteerActivities />} />
            <Route path="/quyen-gop" element={<Donation />} />
            <Route path="/thong-tin-ca-nhan" element={<UserProfile />} />
            <Route path="su-kien/:eventId" element={<EventDetail />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminTemplate />}>
            <Route path="nguoi-dung" element={<Users />} />
            <Route path="su-kien" element={<AdminEvents />} />
            <Route path="su-kien/cho-duyet" element={<PendingEvents />} />
            <Route path="su-kien/:eventId" element={<AdminEventDetail />} />
          </Route>
          {/* Manager routes */}
          <Route path="/quanlisukien" element={<EventManagerTemplate />}>
            <Route path="su-kien/:eventId/participants" element={<Participants />} />
            <Route path="su-kien" element={<EventManagerEvents />} />
            <Route path="su-kien/tao" element={<CreateEvent />} />
            {/* <Route path="su-kien/sua/:eventId" element={<EditEvent />} /> */}
            <Route path="su-kien/:eventId" element={<AdminEventDetail />} />
          </Route>
        </Routes>
      </Router>
    );
  }
}

export default App;