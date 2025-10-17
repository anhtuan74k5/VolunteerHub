import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending', // Mặc định chờ Manager duyệt
    },
}, { timestamps: true });

// Ngăn một người đăng ký cùng một sự kiện nhiều lần
registrationSchema.index({ event: 1, volunteer: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;