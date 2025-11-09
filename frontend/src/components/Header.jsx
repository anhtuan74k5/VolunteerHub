import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import dhcn from "../assets/img/DHCN2.png";
import Login from "./Login";
import Register from "./Register";
import { useDispatch, useSelector } from "react-redux";
import { openLogin, logout } from "../redux/reducers/UserReducer";
import { Dropdown, Menu } from "antd";
import { getLocalStorage, removeLocalStorage, SwalConfig } from "../utils/Configs";
import { LOCALSTORAGE_USER } from "../utils/Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const showLogin = useSelector((state) => state.user.showLogin);
  const showRegister = useSelector((state) => state.user.showRegister);

  const [accountInfo, setAccountInfo] = useState(null);


  const handleLogout = () => {
    Swal.fire({
      title: 'Bạn có muốn đăng xuất không ?',
      showDenyButton: true,
      confirmButtonText: 'Đồng ý',
      denyButtonText: 'Hủy',
      icon: 'question',
      iconColor: 'rgb(104 217 254)',
      confirmButtonColor: '#f97316'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        SwalConfig('Đã đăng xuất', 'success', false);
        removeLocalStorage(LOCALSTORAGE_USER);
      }
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<FontAwesomeIcon icon={faUser} />} onClick={() => navigate('/inforUser')}>
        Thông tin tài khoản
      </Menu.Item>
      <Menu.Item key="2" icon={<FontAwesomeIcon icon={faArrowRightFromBracket} />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY < lastScrollY);
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  return (
    <header
      className={`${showHeader ? "translate-y-0" : "-translate-y-full"} bg-gray-900 text-white py-4 shadow-md fixed top-0 left-0 w-full transition-transform duration-300 z-50`}
    >
      <div className="container mx-auto flex items-center justify-between pl-20 pr-5">
        {/* Logo trường và đoàn */}
        <div className="flex items-center gap-2">
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-DH-Cong-Nghe-UET.png"
            alt="Logo UET"
            className="h-12"
          />
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-Doan-Thanh-NIen-Cong-San-Ho-Chi-Minh-1-768x800.png"
            alt="Logo Đoàn"
            className="h-12"
          />
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-Hoi-Sinh-Vien-Viet-Nam-635x635.png"
            alt="Logo HSV"
            className="h-12"
          />
          <img src={dhcn} alt="Logo DHCN" className="h-12" />
          <nav className="flex gap-6 text-base ml-14">
            <Link to="/" className="hover:text-yellow-400 transition">
              Trang chủ
            </Link>
            <Link to="/hoat-dong" className="hover:text-yellow-400 transition">
              Hoạt động
            </Link>
            <Link to="/quyen-gop" className="hover:text-yellow-400 transition">
              Quyên góp
            </Link>
            <Link to="/tam-guong" className="hover:text-yellow-400 transition">
              Tấm gương tình nguyện
            </Link>
          </nav>
        </div>

        {/* Thanh điều hướng */}


        {/* Nút đăng nhập hoặc avatar */}
        <div className="flex items-center gap-4 ">
          {user ? (
            <Dropdown overlay={menu} trigger={['hover']} placement="bottom" arrow>
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={accountInfo?.body?.avatar || "https://tse4.mm.bing.net/th/id/OIP.sDwEr1D6McBY9MeE3a_NpAHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"}
                  alt="User Avatar"
                  className="w-14 h-14 rounded-full object-cover "
                />
              </div>
            </Dropdown>
          ) : (
            <button
              onClick={() => dispatch(openLogin())}
              className="bg-[#DCBA58] text-black px-4 py-2 rounded-md font-medium hover:bg-[#CDA550] transition"
            >
              Đăng Nhập
            </button>
          )}
        </div>

        {/* Modal đăng nhập / đăng ký */}
        <AnimatePresence>
          {showLogin && <Login />}
          {showRegister && <Register />}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
