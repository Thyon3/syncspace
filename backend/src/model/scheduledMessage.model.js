import mongoose from 'mongoose';

const scheduledMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    text: {
        type: String,
        maxlength: 2000,
    },
    image: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
    fileType: {
        type: String,
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: String,
    },
    scheduledTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending',
    },
    sentAt: {
        type: Date,
    },
    failureReason: {
        type: String,
    },
    timezone: {
        type: String,
        default: 'UTC',
    }
}, { timestamps: true });

// Index for efficient scheduled message processing
scheduledMessageSchema.index({ scheduledTime: 1, status: 1 });

const ScheduledMessage = mongoose.model('ScheduledMessage', scheduledMessageSchema);

export default ScheduledMessage;