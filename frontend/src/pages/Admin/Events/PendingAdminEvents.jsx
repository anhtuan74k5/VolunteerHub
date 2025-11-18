import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, message } from 'antd';
import { debounce } from 'lodash';
import { GetPendingEvents, ApproveEvent, } from '../../../services/AdminService';
import { ReloadOutlined, CheckOutlined, } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export default function PendingAdminEvents() {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    var navigate = useNavigate();

    const fetchPendingEvents = async () => {
        setLoading(true);
        try {
            const res = await GetPendingEvents();
            if (res.status === 200) {
                setData(res.data);
                setOriginalData(res.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách sự kiện pending');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

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

            const filtered = originalData.filter(event => {
                const name = removeVietnameseTones(event.name || "");
                return name.includes(keyword);
            });

            setData(filtered);
        }, 300),
        [originalData]
    );

    // Duyệt sự kiện
    const handleApproveEvent = async (eventId, name) => {
        const result = await Swal.fire({
            title: `Duyệt sự kiện?`,
            text: name,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DDB958',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        });
        if (!result.isConfirmed) return;

        try {
            const res = await ApproveEvent(eventId);
            if (res.status === 200) {
                Swal.fire('Đã duyệt!', '', 'success');
                fetchPendingEvents();
            } else {
                Swal.fire('Lỗi', 'Không thể duyệt sự kiện', 'error');
            }
        } catch (error) {
            console.error('❌ Lỗi khi duyệt sự kiện:', error);
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi duyệt sự kiện', 'error');
        }
    };

    const handleEventDetail = (eventId) => {
        navigate(`/admin/su-kien/${eventId}`);
    };

    const columns = [
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
            render: (text, event) => (
                <Button
                    type="link"
                    className="font-semibold ml-0 pl-0 !text-blue-600 max-w-[380px] transform transition-transform duration-200 hover:scale-105"
                    onClick={() => handleEventDetail(event._id)}
                    style={{ whiteSpace: "normal", padding: 0 }}
                >
                    <span className="line-clamp-2 text-left block leading-tight py-10">
                        {text}
                    </span>
                </Button>
            )
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            render: date => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
        },
        {
            title: 'Loại sự kiện',
            dataIndex: 'category',
        },
        {
            title: 'Thao tác',
            align: 'center',
            render: (_, event) => (
                <div
                    className="flex items-center justify-center gap-2 cursor-pointer select-none transition-transform duration-300 hover:scale-110 hover:text-green-700"
                    onClick={() => handleApproveEvent(event._id, event.name)}
                    style={{ fontWeight: 500 }}
                >
                    <CheckOutlined style={{ color: 'green', fontSize: 18 }} />
                    <span style={{ color: 'green' }}>DUYỆT</span>
                </div>
            ),
        }

    ];

    return (
        <div className="pendingEvents">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl uppercase font-bold">Duyệt sự kiện</h2>
                <Button icon={<ReloadOutlined />} onClick={fetchPendingEvents} type="default">
                    Tải lại
                </Button>
            </div>

            <Search
                className="mb-4"
                placeholder="Tìm kiếm theo tên sự kiện"
                size="large"
                onChange={e => searchKeyword(e.target.value)}
            />

            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 8 }}
                className='shadow shadow-md rounded-md'
            />
        </div>
    );
}
