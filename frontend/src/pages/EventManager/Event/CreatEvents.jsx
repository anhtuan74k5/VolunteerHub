import { useState, useRef } from 'react';
import { Form, Input, Button, DatePicker, Select, Upload } from 'antd';
import { CreatEvents } from '../../../services/EventManagerService';
import { UploadOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function CreateEvent() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const handlePaste = (e) => {
        e.preventDefault();
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');
        const content = html || text;
        if (content) {
            document.execCommand('insertHTML', false, content);
        }
    };

    const handleCoverImage = (fileList) =>
        fileList?.length ? fileList[0].originFileObj : null;

    const handleGalleryImages = (fileList) =>
        Array.isArray(fileList)
            ? fileList.map((f) => f.originFileObj)
            : [];

    const handleCreateEvent = async (values) => {
        setLoading(true);
        try {
            const eventData = {
                ...values,
                date: values.date.format("YYYY-MM-DD"),
                endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
                description,
                coverImage: handleCoverImage(values.coverImage),
                galleryImages: handleGalleryImages(values.galleryImages),
            };

            const formData = new FormData();
            Object.keys(eventData).forEach((key) => {
                if (Array.isArray(eventData[key])) {
                    eventData[key].forEach((item) => formData.append(key, item));
                } else {
                    formData.append(key, eventData[key]);
                }
            });

            const res = await CreatEvents(formData);
            if (res.status === 201) {
                Swal.fire("Thành công!", "Sự kiện đã được tạo", "success");
                navigate("/admin/su-kien");
            } else {
                Swal.fire("Lỗi", "Không thể tạo sự kiện", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi tạo sự kiện", "error");
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">TẠO SỰ KIỆN</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateEvent}
                initialValues={{ category: "Tình nguyện", maxParticipants: 50 }}
            >
                <Form.Item
                    label="Tên sự kiện"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
                >
                    <Input placeholder="Tên sự kiện" size="large" />
                </Form.Item>

                {/* Soạn thảo HTML */}
                <Form.Item
                    label="Mô tả chi tiết"
                    name="description"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => {
                            const html = e.currentTarget.innerHTML;
                            setDescription(html);
                            form.setFieldsValue({ description: html });
                        }}
                        onPaste={handlePaste}
                        style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            padding: '16px',
                            minHeight: '400px',
                            maxHeight: '600px',
                            overflowY: 'auto',
                            backgroundColor: '#fff',
                            fontFamily: 'Georgia, serif',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            color: '#333',
                            outline: 'none'
                        }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </Form.Item>

                <Form.Item
                    label="Ngày bắt đầu"
                    name="date"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                    <DatePicker style={{ width: "100%" }} size="large" />
                </Form.Item>

                <Form.Item
                    label="Ngày kết thúc"
                    name="endDate"
                    rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
                >
                    <DatePicker style={{ width: "100%" }} size="large" />
                </Form.Item>

                <Form.Item
                    label="Địa điểm"
                    name="location"
                    rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
                >
                    <Input placeholder="Địa điểm" size="large" />
                </Form.Item>

                <Form.Item
                    label="Loại sự kiện"
                    name="category"
                    rules={[{ required: true, message: "Vui lòng chọn loại sự kiện" }]}
                >
                    <Select size="large">
                        <Option value="Tình nguyện">Tình nguyện</Option>
                        <Option value="Hội thảo">Hội thảo</Option>
                        <Option value="Giải trí">Giải trí</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Số lượng tham gia tối đa"
                    name="maxParticipants"
                    rules={[{ required: true, message: "Vui lòng nhập số lượng tối đa" }]}
                >
                    <Input type="number" min={1} max={1000} size="large" />
                </Form.Item>

                <Form.Item
                    label="Ảnh bìa"
                    name="coverImage"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "Vui lòng chọn ảnh bìa" }]}
                >
                    <Upload
                        listType="picture"
                        beforeUpload={() => false}
                        accept="image/*"
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />} size="large">
                            Chọn ảnh bìa
                        </Button>
                    </Upload>
                </Form.Item>

                {/* <Form.Item
                    label="Ảnh album"
                    name="galleryImages"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload
                        listType="picture-card"
                        beforeUpload={() => false}
                        accept="image/*"
                        multiple
                    >
                        <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
                    </Upload>
                </Form.Item> */}

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{ width: "100%", background: "#DDB958" }}
                    >
                        Tạo sự kiện
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

// Chuẩn hóa file upload
const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList || [];
};
