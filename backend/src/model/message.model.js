
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },

    chatId: {
        type: mongoose.Types.ObjectId,
        ref: 'Chat',
        required: false, // Optional for backward compatibility during migration
    },
    recieverId: {
        required: false, // Made optional as we move to chatId
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    replyTo: {
        type: mongoose.Types.ObjectId,
        ref: 'Message',
        required: false,
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
    isEdited: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const User = mongoose.model('Message', messageSchema);

export default User; 