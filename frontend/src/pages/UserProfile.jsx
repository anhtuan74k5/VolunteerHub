import { useEffect, useState } from "react";
import { Tabs } from "antd";
import moment from "moment";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { GetUserInfo, UpdateUser } from "../services/UserService";
import cats from "../assets/img/cats_b1-removebg-preview.png"
import bear from "../assets/img/bearb1-removebg-preview.png"
import dog from "../assets/img/dog_b1-removebg-preview.png"
import lizard from "../assets/img/lizard-removebg-preview.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const ThongTinNguoiDung = ({ user, onUserUpdated }) => {
    const [editData, setEditData] = useState({});
    const [avatarUrl, setAvatarUrl] = useState("");
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (user) {
            setEditData({
                username: user.username || "",
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                birthday: user.birthday || "",
                status: user.status || "Hoạt động",
                gender: user.gender || "Male",
            });
            setAvatarUrl(user.avatar || "");
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        setAvatarUrl(e.target.value);
    };


    const handleSaveAll = async () => {
        const updatedUser = { ...editData, avatar: avatarUrl };

        try {
            const res = await UpdateUser(updatedUser);
            if (res.status === 200) {
                Swal.fire({
                    title: "Thành công!",
                    text: "Cập nhật thông tin thành công.",
                    icon: "success",
                    confirmButtonText: "OK",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setEditMode(false);
                onUserUpdated(res.data.user || updatedUser);
            }
        } catch (error) {
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể cập nhật thông tin. Vui lòng thử lại.",
                icon: "error",
                confirmButtonText: "Đóng",
                confirmButtonColor: "#DDB958",
            });
            console.error(error);
        }
    };


    return (
        <div
            className="profile-page theme-purple min-h-screen py-[6rem]"
            style={{
                backgroundImage: `
      linear-gradient(to right, #2196F3, #2E64F5),
      linear-gradient(to bottom, transparent 50%, white 50%)
    `,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 50%, 100% 100%',
            }}
        >
            <div className="content relative max-w-[1100px] mx-auto px-6 py-[50px] bg-white rounded-3xl shadow-lg ">
                {/* Ảnh trang trí */}
                <img src={cats} alt="cat" className="absolute -top-[53px] left-[20px] w-[200px] drop-shadow-lg z-10" />
                <img src={bear} alt="bear" className="absolute bottom-[180px] -right-[90px] w-[135px] drop-shadow-lg z-10" />
                <img src={dog} alt="dog" className="absolute bottom-[10px] right-[150px] w-[350px] drop-shadow-lg z-10" />
                <img src={lizard} alt="lizard" className="absolute top-[56px] right-[230px] w-[80px] drop-shadow-lg z-10" style={{ transform: 'scaleY(-1)' }} />

                {/* Header */}
                <div className="absolute top-4 left-0 w-full flex justify-between items-center px-6 text-sm">
                    <div className="content__actions text-center z-10 flex items-center">
                        <span
                            style={{
                                fontSize: "14px",
                                display: "inline-block",
                                padding: "8px 20px",
                                marginLeft: "15px",
                                marginTop: "15px",
                                backgroundColor: "#576CBC",
                                color: "white",
                                borderRadius: "25px",
                                fontWeight: "bold",
                            }}
                        >
                            {user?.role === "VOLUNTEER" ? "TÌNH NGUYỆN VIÊN" : (user?.role || "Người dùng")}
                        </span>

                        {/* Icon chỉnh sửa toàn cục */}
                        <div className="ml-4 mt-4 flex gap-4 text-3xl">
                            {!editMode ? (
                                <button onClick={() => setEditMode(true)} className="text-blue-500">
                                    <EditOutlined />
                                </button>
                            ) : (
                                <button onClick={handleSaveAll} className="text-green-500">
                                    <SaveOutlined />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow mt-4 mr-2 font-bold text-[14px]">
                            🌟 {user?.point || 0} ĐIỂM
                        </div>
                        <div className={`px-4 py-2 rounded-full shadow mt-4 mr-2 font-bold text-[14px] text-white
                            ${user?.status === 'ACTIVE' ? 'bg-green-500' : user?.status === 'LOCKED' ? 'bg-red-500' : 'bg-gray-400'}`}>
                            {user?.status === 'ACTIVE'
                                ? 'ĐANG HOẠT ĐỘNG'
                                : user?.status === 'LOCKED'
                                    ? 'BỊ KHÓA'
                                    : 'Không rõ'}
                        </div>
                    </div>
                </div>

                {/* Avatar */}
                <div className="content__cover relative flex flex-col items-center mt-6">
                    <div
                        className="content__avatar w-[200px] h-[200px] rounded-full bg-cover bg-center relative cursor-pointer -mt-[130px]"
                        style={{
                            backgroundImage: `url(${avatarUrl || "https://tse4.mm.bing.net/th/id/OIP.sDwEr1D6McBY9MeE3a_NpAHaHa"})`,
                        }}
                    >
                        {editMode && (
                            <div className="absolute bottom-0 left-0 w-full bg-white p-2 flex items-center gap-2 rounded-b-full">
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={handleAvatarChange}
                                    placeholder="Nhập URL avatar"
                                    className="flex-1 border border-gray-300 p-1 text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Họ tên */}
                <div className="content__title text-center mt-6 mb-6">
                    {editMode ? (
                        <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleInputChange}
                            className="border-b border-gray-400 text-center text-3xl "
                        />
                    ) : (
                        <h1 className="text-3xl font-semibold text-gray-800">{editData.name}</h1>
                    )}
                </div>

                {/* 2 cột thông tin */}
                <div className="flex justify-between gap-12 content__list mt-6 text-[20px] px-4 py-2">
                    {/* Cột trái */}
                    <ul className="flex-1 space-y-8 [&>li:last-child]:border-b-0">
                        <InfoRow label="Tên đăng nhập" name="username" editData={editData} handleInputChange={handleInputChange} editMode={editMode} />
                        <InfoRow label="Email" name="email" editData={editData} handleInputChange={handleInputChange} editMode={editMode} />
                        <InfoRow label="Giới tính" name="gender" editData={editData} handleInputChange={handleInputChange} type="gender" editMode={editMode} />
                    </ul>

                    {/* Cột phải */}
                    <ul className="flex-1 space-y-8 [&>li:last-child]:border-b-0">
                        <InfoRow label="Số điện thoại" name="phone" editData={editData} handleInputChange={handleInputChange} editMode={editMode} />
                        <InfoRow label="Ngày sinh" name="birthday" editData={editData} handleInputChange={handleInputChange} type="date" editMode={editMode} />
                    </ul>
                </div>
            </div>
        </div>
    );
};

// =================== ROW COMPONENT ===================
const InfoRow = ({ label, name, editData, handleInputChange, editMode, type = "text" }) => {
    const renderGender = () => {
        if (editMode) {
            return (
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name, value: "Male" } })}
                        className={`p-2 rounded ${editData[name] === "Male" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        <FontAwesomeIcon icon={faMars} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name, value: "Female" } })}
                        className={`p-2 rounded ${editData[name] === "Female" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
                    >
                        <FontAwesomeIcon icon={faVenus} />
                    </button>
                </div>
            );
        } else {
            return (
                <span className="flex items-center gap-2 text-3xl">
                    {editData[name] === "Male" ? (
                        <FontAwesomeIcon icon={faMars} className="text-blue-500" />
                    ) : (
                        <FontAwesomeIcon icon={faVenus} className="text-pink-500" />
                    )}
                </span>
            );
        }
    };

    const renderField = () => {
        if (type === "gender") return renderGender();
        if (editMode) {
            if (type === "date") {
                return (
                    <input
                        type="date"
                        name={name}
                        value={editData[name] ? moment(editData[name]).format("YYYY-MM-DD") : ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 flex-1"
                    />
                );
            }
            return (
                <input
                    type="text"
                    name={name}
                    value={editData[name] || ""}
                    onChange={handleInputChange}
                    className="border-b border-gray-400 px-2 py-1 w-[250px] text-gray-700 focus:outline-none focus:border-blue-500 rounded-sm"
                />
            );
        }

        if (type === "date" && editData[name]) {
            return <span className="flex-1 text-gray-600">{moment(editData[name]).format("DD/MM/YYYY")}</span>;
        }

        return <span className="flex-1 text-gray-600">{editData[name]}</span>;
    };

    return (
        <li className="flex items-center gap-3 border-b border-gray-200 pb-6">
            <strong className="w-40">{label}:</strong>
            <div className="flex-1">{renderField()}</div>
        </li>
    );
};

// =================== MAIN COMPONENT ===================
const InforUser = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await GetUserInfo();
                if (res.status === 200) {
                    setUser(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const items = [
        {
            label: (
                <span className="text-[15px] sm:text-[20px] font-bold ml-2">
                    Thông tin tài khoản
                </span>
            ),
            key: 1,
            children: <ThongTinNguoiDung user={user} onUserUpdated={setUser} />,
        },
    ];

    return user ? (
        <Tabs className="pt-[1rem] min-h-[100vh]" items={items} />
    ) : (
        <div className="pt-[6rem] text-center text-red-500 font-bold text-xl">
            Đang tải thông tin người dùng...
        </div>
    );
};

export default InforUser;
