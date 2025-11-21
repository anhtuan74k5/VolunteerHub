import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetEventDetail } from "../services/EventService";
import { Calendar, Users, MapPin, Tag, Phone } from "lucide-react";
import { Registration, CancelRegistration, GetMyEvent } from "../services/UserService";
import Swal from "sweetalert2";

export default function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationStatus, setRegistrationStatus] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await GetEventDetail(eventId);
                if (res.status === 200) setEvent(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        }
        load();
    }, [eventId]);

    useEffect(() => {
        async function checkRegistrationStatus() {
            try {
                const res = await GetMyEvent();
                if (res.status === 200) {
                    const eventData = res.data.find(
                        e => String(e.event._id) === String(eventId)
                    );

                    if (eventData) {
                        setRegistrationStatus(eventData.status);
                    } else {
                        setRegistrationStatus("");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        checkRegistrationStatus();
    }, [eventId]);

    const handleRegister = async () => {
        if (registrationStatus === "pending" || registrationStatus === "approved") {
            Swal.fire({
                icon: "warning",
                title: "Bạn đã đăng ký hoặc đang chờ duyệt!",
                text: "Bạn không thể đăng ký lại vào lúc này.",
                confirmButtonText: "OK",
            });
            return;
        }

        try {
            const res = await Registration(eventId);
            if (res.status === 201) {
                setRegistrationStatus("pending");
                Swal.fire({
                    icon: "success",
                    title: "Đăng ký thành công",
                    text: "Bạn đã đăng ký tham gia sự kiện và đang chờ duyệt.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#DDB958"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Đăng ký thất bại",
                    text: "Có lỗi xảy ra khi đăng ký sự kiện.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#DDB958"
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Đăng ký thất bại",
                text: "Đã xảy ra lỗi. Vui lòng thử lại.",
                confirmButtonText: "OK",
                confirmButtonColor: "#DDB958"
            });
        }
    };

    const handleCancelRegistration = async () => {
        const result = await Swal.fire({
            title: "Bạn có chắc chắn muốn hủy đăng ký?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hủy đăng ký",
            confirmButtonColor: "#DDB958",
            cancelButtonText: "Thôi",
            cancelButtonColor: "#d33"
        });

        if (result.isConfirmed) {
            try {
                const res = await CancelRegistration(eventId);
                if (res.status === 200) {
                    setRegistrationStatus("");
                    Swal.fire({
                        icon: "success",
                        title: "Hủy đăng ký thành công",
                        text: "Bạn đã hủy đăng ký tham gia sự kiện.",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#DDB958"
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Hủy đăng ký thất bại",
                        text: "Có lỗi xảy ra khi hủy đăng ký.",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#DDB958"
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "Hủy đăng ký thất bại",
                    text: "Đã xảy ra lỗi. Vui lòng thử lại.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#DDB958"
                });
            }
        }
    };

    if (loading) return <p className="text-center mt-10 text-lg">Đang tải...</p>;
    if (!event) return <p className="text-center mt-10 text-lg text-red-500">Không tìm thấy sự kiện!</p>;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const renderDescription = (description, galleryImages) => {
        if (!description || !Array.isArray(galleryImages)) return description;

        let html = description;

        galleryImages.forEach((img, index) => {
            const realUrl = `http://localhost:5000${img}`;
            html = html.replaceAll(`{{image_${index}}}`, realUrl);
        });

        return html;
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden text-[#111827] my-4">
            {/* Tiêu đề */}
            <h1 className="text-4xl sm:text-4xl font-bold px-6 !pt-8">{event.name}</h1>

            {/* Ảnh */}
            <img
                src={event.coverImage ? `http://localhost:5000${event.coverImage}` : "/default-event.png"}
                alt={event.name}
                className="w-full h-full object-cover px-6 py-8"
            />

            {/* Nút quay lại */}
            <div className="px-6 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline font-semibold"
                >
                    ← Quay lại
                </button>
            </div>

            {/* Thông tin chi tiết */}
            <div className="px-12 py-8 text-gray-700 flex flex-col sm:flex-row gap-10">
                <div className="flex flex-col gap-6 flex-1">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} />
                        <span>
                            <strong>Ngày tổ chức:</strong> {formatDate(event.date)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Tag size={20} />
                        <span>
                            <strong>Loại sự kiện:</strong> {event.category || "Khác"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin size={20} />
                        <span>
                            <strong>Địa điểm:</strong> {event.location}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-6 flex-1">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} />
                        <span>
                            <strong>Ngày kết thúc:</strong> {formatDate(event.endDate)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Users size={20} />
                        <span>
                            <strong>Số người tham gia:</strong> {event.currentParticipants || 0}/{event.maxParticipants || 50}
                        </span>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Phone size={20} />
                        </div>
                        <span className="break-words">
                            <strong>Thắc mắc liên hệ:</strong> {event.createdBy?.phone || "0123456789"} ({event.createdBy?.name || "Nguyễn Trường Nam"})
                        </span>
                    </div>
                </div>
            </div>

            {/* Mô tả sự kiện */}
            <div className="px-6 pb-12">
                <h2 className="text-3xl font-semibold mb-4">Mô tả sự kiện</h2>
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: renderDescription(event.description, event.galleryImages)
                    }}
                />

            </div>

            {/* Nút đăng ký / hủy */}
            <div className="flex items-center justify-center mt-4 px-6 pb-8 relative">
                {registrationStatus === "pending" && (
                    <span className="text-white bg-gray-500 p-2 rounded-md font-semibold">
                        Đang chờ duyệt
                    </span>
                )}

                {registrationStatus === "approved" && (
                    <span className="text-green-600 font-medium">
                        Đăng ký thành công
                    </span>
                )}

                {registrationStatus === "completed" && (
                    <span className="text-green-600 font-semibold">
                        Đã hoàn thành sự kiện
                    </span>
                )}
                {registrationStatus === "rejected" && (
                    <span className="text-red-600 font-medium">
                        Bạn đã bị từ chối tham gia sự kiện
                    </span>
                )}

                {/* Nút đăng ký - Căn giữa */}
                {registrationStatus === "" && (
                    <button
                        onClick={handleRegister}
                        className="px-4 py-2 bg-[#DDB958] text-white rounded-md hover:bg-[#CDA550] font-semibold"
                    >
                        Đăng ký tham gia
                    </button>
                )}

                {/* Nút hủy - Bên phải (absolute) */}
                {registrationStatus !== "" && registrationStatus !== "completed" && registrationStatus !== "rejected" && (
                    <button
                        onClick={handleCancelRegistration}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-semibold absolute right-6"
                    >
                        Hủy đăng ký
                    </button>
                )}
            </div>
        </div>
    );
}
