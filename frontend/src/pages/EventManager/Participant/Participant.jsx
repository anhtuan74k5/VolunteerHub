import { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Tag, message } from "antd";
import { debounce } from "lodash";
import {
    GetParticipants,
    UpdateParticipantStatus,
    MarkCompletedParticipants,
} from "../../../services/EventManagerService";
import { ReloadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const { Search } = Input;

export default function Participants() {
    const { eventId } = useParams();

    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await GetParticipants(eventId);
            if (res.status === 200) {
                setData(res.data);
                setOriginalData(res.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách tình nguyện viên");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchParticipants();
    }, [eventId]);

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    };

    const searchKeyword = useCallback(
        debounce((value) => {
            const keyword = removeVietnameseTones(value.trim().toLowerCase());

            if (!keyword) {
                setData(originalData);
                return;
            }

            const filtered = originalData.filter((item) => {
                const name = removeVietnameseTones(item.volunteer?.name || "");
                return name.includes(keyword);
            });

            setData(filtered);
        }, 300),
        [originalData]
    );

    const handleUpdateStatus = async (registrationId, status, name) => {
        const actionText = status === "approved" ? "duyệt" : "từ chối";

        const result = await Swal.fire({
            title: `Bạn có chắc muốn ${actionText}?`,
            html: `Tình nguyện viên: <strong>${name}</strong>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#DDB958",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await UpdateParticipantStatus(registrationId, status);

            if (res.status === 200) {
                Swal.fire("Thành công", "Cập nhật trạng thái thành công", "success");
                fetchParticipants();
            } else {
                Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
        }
    };

    const handleMarkComplete = async (registrationId, name) => {
        const result = await Swal.fire({
            title: "Xác nhận hoàn thành?",
            html: `Tình nguyện viên: <strong>${name}</strong>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#DDB958",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await MarkCompletedParticipants(registrationId);
            if (res.status === 200) {
                Swal.fire("Thành công", "Đã đánh dấu hoàn thành", "success");
                fetchParticipants();
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể đánh dấu hoàn thành", "error");
        }
    };

    const columns = [
        {
            title: "Tên tình nguyện viên",
            dataIndex: ["volunteer", "name"],
            sorter: (a, b) =>
                (a.volunteer?.name || "").localeCompare(b.volunteer?.name || ""),
        },
        {
            title: "Email",
            dataIndex: ["volunteer", "email"],
            render: (email) => email || "—",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => {
                const color = {
                    pending: "!text-[#DDB958]",
                    completed: "!text-blue-500",
                    approved: "!text-green-500",
                }[status] || "!text-red-500";

                return (
                    <Tag className={`!ml-0 !pl-0 !border-none !bg-transparent !font-semibold !text-[14px] ${color}`}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: "Thao tác",
            align: "center",
            render: (_, record) => (
                <div className="flex flex-col gap-2 justify-center items-center">
                    {record.status === "pending" && (
                        <>
                            {/* Duyệt */}
                            <Button
                                className="hover:bg-green-600 hover:scale-105 transition-all"
                                onClick={() =>
                                    handleUpdateStatus(
                                        record._id,
                                        "approved",
                                        record.volunteer?.name
                                    )
                                }
                                style={{
                                    width: 80,
                                    height: 30,
                                    background: "#22C55E",
                                    border: "none",
                                    fontWeight: "500",
                                    color: "white"
                                }}
                            >
                                <span style={{ fontSize: 14 }}>Duyệt</span>
                            </Button>

                            {/* Từ chối */}
                            <Button
                                className="hover:bg-red-600 hover:scale-105 transition-all"
                                onClick={() =>
                                    handleUpdateStatus(
                                        record._id,
                                        "rejected",
                                        record.volunteer?.name
                                    )
                                }
                                style={{
                                    width: 80,
                                    height: 30,
                                    background: "#EA4343",
                                    color: "white",
                                    border: "none",
                                    fontWeight: "500",
                                }}
                            >
                                <span style={{ fontSize: 14 }}>Từ chối</span>
                            </Button>
                        </>
                    )}

                    {record.status === "approved" && (
                        <Button
                            className="hover:bg-blue-700 hover:scale-105 transition-all"
                            onClick={() =>
                                handleMarkComplete(
                                    record._id,
                                    record.volunteer?.name
                                )
                            }
                            style={{
                                width: 100,
                                height: 30,
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                fontWeight: "500",
                            }}
                        >
                            <span style={{ fontSize: 14 }}>Hoàn thành</span>
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl uppercase font-bold">Tình Nguyện Viên</h2>
                <Button icon={<ReloadOutlined />} onClick={fetchParticipants}>
                    Tải lại
                </Button>
            </div>

            <Search
                placeholder="Tìm kiếm theo tên tình nguyện viên"
                size="large"
                onChange={(e) => searchKeyword(e.target.value)}
                className="mb-4"
            />

            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="shadow shadow-md rounded-md"
            />
        </div>
    );
}
