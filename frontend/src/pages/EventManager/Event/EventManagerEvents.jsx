import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, message, Tag } from 'antd';
import { debounce } from 'lodash';
import { GetManagerEvents, DeleteEvents } from '../../../services/EventManagerService';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export default function EventManagerEvents() {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await GetManagerEvents();
            if (res.status === 200) {
                setData(res.data);
                setOriginalData(res.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự kiện:', error);
            message.error('Không thể tải danh sách sự kiện');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
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

    const handleDeleteEvent = async (eventId, name) => {
        const result = await Swal.fire({
            title: `Xác nhận xóa sự kiện?`,
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
            const res = await DeleteEvents(eventId);
            if (res.status === 200) {
                Swal.fire('Đã xóa!', '', 'success');
                fetchEvents();
            } else {
                Swal.fire('Lỗi', 'Không thể xóa sự kiện', 'error');
            }
        } catch (error) {
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa sự kiện', 'error');
        }
    };

    const handleEditEvent = (eventId) => {
        navigate(`/quanlisukien/su-kien/sua/${eventId}`);
    };

    const columns = [
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            sorter: (a, b) => a.name?.toLowerCase().localeCompare(b.name?.toLowerCase()),
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            sorter: (a, b) => (a.location ?? '').toLowerCase().localeCompare((b.location ?? '').toLowerCase()),
            render: (text) => text || '—',
        },

        {
            title: 'Số lượng tham gia',
            dataIndex: 'currentParticipants',
            render: (count, event) => (
                <Button
                    type="link"
                    className="font-semibold text-blue-600 hover:text-blue-800 "
                    onClick={() => navigate(`/quanlisukien/su-kien/${event._id}/participants`)}
                >
                    {count ?? 0}
                </Button>
            )
        },

        {
            title: 'Số lượng tối đa',
            dataIndex: 'maxParticipants',
            sorter: (a, b) => (a.maxParticipants ?? 0) - (b.maxParticipants ?? 0),
            render: (count) => count ?? '—',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => {
                const color = {
                    pending: 'text-[#DDB958]',
                    completed: 'text-blue-500',
                    approved: 'text-green-500'
                }[status] || 'text-red-500';

                return (
                    <Tag className={`ml-0 pl-0 border-none bg-transparent font-semibold text-[14px] ${color}`}>
                        {status.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            align: 'center',
            render: (_, event) => (
                <>
                    <Button
                        type="text"
                        danger
                        icon={
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="text-red-500 hover:text-red-700 text-lg"
                            />
                        }
                        onClick={() => handleDeleteEvent(event._id, event.name)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-blue-500 hover:text-blue-700 text-lg" />}
                        onClick={() => handleEditEvent(event._id)}
                    />
                </>
            )
        }
    ];


    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl uppercase font-bold">Quản lý sự kiện</h2>
                <Button icon={<ReloadOutlined />} onClick={fetchEvents}>Tải lại</Button>
            </div>

            <Search
                placeholder="Tìm kiếm theo tên sự kiện"
                size="large"
                onChange={e => searchKeyword(e.target.value)}
                className="mb-4"
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
