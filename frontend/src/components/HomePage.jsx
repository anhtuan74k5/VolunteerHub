import React from "react";
import { motion } from "framer-motion";
import dhcn from "../assets/img/aodoan.jpg";
import anh2 from "../assets/img/tapthe.jpeg";
import { useDispatch } from "react-redux";
import { openRegister } from "../redux/reducers/UserReducer";

const HomePage = () => {
    const dispatch = useDispatch();

    const handleRegisterClick = () => {
        dispatch(openRegister());
    };
    return (
        <div className="flex flex-col w-full overflow-hidden gap-10" style={{ background: "#F9FAFB" }}>
            {/* =================== PHẦN 1 =================== */}
            <motion.div
                className="flex flex-col md:flex-row-reverse w-full h-screen"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <motion.div
                    className="md:w-1/2 w-full h-1/2 md:h-full"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <motion.img
                        src={anh2}
                        alt="Thanh niên tình nguyện"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        whileHover={{ scale: 1.05 }}
                    />
                </motion.div>

                <motion.div
                    className="md:w-1/2 w-full flex flex-col justify-center items-start px-10 py-12 bg-gray-50"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                >
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                        style={{ color: "#DBBA58" }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        Về Chúng Tôi
                    </motion.h1>

                    <motion.p
                        className="text-gray-600 text-lg"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Tình Nguyện UET là một tổ chức phi lợi nhuận hoạt động tại trường Đại học Công Nghệ ĐHQG Hà Nội (UET). Hằng năm, chúng tôi tổ chức nhiều hoạt động hướng về vùng cao, vùng khó khăn như: Chương trình “Mùa đông ấm” mang quần áo, sách vở và đồ dùng thiết yếu đến với các em nhỏ vùng núi, chiến dịch “Mùa hè xanh” - tham gia xây dựng, dọn dẹp thôn xóm, hỗ trợ dạy học hè cho trẻ em. Bên cạnh các chuyến đi xa, UET cũng tổ chức nhiều hoạt động thiện nguyện tại địa phương như: Ngày hội hiến máu “Giọt hồng tri ân” thu hút hàng trăm sinh viên, giảng viên tham gia mỗi năm, sự kiện “Chủ Nhật Xanh” nhằm xây dựng cảnh quan môi trường luôn “xanh-sạch-đẹp”.
                    </motion.p>
                </motion.div>
            </motion.div>

            {/* =================== DÒNG CHỮ GIỮA 2 SECTION =================== */}
            <motion.div
                id="middle"
                className="w-full h-[42vh] flex items-center justify-center"
                style={{ lineHeight: "1.3" }}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.h2
                    className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600 tracking-wide"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    style={{ lineHeight: "1.3" }}
                >
                    Sức Trẻ - Nhiệt Huyết - Cống Hiến
                </motion.h2>
            </motion.div>

            {/* =================== PHẦN 2 =================== */}
            <motion.div
                className="flex flex-col md:flex-row w-full h-screen"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <motion.div
                    className="md:w-1/2 w-full h-1/2 md:h-full"
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <motion.img
                        src={dhcn}
                        alt="Đại học Công nghệ"
                        className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                        whileHover={{ scale: 1.05 }}
                    />
                </motion.div>

                <motion.div
                    className="md:w-1/2 w-full flex flex-col justify-center items-start px-10 py-12 bg-gray-50"
                    initial={{ x: 100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                >
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                        style={{ color: "#DBBA58" }}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Tuổi Trẻ Công Nghệ
                    </motion.h1>

                    <motion.p
                        className="text-gray-600 text-lg"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Mỗi người chỉ có một lần sống vì tuổi trẻ. Khi quãng thời gian đẹp nhất qua đi, chúng ta sẽ trưởng thành với những lo âu bộn bề của cuộc sống. Tuổi trẻ không quá ngắn và cũng không quá dài, vậy tại sao chúng ta không dám sống hết mình, cống hiến hết mình khi có sức trẻ và lòng nhiệt huyết dâng trào!
                    </motion.p>

                    <motion.a
                        href="#"
                        className="mt-8 inline-block text-white px-6 py-3 rounded-lg shadow-md bg-[#DCBA58] hover:bg-[#CDA550] transition"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={(e) => {
                            e.preventDefault();
                            handleRegisterClick();
                        }}
                    >
                        Đăng Ký Ngay →
                    </motion.a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HomePage;
