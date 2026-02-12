
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    recieverId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    text: {
        maxlength: 2000,
        trim: true,
        type: String,

    },
    image: {
        type: String
    },
    // New fields for generic file support
    fileUrl: {
        type: String,
    },
    fileType: {
        type: String, // 'text', 'image', 'video', 'audio', 'file'
        default: 'text',
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: String, // Storing as string for flexibility (e.g., "5 MB") or number
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, { timestamps: true });

const User = mongoose.model('Message', messageSchema);

export default User; 