// import { useState, useEffect, useRef } from "react";
// import { Form, Input, Button, DatePicker, Select, Upload, Spin } from "antd";
// import { GetEventById, UpdateEvents } from "../../../services/EventManagerService";
// import { UploadOutlined } from "@ant-design/icons";
// import Swal from "sweetalert2";
// import { useParams, useNavigate } from "react-router-dom";
// import dayjs from "dayjs";

// const { Option } = Select;

// export default function EditEvent() {
//     const { eventId } = useParams();
//     const [form] = Form.useForm();
//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(true);
//     const [description, setDescription] = useState("");
//     const editorRef = useRef(null);

//     // --- Chuẩn hóa file upload ---
//     const normFile = (e) => {
//         if (Array.isArray(e)) return e;
//         return e?.fileList || [];
//     };

//     // --- Convert fileList thành file thật ---
//     const handleCoverImage = (fileList) =>
//         fileList?.length ? fileList[0].originFileObj : null;

//     const handleGalleryImages = (fileList) =>
//         Array.isArray(fileList)
//             ? fileList.map((f) => f.originFileObj)
//             : [];

//     // --- Lấy dữ liệu sự kiện cần sửa ---
//     useEffect(() => {
//         const fetchEvent = async () => {
//             try {
//                 const res = await GetEventById(eventId);
//                 if (res.status === 200) {
//                     const event = res.data;

//                     // Bind vào form
//                     form.setFieldsValue({
//                         name: event.name,
//                         location: event.location,
//                         category: event.category,
//                         maxParticipants: event.maxParticipants,
//                         date: dayjs(event.date),
//                         endDate: event.endDate ? dayjs(event.endDate) : null,
//                     });

//                     setDescription(event.description || "");
//                 }
//             } catch (error) {
//                 console.error(error);
//                 Swal.fire("Lỗi", "Không thể tải dữ liệu sự kiện", "error");
//             }
//             setLoading(false);
//         };

//         fetchEvent();
//     }, [eventId, form]);

//     // --- Xử lý paste trong trình soạn thảo ---
//     const handlePaste = (e) => {
//         e.preventDefault();
//         const html = e.clipboardData.getData("text/html");
//         const text = e.clipboardData.getData("text/plain");
//         const content = html || text;
//         if (content) {
//             document.execCommand("insertHTML", false, content);
//         }
//     };

//     // --- Gửi request cập nhật sự kiện ---
//     const handleUpdateEvent = async (values) => {
//         try {
//             const eventData = {
//                 ...values,
//                 description,
//                 date: values.date.format("YYYY-MM-DD"),
//                 endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
//                 coverImage: handleCoverImage(values.coverImage),
//                 galleryImages: handleGalleryImages(values.galleryImages),
//             };

//             const formData = new FormData();
//             Object.keys(eventData).forEach((key) => {
//                 if (Array.isArray(eventData[key])) {
//                     eventData[key].forEach((item) => formData.append(key, item));
//                 } else {
//                     formData.append(key, eventData[key]);
//                 }
//             });

//             const res = await UpdateEvents(eventId, formData);

//             if (res.status === 200) {
//                 Swal.fire("Thành công!", "Sự kiện đã được cập nhật", "success");
//                 navigate("/admin/su-kien");
//             } else {
//                 Swal.fire("Lỗi", "Không thể cập nhật sự kiện", "error");
//             }
//         } catch (error) {
//             console.error(error);
//             Swal.fire("Lỗi", "Đã xảy ra lỗi khi cập nhật", "error");
//         }
//     };

//     if (loading)
//         return (
//             <div className="w-full flex justify-center py-10">
//                 <Spin size="large" />
//             </div>
//         );

//     return (
//         <div>
//             <h2 className="text-2xl font-bold mb-4">Chỉnh sửa sự kiện</h2>

//             <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={handleUpdateEvent}
//             >
//                 <Form.Item
//                     label="Tên sự kiện"
//                     name="name"
//                     rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
//                 >
//                     <Input placeholder="Tên sự kiện" size="large" />
//                 </Form.Item>

//                 {/* Mô tả HTML */}
//                 <Form.Item
//                     label="Mô tả chi tiết"
//                     name="description"
//                     rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
//                 >
//                     <div
//                         ref={editorRef}
//                         contentEditable
//                         suppressContentEditableWarning
//                         onInput={(e) => {
//                             const html = e.currentTarget.innerHTML;
//                             setDescription(html);
//                             form.setFieldsValue({ description: html });
//                         }}
//                         onPaste={handlePaste}
//                         style={{
//                             border: "1px solid #d9d9d9",
//                             borderRadius: "6px",
//                             padding: "16px",
//                             minHeight: "400px",
//                             maxHeight: "600px",
//                             overflowY: "auto",
//                             backgroundColor: "#fff",
//                             fontFamily: "Georgia, serif",
//                             fontSize: "16px",
//                             lineHeight: "1.8",
//                             color: "#333",
//                             outline: "none",
//                         }}
//                         dangerouslySetInnerHTML={{ __html: description }}
//                     />
//                 </Form.Item>

//                 <Form.Item
//                     label="Ngày bắt đầu"
//                     name="date"
//                     rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
//                 >
//                     <DatePicker style={{ width: "100%" }} size="large" />
//                 </Form.Item>

//                 <Form.Item
//                     label="Ngày kết thúc"
//                     name="endDate"
//                     rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
//                 >
//                     <DatePicker style={{ width: "100%" }} size="large" />
//                 </Form.Item>

//                 <Form.Item
//                     label="Địa điểm"
//                     name="location"
//                     rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
//                 >
//                     <Input placeholder="Địa điểm" size="large" />
//                 </Form.Item>

//                 <Form.Item label="Loại sự kiện" name="category">
//                     <Select size="large">
//                         <Option value="Tình nguyện">Tình nguyện</Option>
//                         <Option value="Hội thảo">Hội thảo</Option>
//                         <Option value="Giải trí">Giải trí</Option>
//                     </Select>
//                 </Form.Item>

//                 <Form.Item
//                     label="Số lượng tối đa"
//                     name="maxParticipants"
//                 >
//                     <Input type="number" min={1} size="large" />
//                 </Form.Item>

//                 {/* Ảnh bìa */}
//                 <Form.Item
//                     label="Ảnh bìa (chọn nếu muốn thay)"
//                     name="coverImage"
//                     valuePropName="fileList"
//                     getValueFromEvent={normFile}
//                 >
//                     <Upload
//                         listType="picture"
//                         beforeUpload={() => false}
//                         accept="image/*"
//                         maxCount={1}
//                     >
//                         <Button icon={<UploadOutlined />} size="large">
//                             Chọn ảnh bìa
//                         </Button>
//                     </Upload>
//                 </Form.Item>

//                 {/* Album ảnh */}
//                 <Form.Item
//                     label="Ảnh album (chọn nếu muốn thay)"
//                     name="galleryImages"
//                     valuePropName="fileList"
//                     getValueFromEvent={normFile}
//                 >
//                     <Upload
//                         listType="picture-card"
//                         beforeUpload={() => false}
//                         accept="image/*"
//                         multiple
//                     >
//                         <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
//                     </Upload>
//                 </Form.Item>

//                 <Form.Item>
//                     <Button
//                         type="primary"
//                         htmlType="submit"
//                         size="large"
//                         style={{ width: "100%", background: "#DDB958" }}
//                     >
//                         Cập nhật sự kiện
//                     </Button>
//                 </Form.Item>
//             </Form>
//         </div>
//     );
// }
